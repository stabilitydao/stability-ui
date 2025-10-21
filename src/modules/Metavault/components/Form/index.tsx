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
  setLocalStoreHash,
  getAllowance,
  getBalance,
} from "@utils";

import { getWrappingPairs } from "../../functions/getWrappingPairs";

import { DEFAULT_TRANSACTION_SETTINGS } from "@constants";

import {
  IMetaVaultABI,
  ERC20ABI,
  wagmiConfig,
  WrappedMetaVaultABI,
  web3clients,
} from "@web3";

import {
  account,
  assetsBalances,
  assetsPrices,
  connected,
  lastTx,
} from "@store";

import {
  TransactionTypes,
  TAddress,
  TMetaVault,
  TTokenData,
  VaultTypes,
  MetaVaultDisplayTypes,
} from "@types";

interface IProps {
  network: string;
  metaVault: TMetaVault;
  displayType: MetaVaultDisplayTypes;
}

const Form: React.FC<IProps> = ({ network, metaVault, displayType }) => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const client = web3clients[network as keyof typeof web3clients];

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

      const gas = await client.estimateContractGas({
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
    } catch (error) {
      console.error("Failed to get gasLimit", error);
    }

    return BigInt(10000);
  };

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

      handleInputChange(balance);
    }
  };

  const handleInputChange = (inputValue: string) => {
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

        const newAllowance = await client.readContract({
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

        const newAllowance = await client.readContract({
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

    const shares = parseUnits(String(amount - (amount * 10) / 100), 18); // 10 = slippage

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

      const txTokens = {
        [activeAsset.deposit.address]: {
          amount: amount,
          symbol: activeAsset.deposit.symbol,
          logo: activeAsset.deposit.logoURI,
        },
      };

      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: _action,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: metaVault.address,
        tokens: txTokens,
      });

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

    const shares = parseUnits(String(amount - (amount * 10) / 100), decimals); // 10 = slippage

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

      const txTokens = {
        [activeAsset.withdraw.address]: {
          amount: amount,
          symbol: activeAsset.withdraw.symbol,
          logo: activeAsset.withdraw.logoURI,
        },
      };

      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: _action,
        status: transaction?.status || "reverted",
        type: "withdraw",
        vault: metaVault.address,
        tokens: txTokens,
      });

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

      const txTokens = {
        [activeAsset.wrap.address]: {
          amount: value,
          symbol: activeAsset.wrap.symbol,
          logo: activeAsset.wrap.logoURI,
        },
      };

      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: _action,
        status: transaction?.status || "reverted",
        type: "wrap",
        vault: metaVault.address,
        tokens: txTokens,
      });

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

      const assets = (await client.readContract({
        address: activeAsset.unwrap.address,
        abi: WrappedMetaVaultABI,
        functionName: "convertToAssets",
        args: [shares],
      })) as bigint;

      const params = [assets, $account, $account];

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

      const txTokens = {
        [activeAsset.unwrap.address]: {
          amount: value,
          symbol: activeAsset.unwrap.symbol,
          logo: activeAsset.unwrap.logoURI,
        },
      };

      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: _action,
        status: transaction?.status || "reverted",
        type: "unwrap",
        vault: metaVault.address,
        tokens: txTokens,
      });

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
          client.readContract({
            address: metaVault.address,
            abi: IMetaVaultABI,
            functionName: "assetsForDeposit",
          }),
          client.readContract({
            address: metaVault.address,
            abi: IMetaVaultABI,
            functionName: "assetsForWithdraw",
          }),
          client.readContract({
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
        getAllowance(
          client,
          assetsForDeposit?.[0],
          $account,
          metaVault.address
        ),
        getAllowance(client, wrap.address, $account, unwrap.address),
        getBalance(client, metaVault.address, $account),
        getBalance(client, unwrap.address, $account),
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

      const chainBalances = $assetsBalances[network] ?? {};

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
        metaVault.type === VaultTypes.MultiVault
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
      <div
        className={cn(
          "p-6 bg-[#101012] border border-[#23252A] rounded-lg self-start",
          displayType === MetaVaultDisplayTypes.Lite
            ? "w-full xl:w-[352px]"
            : "w-full"
        )}
      >
        <TabSwitcher actionType={actionType} setActionType={setActionType} />

        <TokensDisplay
          actionType={actionType}
          type={metaVault.type}
          activeAsset={activeAsset}
        />

        <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] my-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value={value}
              onChange={(e) => handleInputChange(e?.target?.value)}
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

        <ActionButton
          type={button}
          network={network}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={formHandler}
        />
      </div>
    </WagmiLayout>
  );
};
export { Form };
