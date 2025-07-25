import { useState, useEffect } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { writeContract } from "@wagmi/core";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { TabSwitcher } from "./TabSwitcher";
import { TokensDisplay } from "./TokensDisplay";

import { ActionButton } from "@ui";

import {
  getTokenData,
  getTransactionReceipt,
  formatNumber,
  cn,
  exactToFixed,
} from "@utils";

import { getWrappingPairs } from "../../functions/getWrappingPairs";

import { DEFAULT_TRANSACTION_SETTINGS, META_VAULTS_TYPE } from "@constants";

import {
  IMetaVaultABI,
  ERC20ABI,
  sonicClient,
  wagmiConfig,
  WrappedMetaVaultABI,
} from "@web3";

import {
  account,
  assetsBalances,
  assetsPrices,
  connected,
  lastTx,
} from "@store";

import { TransactionTypes, TAddress, TMetaVault, TTokenData } from "@types";

interface IProps {
  metaVault: TMetaVault;
}

const Form: React.FC<IProps> = ({ metaVault }) => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const [actionType, setActionType] = useState<TransactionTypes>(
    TransactionTypes.Deposit
  );

  const [activeAsset, setActiveAsset] = useState<{
    deposit: TTokenData;
    withdraw: TTokenData;
    wrap: TTokenData;
    unwrap: TTokenData;
  }>({
    deposit: {} as TTokenData,
    withdraw: {} as TTokenData,
    wrap: {} as TTokenData,
    unwrap: {} as TTokenData,
  });

  // @dev - State needed for multiple option
  const [formAssets, setFormAssets] = useState<{
    deposit: TTokenData[];
    withdraw: TTokenData[];
    wrap: {};
    unwrap: {};
  }>({
    deposit: [],
    withdraw: [],
    wrap: {},
    unwrap: {},
  });

  const [button, setButton] = useState<string>("none");

  const [value, setValue] = useState("");

  const [balances, setBalances] = useState({
    deposit: {},
    withdraw: {},
    wrap: {},
    unwrap: {},
  });

  const [allowance, setAllowance] = useState({ deposit: 0, wrap: 0 });

  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const [needConfirm, setNeedConfirm] = useState(false);

  const [maxWithdraw, setMaxWithdraw] = useState(0);

  const getGasLimit = async (
    address: TAddress,
    functionName: string,
    params: any[]
  ) => {
    try {
      const abi = [TransactionTypes.Wrap, TransactionTypes.Unwrap].includes(
        actionType
      )
        ? WrappedMetaVaultABI
        : IMetaVaultABI;

      const gas = await sonicClient.estimateContractGas({
        address: address,
        abi: abi,
        functionName: functionName,
        args: params,
        account: $account as TAddress,
      });

      const gasLimit = BigInt(
        Math.trunc(Number(gas) * Number(DEFAULT_TRANSACTION_SETTINGS.gasLimit))
      );

      if (gasLimit) {
        return gasLimit;
      }

      return BigInt(10000);
    } catch (error) {
      console.error("Failed to get gasLimit", error);
    }
  };

  const getAllowance = async (token: string, spender: string) =>
    sonicClient.readContract({
      address: token as TAddress,
      abi: ERC20ABI,
      functionName: "allowance",
      args: [$account as TAddress, spender as TAddress],
    });

  const getBalance = async (address: string, abi: any) =>
    (await sonicClient.readContract({
      address: address as TAddress,
      abi,
      functionName: "balanceOf",
      args: [$account as TAddress],
    })) as bigint;

  const errorHandler = (err: Error) => {
    lastTx.set("No transaction hash...");
    if (err instanceof Error) {
      // const errorData = {
      //   state: true,
      //   type: err.name,
      //   description: getShortMessage(err.message),
      // };
    }
    alert("TX ERROR");
    setValue("");
    setButton("");
    setNeedConfirm(false);
    console.error("ERROR:", err);
  };

  const handleMaxInputChange = () => {
    if ($connected) {
      const balance = exactToFixed(
        Object.values(balances?.[actionType])[0]?.balance,
        2
      );

      handleInputChange({
        target: {
          value: balance,
        },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    let numericValue = inputValue.replace(/[^0-9.]/g, "");

    numericValue = numericValue.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    const value = Number(numericValue);

    const balance = Number(
      Object.values(balances?.[actionType] || {})[0]?.balance || 0
    );
    const depositAllowance = Number(allowance.deposit || 0);
    const wrapAllowance = Number(allowance.wrap || 0);

    if (
      actionType === TransactionTypes.Withdraw &&
      value > Number(maxWithdraw)
    ) {
      numericValue = String(maxWithdraw);
    }
    if (!value) {
      setButton("");
    } else if (value > balance) {
      setButton("insufficientBalance");
    } else {
      switch (actionType) {
        case TransactionTypes.Deposit:
          setButton(value > depositAllowance ? "Approve" : "Deposit");
          break;

        case TransactionTypes.Withdraw:
          setButton("Withdraw");
          break;

        case TransactionTypes.Wrap:
          setButton(value > wrapAllowance ? "Approve" : "Wrap");
          break;

        case TransactionTypes.Unwrap:
          setButton("Unwrap");
          break;

        default:
          setButton("");
          break;
      }
    }

    setValue(numericValue);
  };

  const approve = async () => {
    setTransactionInProgress(true);

    try {
      const isDeposit = actionType === TransactionTypes.Deposit;

      const depositToken = isDeposit
        ? activeAsset.deposit.address
        : activeAsset.wrap.address;

      const decimals = isDeposit
        ? activeAsset.deposit.decimals
        : metaVault.symbol !== "metaUSD"
          ? activeAsset.withdraw.decimals
          : 18;

      const amount = Number(value);
      if (!depositToken || !$account || !amount) {
        setTransactionInProgress(false);
        return;
      }

      const approveSum = parseUnits(String(amount), decimals);

      setNeedConfirm(true);

      const contractAddress = isDeposit
        ? metaVault.address
        : activeAsset.unwrap.address;
      const params = [contractAddress, approveSum];

      const gasLimit = await getGasLimit(depositToken, "approve", params);

      const depositApprove = await writeContract(wagmiConfig, {
        address: depositToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(depositApprove);
      if (transaction?.status === "success") {
        lastTx.set(transaction.transactionHash);

        const allowanceAddress = isDeposit
          ? depositToken
          : activeAsset.wrap.address;
        const allowanceArgs = [
          $account as TAddress,
          isDeposit ? metaVault.address : activeAsset.unwrap.address,
        ];

        const newAllowance = await sonicClient.readContract({
          address: allowanceAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: allowanceArgs,
        });

        const parsedAllowance = Number(
          formatUnits(newAllowance, activeAsset[actionType].decimals)
        );

        setAllowance((prev) => ({ ...prev, [actionType]: parsedAllowance }));

        if (parsedAllowance >= amount) {
          setButton(isDeposit ? "Deposit" : "Wrap");
        }
      }
    } catch (error) {
      setNeedConfirm(false);

      try {
        const isDeposit = actionType === TransactionTypes.Deposit;

        const tokenAddress = isDeposit
          ? activeAsset.deposit.address
          : activeAsset.wrap.address;

        const newAllowance = await sonicClient.readContract({
          address: tokenAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            $account as TAddress,
            isDeposit ? metaVault.address : activeAsset.unwrap.address,
          ],
        });

        const parsedAllowance = Number(
          formatUnits(newAllowance, activeAsset.deposit.decimals)
        );
        setAllowance((prev) => ({ ...prev, [actionType]: parsedAllowance }));

        if (parsedAllowance >= Number(value)) {
          setButton(isDeposit ? "Deposit" : "Wrap");
        }
      } catch {}

      if (error instanceof Error) {
        errorHandler(error);
      }
    } finally {
      setTransactionInProgress(false);
    }
  };

  const deposit = async () => {
    setTransactionInProgress(true);

    const decimals = activeAsset.deposit.decimals;

    const amount = Number(value);

    const _value = parseUnits(String(amount), decimals);

    const shares = parseUnits(String(amount - (amount * 5) / 100), decimals); // 5 = slippage

    try {
      setNeedConfirm(true);

      const params = [
        [activeAsset.deposit.address],
        [_value],
        shares,
        $account,
      ];

      const gasLimit = await getGasLimit(
        metaVault.address,
        "depositAssets",
        params
      );

      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "depositAssets",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorHandler(error);
      }
    }
    setTransactionInProgress(false);
  };

  const withdraw = async () => {
    setTransactionInProgress(true);

    const decimals = activeAsset.withdraw.decimals;

    const amount = Number(value);

    const _value = parseUnits(String(amount), 18);

    const shares = parseUnits(String(amount - (amount * 5) / 100), decimals); // 5 = slippage

    try {
      setNeedConfirm(true);

      const params = [[activeAsset.withdraw.address], _value, [shares]];

      const gasLimit = await getGasLimit(
        metaVault.address,
        "withdrawAssets",
        params
      );

      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "withdrawAssets",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorHandler(error);
      }
    }
    setTransactionInProgress(false);
  };

  const wrap = async () => {
    setTransactionInProgress(true);

    const decimals =
      metaVault.symbol != "metaUSD" ? activeAsset.withdraw.decimals : 18;

    const shares = parseUnits(value, decimals);

    try {
      setNeedConfirm(true);

      const params = [shares, $account];

      const gasLimit = await getGasLimit(
        activeAsset.unwrap.address,
        "deposit",
        params
      );

      const _action = await writeContract(wagmiConfig, {
        address: activeAsset.unwrap.address,
        abi: WrappedMetaVaultABI,
        functionName: "deposit",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorHandler(error);
      }
    }
    setTransactionInProgress(false);
  };

  const unwrap = async () => {
    setTransactionInProgress(true);

    const decimals =
      metaVault.symbol != "metaUSD" ? activeAsset.withdraw.decimals : 18;

    const shares = parseUnits(value, decimals);

    try {
      setNeedConfirm(true);

      const params = [shares, $account, $account];

      const gasLimit = await getGasLimit(
        activeAsset.unwrap.address,
        "withdraw",
        params
      );

      const _action = await writeContract(wagmiConfig, {
        address: activeAsset.unwrap.address,
        abi: WrappedMetaVaultABI,
        functionName: "withdraw",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorHandler(error);
      }
    }
    setTransactionInProgress(false);
  };

  const formHandler = async () => {
    const actionsMap: Record<string, () => Promise<void>> = {
      Approve: approve,
      Deposit: deposit,
      Withdraw: withdraw,
      Wrap: wrap,
      Unwrap: unwrap,
    };

    const action = actionsMap[button];
    if (action) {
      await action();
    }
  };

  const getData = async () => {
    try {
      const [assetsForDeposit, assetsForWithdraw, maxWithdrawAmountTx] =
        await Promise.all([
          sonicClient.readContract({
            address: metaVault.address,
            abi: IMetaVaultABI,
            functionName: "assetsForDeposit",
          }),
          sonicClient.readContract({
            address: metaVault.address,
            abi: IMetaVaultABI,
            functionName: "assetsForWithdraw",
          }),
          sonicClient.readContract({
            address: metaVault.address,
            abi: IMetaVaultABI,
            functionName: "maxWithdrawAmountTx",
          }),
        ]);

      if (maxWithdrawAmountTx) {
        setMaxWithdraw(formatUnits(maxWithdrawAmountTx, 18));
      }

      const { wrap, unwrap } = getWrappingPairs(metaVault, assetsForDeposit);

      const withdraw = getTokenData(
        assetsForWithdraw[0].toLowerCase()
      ) as TTokenData;

      if (!$account) return;

      const [
        metaVaultAllowance,
        wrappedMetaVaultAllowance,
        metaVaultBalance,
        wrapMetaVaultBalance,
      ] = await Promise.all([
        getAllowance(assetsForDeposit[0], metaVault.address),
        getAllowance(wrap.address, unwrap.address),
        getBalance(metaVault.address, IMetaVaultABI),
        getBalance(unwrap.address, WrappedMetaVaultABI),
      ]);

      const decimals =
        getTokenData(assetsForDeposit[0].toLowerCase())?.decimals || 18;

      setAllowance({
        deposit: Number(formatUnits(metaVaultAllowance, decimals)),
        wrap: Number(formatUnits(wrappedMetaVaultAllowance, 18)),
      });

      const newBalances: Record<string, any> = {
        deposit: {},
        withdraw: {},
        wrap: {},
        unwrap: {},
      };

      const chainBalances = $assetsBalances[146] ?? {};

      assetsForDeposit.forEach((address) => {
        const key = address.toLowerCase();
        const token = getTokenData(key);
        const bigIntBalance = chainBalances[key] ?? BigInt(0);

        newBalances.deposit[key] = {
          bigIntBalance,
          balance: formatUnits(bigIntBalance, token?.decimals || 18),
        };
      });

      const metaVaultFormatted = formatUnits(metaVaultBalance, 18);
      const unwrapDecimals =
        metaVault.symbol !== "metaUSD" ? withdraw.decimals : 18;

      assetsForWithdraw.forEach((address) => {
        const key = address.toLowerCase();

        newBalances.withdraw[key] = {
          bigIntBalance: metaVaultBalance,
          balance: metaVaultFormatted,
        };
      });

      const wrapKey = wrap.address;
      const unwrapKey = unwrap.address;

      newBalances.wrap[wrapKey] =
        META_VAULTS_TYPE[metaVault.symbol] === "multiVault"
          ? Object.values(newBalances.deposit)[0]
          : {
              bigIntBalance: metaVaultBalance,
              balance: metaVaultFormatted,
            };

      newBalances.unwrap[unwrapKey] = {
        bigIntBalance: wrapMetaVaultBalance,
        balance: formatUnits(wrapMetaVaultBalance, unwrapDecimals),
      };

      setBalances(newBalances);

      const formatAssets = (assets: string[]) =>
        assets.map((asset) =>
          getTokenData(asset.toLowerCase())
        ) as TTokenData[];

      setFormAssets({
        deposit: formatAssets(assetsForDeposit),
        withdraw: formatAssets(assetsForWithdraw),
        wrap,
        unwrap,
      });

      setActiveAsset({
        deposit: getTokenData(assetsForDeposit[0].toLowerCase()) as TTokenData,
        withdraw,
        wrap,
        unwrap,
      });
    } catch (error) {
      console.error("Get data error:", error);
    }
  };

  useEffect(() => {
    if (metaVault.address) {
      getData();
      console.log(formAssets);
    }
  }, [$account, $lastTx, $assetsPrices, metaVault, $assetsBalances]);

  useEffect(() => {
    setButton("");
    setValue("");
  }, [actionType]);

  return (
    <WagmiLayout>
      <div className="p-6 bg-[#101012] border border-[#23252A] rounded-lg self-start w-full xl:w-[352px]">
        <TabSwitcher actionType={actionType} setActionType={setActionType} />
        <TokensDisplay
          actionType={actionType}
          symbol={metaVault.symbol}
          activeAsset={activeAsset}
        />

        <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] my-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value={value}
              onChange={handleInputChange}
              className="bg-transparent text-2xl font-semibold outline-none w-full"
            />
            <div
              className={cn(
                "bg-[#151618] border border-[#23252A] rounded-lg px-3 py-1 text-[14px]",
                $connected && "cursor-pointer"
              )}
              onClick={handleMaxInputChange}
            >
              MAX
            </div>
          </div>
          {Object.keys(balances).length && !!activeAsset[actionType] ? (
            <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
              Balance:{" "}
              {formatNumber(
                Object.values(balances?.[actionType])[0]?.balance || 0,
                "format"
              )}
            </div>
          ) : null}
        </label>
        {/* {actionType === TransactionTypes.Withdraw && (
          <div className="text-[#909193] text-[14px] leading-5 font-medium mb-3">
            Max withdraw next tx: {formatNumber(maxWithdraw, "format")}
          </div>
        )} */}
        {/* <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#97979A] text-[16px] leading-6">
                Max Slippage
              </span>
              <img src="/icons/questionmark.svg" alt="Question mark" />
            </div>
            <span className="text-[16px] leading-6 font-semibold">0.50%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#97979A] text-[16px] leading-6">
                Completion time
              </span>
              <img src="/icons/questionmark.svg" alt="Question mark" />
            </div>
            <span className="text-[16px] leading-6 font-semibold">
              ~ 48 hours
            </span>
          </div>
        </div> */}
        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={formHandler}
        />
      </div>
    </WagmiLayout>
  );
};
export { Form };
