import { useState, useEffect } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { writeContract } from "@wagmi/core";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { TabSwitcher } from "./TabSwitcher";

import { ActionButton } from "@ui";

import { getTokenData, getTransactionReceipt, formatNumber, cn } from "@utils";

import { IMetaVaultABI, ERC20ABI, sonicClient, wagmiConfig } from "@web3";

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
  }>({
    deposit: [],
    withdraw: [],
  });

  const [button, setButton] = useState<string>("none");

  const [value, setValue] = useState("");

  const [balances, setBalances] = useState({});

  const [allowance, setAllowance] = useState(0);

  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const [needConfirm, setNeedConfirm] = useState(false);

  const handleMaxInputChange = () => {
    if ($connected) {
      handleInputChange({
        target: {
          value: balances[activeAsset[actionType]?.address].balance,
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

    const balance = balances[activeAsset[actionType]?.address].balance;

    if (!Number(numericValue)) {
      setButton("");
    } else if (actionType === TransactionTypes.Deposit) {
      if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) > Number(allowance)) {
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
    }

    setValue(numericValue);
  };

  const approve = async () => {
    setTransactionInProgress(true);
    const depositToken = activeAsset.deposit.address;

    const decimals = activeAsset.deposit.decimals;

    const amount = Number(value);

    if (depositToken && $account && amount) {
      try {
        const approveSum = parseUnits(String(amount), decimals);

        setNeedConfirm(true);
        const depositApprove = await writeContract(wagmiConfig, {
          address: depositToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [metaVault.address, approveSum],
        });
        setNeedConfirm(false);

        const transaction = await getTransactionReceipt(depositApprove);

        if (transaction?.status === "success") {
          lastTx.set(transaction?.transactionHash);

          const newAllowance = await sonicClient.readContract({
            address: depositToken as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, metaVault.address as TAddress],
          });

          let parsedAllowance = Number(
            formatUnits(newAllowance, activeAsset.deposit.decimals)
          );

          setAllowance(parsedAllowance);

          if (Number(parsedAllowance) >= Number(amount)) {
            setButton("Deposit");
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        const newAllowance = await sonicClient.readContract({
          address: depositToken as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, metaVault.address as TAddress],
        });

        let parsedAllowance = Number(
          formatUnits(newAllowance, activeAsset.deposit.decimals)
        );

        setAllowance(parsedAllowance);

        if (Number(parsedAllowance) >= Number(amount)) {
          setButton("Deposit");
        }

        console.error("Approve error:", error);
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
      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "depositAssets",
        args: [[activeAsset.deposit.address], [_value], shares, $account],
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Deposit error:", error);
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
      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "withdrawAssets",
        args: [[activeAsset.withdraw.address], _value, [shares]],
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setValue("");
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Deposit error:", error);
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
    }
  };

  const getData = async () => {
    try {
      const newBalances: Record<
        string,
        { bigIntBalance: bigint; balance: string }
      > = {};

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

      if ($account) {
        const metaVaultAllowance = await sonicClient.readContract({
          address: assetsForDeposit[0] as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, metaVault.address as TAddress],
        });

        const metaVaultBalance = (await sonicClient.readContract({
          address: metaVault.address,
          abi: IMetaVaultABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        })) as bigint;

        const decimals =
          getTokenData(assetsForDeposit[0].toLowerCase())?.decimals || 18;

        let parsedAllowance = Number(formatUnits(metaVaultAllowance, decimals));

        if (parsedAllowance) {
          setAllowance(parsedAllowance);
        }

        assetsForDeposit.forEach((address) => {
          const key = address.toLowerCase();

          const _decimals = getTokenData(key)?.decimals || 18;

          const bigIntBalance = $assetsBalances[146]?.[key] ?? BigInt(0);

          newBalances[key] = {
            bigIntBalance,
            balance: formatUnits(bigIntBalance, _decimals),
          };
        });

        assetsForWithdraw.forEach((address) => {
          const key = address.toLowerCase();

          newBalances[key] = {
            bigIntBalance: metaVaultBalance,
            balance: formatUnits(metaVaultBalance, 18),
          };
        });

        setBalances(newBalances);
      }

      setFormAssets({
        deposit: assetsForDeposit.map((asset) =>
          getTokenData(asset.toLowerCase())
        ) as TTokenData[],
        withdraw: assetsForWithdraw.map((asset) =>
          getTokenData(asset.toLowerCase())
        ) as TTokenData[],
      });

      setActiveAsset({
        deposit: getTokenData(assetsForDeposit[0].toLowerCase()) as TTokenData,
        withdraw: getTokenData(
          assetsForWithdraw[0].toLowerCase()
        ) as TTokenData,
      });
    } catch (error) {
      console.error("Get data error:", error);
    }
  };

  useEffect(() => {
    if (metaVault.address) {
      getData();
    }
  }, [$account, $lastTx, $assetsPrices, metaVault, $assetsBalances]);

  useEffect(() => {
    setButton("");
    setValue("");
  }, [actionType]);

  return (
    <WagmiLayout>
      <div className="p-6 bg-[#101012] border border-[#23252A] rounded-lg w-full lg:w-[352px] self-start mt-0 lg:mt-[115px]">
        <TabSwitcher actionType={actionType} setActionType={setActionType} />
        <div className="bg-[#1B1D21] border border-[#23252A] rounded-lg py-3 px-4 flex items-center gap-3">
          <img
            src={activeAsset[actionType].logoURI}
            alt={activeAsset[actionType].symbol}
            title={activeAsset[actionType].symbol}
            className="w-4 h-4 rounded-full"
          />
          <span className="text-[16px] leading-6 font-medium">
            {activeAsset[actionType].symbol}
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
                balances[activeAsset[actionType]?.address].balance,
                "format"
              )}
            </div>
          ) : null}
        </label>
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
