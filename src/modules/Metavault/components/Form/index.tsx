import { useState, useEffect } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { writeContract } from "@wagmi/core";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { ActionButton } from "@ui";

import { cn, capitalize, getTokenData, getTransactionReceipt } from "@utils";

import { IMetaVaultABI, ERC20ABI, sonicClient, wagmiConfig } from "@web3";

import { account, assetsBalances, assetsPrices, lastTx } from "@store";

import { TransactionTypes, TAddress } from "@types";

interface IProps {
  metaVault: any;
}

const Form: React.FC<IProps> = ({ metaVault }) => {
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const [actionType, setActionType] = useState<TransactionTypes>(
    TransactionTypes.Deposit
  );

  const [actionAssets, setActionAssets] = useState({
    deposit: false,
    withdraw: false,
  });

  const [button, setButton] = useState<string>("none");

  const [value, setValue] = useState("");

  const [balances, setBalances] = useState({});

  const [allowance, setAllowance] = useState(0);

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const handleInputChange = (e) => {
    let numericValue = e.target.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue?.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue?.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    // if (type === "max") {
    //   if (stakeType === "Stake") {
    //     numericValue = balances.xstbl.toString();
    //   }

    //   if (stakeType === "Unstake") {
    //     numericValue = balances.stakedXSTBL.toString();
    //   }
    // }
    const balance =
      actionType === TransactionTypes.Deposit
        ? formatUnits(balances[actionAssets[actionType]?.address], 6)
        : formatUnits(balances[actionAssets[actionType]?.address], 18);

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
    const depositToken = actionAssets.deposit.address;

    const decimals = actionAssets.deposit.decimals;

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
            formatUnits(newAllowance, actionAssets.deposit.decimals)
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
          formatUnits(newAllowance, actionAssets.deposit.decimals)
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

    const decimals = actionAssets.deposit.decimals;

    const amount = Number(value);

    const _value = parseUnits(String(amount), decimals);

    const shares = parseUnits(String(amount - (amount * 5) / 100), decimals); // 5 = slippage

    try {
      setNeedConfirm(true);
      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "depositAssets",
        args: [[actionAssets.deposit.address], [_value], shares, $account],
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

    const decimals = actionAssets.withdraw.decimals;

    const amount = Number(value);

    const _value = parseUnits(String(amount), 18);

    const shares = parseUnits(String(amount - (amount * 5) / 100), decimals); // 5 = slippage

    try {
      setNeedConfirm(true);
      const _action = await writeContract(wagmiConfig, {
        address: metaVault.address,
        abi: IMetaVaultABI,
        functionName: "withdrawAssets",
        args: [[actionAssets.withdraw.address], _value, [shares]],
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

      let parsedAllowance = Number(
        formatUnits(
          metaVaultAllowance,
          getTokenData(assetsForDeposit[0].toLowerCase()).decimals
        )
      );

      if (parsedAllowance) {
        setAllowance(parsedAllowance);
      }
      setBalances({
        [assetsForDeposit[0].toLowerCase()]:
          $assetsBalances[146][assetsForDeposit[0].toLowerCase()],
        [assetsForWithdraw[0].toLowerCase()]: metaVaultBalance,
      });

      setActionAssets({
        deposit: getTokenData(assetsForDeposit[0].toLowerCase()),
        withdraw: getTokenData(assetsForWithdraw[0].toLowerCase()),
      });
    } catch (error) {
      console.error("Get data error:", error);
    }
  };

  useEffect(() => {
    if (metaVault) {
      getData();
    }
  }, [$account, $lastTx, $assetsPrices, metaVault, $assetsBalances]);

  useEffect(() => {
    setButton("");
    setValue("");
  }, [actionType]);

  return (
    <WagmiLayout>
      <div className="p-6 bg-[#101012] border border-[#23252A] rounded-lg w-[352px] self-start mt-[439px]">
        <div className="flex items-center gap-2 text-[14px] mb-6">
          <span
            className={cn(
              "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
              actionType === "deposit" &&
                "bg-[#22242A] text-white cursor-default"
            )}
            onClick={() => setActionType(TransactionTypes.Deposit)}
          >
            Deposit
          </span>

          <span
            className={cn(
              "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
              actionType === "withdraw" &&
                "bg-[#22242A] text-white cursor-default"
            )}
            onClick={() => setActionType(TransactionTypes.Withdraw)}
          >
            Withdraw
          </span>
        </div>
        <p>
          {capitalize(actionType)} token: {actionAssets[actionType].symbol}
        </p>
        {/* <div className="flex justify-between gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-[#97979A] text-[16px] leading-6 font-medium">
          My position
        </span>
        <span className="text-[24px] leading-8 font-semibold">0 USD</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[#97979A] text-[16px] leading-6 font-medium">
          My wallet balance
        </span>
        <span className="text-[24px] leading-8 font-semibold">0 USD</span>
      </div>
    </div> */}
        <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] my-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value={value}
              onChange={handleInputChange}
              className="bg-transparent text-2xl font-semibold outline-none w-full"
            />
            <div className="bg-[#151618] border border-[#23252A] rounded-lg cursor-pointer px-3 py-1 text-[14px]">
              USD
            </div>
          </div>
          {!!balances && !!actionAssets[actionType] && (
            <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
              Balance:{" "}
              {formatUnits(
                balances[actionAssets[actionType]?.address],
                actionType === TransactionTypes.Deposit ? 6 : 18
              )}
            </div>
          )}
        </label>
        <div className="flex flex-col gap-2 mb-4">
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
        </div>
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
