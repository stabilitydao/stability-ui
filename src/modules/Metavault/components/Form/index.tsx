import { useState, useEffect } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { writeContract } from "@wagmi/core";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { TabSwitcher } from "./TabSwitcher";

import { ActionButton } from "@ui";

import { getTokenData, getTransactionReceipt, formatNumber, cn } from "@utils";

import {
  IMetaVaultABI,
  ERC20ABI,
  sonicClient,
  wagmiConfig,
  WrappedMetaVaultABI,
} from "@web3";

import { DEFAULT_TRANSACTION_SETTINGS, META_VAULTS_TYPE } from "@constants";

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
  }>({
    deposit: {} as TTokenData,
    withdraw: {} as TTokenData,
  });

  // @dev - State needed for multiple option
  const [formAssets, setFormAssets] = useState<{
    deposit: TTokenData[];
    withdraw: TTokenData[];
    wrap: {};
  }>({
    deposit: [],
    withdraw: [],
    wrap: {},
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
      handleInputChange({
        target: {
          value: Object.values(balances?.[actionType])[0]?.balance,
        },
      });
    }
  };

  const handleInputChange = (e) => {
    let numericValue = e.target.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue?.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue?.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    const balance = Object.values(balances?.[actionType])[0]?.balance;

    if (
      Number(numericValue) > Number(maxWithdraw) &&
      actionType === TransactionTypes.Withdraw
    ) {
      numericValue = maxWithdraw;
    }

    if (!Number(numericValue)) {
      setButton("");
    } else if (actionType === TransactionTypes.Deposit) {
      if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) > Number(allowance.deposit)) {
        setButton("Approve");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Deposit");
      }
    } else if (actionType === TransactionTypes.Withdraw) {
      if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Withdraw");
      }
    } else if (actionType === TransactionTypes.Wrap) {
      if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) > Number(allowance.wrap)) {
        setButton("Approve");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Wrap");
      }
    } else if (actionType === TransactionTypes.Unwrap) {
      if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Unwrap");
      }
    }

    setValue(numericValue);
  };

  const approve = async () => {
    setTransactionInProgress(true);
    const depositToken =
      TransactionTypes.Deposit === actionType
        ? activeAsset.deposit.address
        : activeAsset.wrap.address;

    const decimals =
      TransactionTypes.Deposit === actionType
        ? activeAsset.deposit.decimals
        : metaVault.symbol != "metaUSD"
          ? activeAsset.withdraw.decimals
          : 18;

    const amount = Number(value);

    if (depositToken && $account && amount) {
      try {
        const approveSum = parseUnits(String(amount), decimals);

        setNeedConfirm(true);

        const params = [
          TransactionTypes.Deposit === actionType
            ? metaVault.address
            : activeAsset.unwrap.address,
          approveSum,
        ];

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
          lastTx.set(transaction?.transactionHash);

          const newAllowance = await sonicClient.readContract({
            address:
              TransactionTypes.Deposit === actionType
                ? depositToken
                : activeAsset.wrap.address,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [
              $account as TAddress,
              TransactionTypes.Deposit === actionType
                ? metaVault.address
                : activeAsset.unwrap.address,
            ],
          });

          let parsedAllowance = Number(
            formatUnits(newAllowance, activeAsset[actionType].decimals)
          );

          setAllowance((prev) => ({ ...prev, [actionType]: parsedAllowance }));

          if (Number(parsedAllowance) >= Number(amount)) {
            setButton(
              TransactionTypes.Deposit === actionType ? "Deposit" : "Wrap"
            );
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        const newAllowance = await sonicClient.readContract({
          address:
            TransactionTypes.Deposit === actionType
              ? depositToken
              : activeAsset.wrap.address,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            $account as TAddress,
            TransactionTypes.Deposit === actionType
              ? metaVault.address
              : activeAsset.unwrap.address,
          ],
        });

        let parsedAllowance = Number(
          formatUnits(newAllowance, activeAsset.deposit.decimals)
        );

        setAllowance((prev) => ({ ...prev, [actionType]: parsedAllowance }));

        if (Number(parsedAllowance) >= Number(amount)) {
          setButton(
            TransactionTypes.Deposit === actionType ? "Deposit" : "Wrap"
          );
        }

        if (error instanceof Error) {
          errorHandler(error);
        }
      }
    }

    setTransactionInProgress(false);
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
    if (button === "Approve") {
      await approve();
    } else if (button === "Deposit") {
      await deposit();
    } else if (button === "Withdraw") {
      await withdraw();
    } else if (button === "Wrap") {
      await wrap();
    } else if (button === "Unwrap") {
      await unwrap();
    }
  };

  const getData = async () => {
    try {
      const newBalances: Record<
        string,
        { bigIntBalance: bigint; balance: string }
      > = {
        deposit: {},
        withdraw: {},
        wrap: {},
        unwrap: {},
      };

      const assetsForDeposit = await sonicClient.readContract({
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "assetsForDeposit",
      });

      const assetsForWithdraw = await sonicClient.readContract({
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "assetsForWithdraw",
      });

      const maxWithdrawAmountTx = await sonicClient.readContract({
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "maxWithdrawAmountTx",
      });

      if (maxWithdrawAmountTx) {
        setMaxWithdraw(formatUnits(maxWithdrawAmountTx, 18));
      }

      let wrap = {};
      let unwrap = {};

      if (META_VAULTS_TYPE[metaVault.symbol] === "multiVault") {
        wrap = getTokenData(assetsForDeposit[0].toLowerCase());

        if (metaVault.symbol === "metaUSDC") {
          unwrap = {
            address: "0xeeeeeee6d95e55a468d32feb5d6648754d10a967",
            symbol: "wmetaUSDC",
          };
        }

        if (metaVault.symbol === "metascUSD") {
          unwrap = {
            address: "0xcccccccca9fc69a2b32408730011edb3205a93a1",
            symbol: "wmetascUSD",
          };
        }

        if (metaVault.symbol === "metawS") {
          unwrap = {
            address: "0xffffffff2fcbefae12f1372c56edc769bd411685",
            symbol: "wmetawS",
          };
        }
      } else if (META_VAULTS_TYPE[metaVault.symbol] === "metaVault") {
        wrap = metaVault;
        if (metaVault.symbol === "metaUSD") {
          unwrap = {
            address: "0xaaaaaaaac311d0572bffb4772fe985a750e88805",
            symbol: "wmetaUSD",
          };
        } else {
          unwrap = {
            address: "0xbbbbbbbbbd0ae69510ce374a86749f8276647b19",
            symbol: "wmetaS",
          };
        }
      }

      if ($account) {
        const metaVaultAllowance = await sonicClient.readContract({
          address: assetsForDeposit[0] as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, metaVault.address as TAddress],
        });

        const wrappedMetaVaultAllowance = await sonicClient.readContract({
          address: wrap.address as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, unwrap.address as TAddress],
        });

        const metaVaultBalance = (await sonicClient.readContract({
          address: metaVault.address,
          abi: IMetaVaultABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        })) as bigint;

        const wrapMetaVaultBalance = (await sonicClient.readContract({
          address: unwrap.address,
          abi: WrappedMetaVaultABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        })) as bigint;

        const decimals =
          getTokenData(assetsForDeposit[0].toLowerCase())?.decimals || 18;

        let parsedAllowance = Number(formatUnits(metaVaultAllowance, decimals));

        let parsedWrappedAllowance = Number(
          formatUnits(wrappedMetaVaultAllowance, 18)
        );

        setAllowance({
          deposit: parsedAllowance,
          wrap: parsedWrappedAllowance,
        });

        assetsForDeposit.forEach((address) => {
          const key = address.toLowerCase();

          const _decimals = getTokenData(key)?.decimals || 18;

          const bigIntBalance = $assetsBalances[146]?.[key] ?? BigInt(0);

          newBalances.deposit[key] = {
            bigIntBalance,
            balance: formatUnits(bigIntBalance, _decimals),
          };
        });

        assetsForWithdraw.forEach((address) => {
          const key = address.toLowerCase();

          newBalances.withdraw[key] = {
            bigIntBalance: metaVaultBalance,
            balance: formatUnits(metaVaultBalance, 18),
          };
        });

        const wrapKey = wrap.address;
        const unwrapKey = unwrap.address;

        if (META_VAULTS_TYPE[metaVault.symbol] === "multiVault") {
          newBalances.wrap[wrapKey] = Object.values(newBalances.deposit)[0];
        } else {
          newBalances.wrap[wrapKey] = {
            bigIntBalance: metaVaultBalance,
            balance: formatUnits(metaVaultBalance, 18),
          };
        }

        newBalances.unwrap[unwrapKey] = {
          bigIntBalance: wrapMetaVaultBalance,
          balance: formatUnits(
            wrapMetaVaultBalance,
            metaVault.symbol != "metaUSD" ? activeAsset.withdraw.decimals : 18
          ),
        };

        setBalances(newBalances);
      }

      setFormAssets({
        deposit: assetsForDeposit.map((asset) =>
          getTokenData(asset.toLowerCase())
        ) as TTokenData[],
        withdraw: assetsForWithdraw.map((asset) =>
          getTokenData(asset.toLowerCase())
        ) as TTokenData[],
        wrap,
        unwrap,
      });

      setActiveAsset({
        deposit: getTokenData(assetsForDeposit[0].toLowerCase()) as TTokenData,
        withdraw: getTokenData(
          assetsForWithdraw[0].toLowerCase()
        ) as TTokenData,
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
        <div className="bg-[#1B1D21] border border-[#23252A] rounded-lg py-3 px-4 flex items-center gap-3">
          {([TransactionTypes.Wrap, TransactionTypes.Unwrap].includes(
            actionType
          ) &&
            META_VAULTS_TYPE[metaVault.symbol] === "metaVault") ||
          (TransactionTypes.Unwrap === actionType &&
            META_VAULTS_TYPE[metaVault.symbol] === "multiVault") ? (
            <img
              src={`/features/${activeAsset?.[actionType].symbol}.png`}
              alt={activeAsset?.[actionType].symbol}
              title={activeAsset?.[actionType].symbol}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <img
              src={activeAsset?.[actionType].logoURI}
              alt={activeAsset?.[actionType].symbol}
              title={activeAsset?.[actionType].symbol}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span className="text-[16px] leading-6 font-medium">
            {activeAsset?.[actionType].symbol}
          </span>
        </div>

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
        {actionType === TransactionTypes.Withdraw && (
          <div className="text-[#909193] text-[14px] leading-5 font-medium mb-3">
            Max withdraw next tx: {formatNumber(maxWithdraw, "format")}
          </div>
        )}
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
