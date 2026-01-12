import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { ActionButton } from "@ui";

import { formatNumber, getTransactionReceipt, cn } from "@utils";

import { connected, account, lastTx, stakeNetwork } from "@store";

import {
  ERC20ABI,
  wagmiConfig,
  IXStakingABI,
  stakingContracts,
  web3clients,
} from "@web3";

import { STABILITY_TOKENS } from "@constants";

import type { TAddress } from "@types";

const Stake = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);
  const $stakeNetwork = useStore(stakeNetwork);

  const input = useRef<HTMLInputElement>(null);

  const [balances, setBalances] = useState({
    xstbl: "0",
    stakedXSTBL: "0",
    earned: "0",
  });

  const [allowance, setAllowance] = useState(0);

  const [button, setButton] = useState("");

  const [isClaimable, setIsClaimable] = useState(false);

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [stakeType, setStakeType] = useState("Stake");

  const client = web3clients[$stakeNetwork?.id as keyof typeof web3clients];

  const STAKING_CONTRACT: TAddress = stakingContracts[$stakeNetwork?.id];

  const handleInputChange = (type = "") => {
    let numericValue = input?.current?.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue?.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue?.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    if (type === "max") {
      if (stakeType === "Stake") {
        numericValue = balances.xstbl.toString();
      }

      if (stakeType === "Unstake") {
        numericValue = balances.stakedXSTBL.toString();
      }
    }

    if (input?.current) {
      input.current.value = numericValue;

      if (!Number(numericValue)) {
        setButton("");
      } else if (stakeType === "Stake") {
        if (Number(numericValue) > Number(balances.xstbl)) {
          setButton("insufficientBalance");
        } else if (Number(numericValue) > Number(allowance)) {
          setButton("Approve");
        } else if (Number(numericValue) <= Number(balances.xstbl)) {
          setButton("Stake");
        }
      } else if (stakeType === "Unstake") {
        if (Number(numericValue) > Number(balances.stakedXSTBL)) {
          setButton("insufficientBalance");
        } else if (Number(numericValue) <= Number(balances.stakedXSTBL)) {
          setButton("Unstake");
        }
      }
    }
  };

  const approve = async () => {
    setTransactionInProgress(true);

    const xSTBL = STABILITY_TOKENS[$stakeNetwork?.id].xstbl.address as TAddress;

    const decimals = STABILITY_TOKENS[$stakeNetwork?.id].stbl.decimals;

    const amount = Number(input?.current?.value);

    if (xSTBL && $account && amount) {
      try {
        const approveSum = parseUnits(String(amount), decimals);

        setNeedConfirm(true);
        const xSTBLApprove = await writeContract(wagmiConfig, {
          address: xSTBL,
          abi: ERC20ABI,
          functionName: "approve",
          args: [STAKING_CONTRACT, approveSum],
        });
        setNeedConfirm(false);

        const transaction = await getTransactionReceipt(xSTBLApprove);

        if (transaction?.status === "success") {
          lastTx.set(transaction?.transactionHash);

          const newAllowance = await client.readContract({
            address: STABILITY_TOKENS[$stakeNetwork?.id].xstbl
              .address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, STAKING_CONTRACT as TAddress],
          });

          let parsedAllowance = Number(
            formatUnits(
              newAllowance,
              STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals
            )
          );

          setAllowance(parsedAllowance);

          if (Number(parsedAllowance) >= Number(amount)) {
            setButton("Stake");
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        const newAllowance = await client.readContract({
          address: STABILITY_TOKENS[$stakeNetwork?.id].xstbl
            .address as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, STAKING_CONTRACT as TAddress],
        });

        let parsedAllowance = Number(
          formatUnits(
            newAllowance,
            STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals
          )
        );

        setAllowance(parsedAllowance);

        if (Number(parsedAllowance) >= Number(amount)) {
          setButton("Stake");
        }

        console.error("Approve error:", error);
      }
    }
    setTransactionInProgress(false);
  };

  const stakeAction = async (type: string) => {
    setTransactionInProgress(true);
    const decimals = STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals;

    const amount = Number(input?.current?.value);

    const value = parseUnits(String(amount), decimals);

    try {
      setNeedConfirm(true);

      const funcName = type === "Stake" ? "deposit" : "withdraw";

      const _action = await writeContract(wagmiConfig, {
        address: STAKING_CONTRACT,
        abi: IXStakingABI,
        functionName: funcName,
        args: [value],
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(_action);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        input.current.value = "";
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error(`${stakeType} action error:`, error);
    }
    setTransactionInProgress(false);
  };

  const claim = async () => {
    setTransactionInProgress(true);
    try {
      setNeedConfirm(true);

      const getReward = await writeContract(wagmiConfig, {
        address: STAKING_CONTRACT,
        abi: IXStakingABI,
        functionName: "getReward",
      });

      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(getReward);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setIsClaimable(false);
        setStakeType("Stake");
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Claim action error:", error);
    }
    setTransactionInProgress(false);
  };

  const stakeHandler = async () => {
    if (button === "Approve") {
      await approve();
    } else if (["Stake", "Unstake"].includes(button)) {
      await stakeAction(stakeType);
    } else if (button.includes("Claim")) {
      await claim();
    }
  };

  const stakeTypeHandler = (type: string) => {
    setStakeType(type);

    if (type === "Claim") {
      setButton(`Claim ${Number(balances.earned).toFixed(2)} xSTBL`);
    } else {
      setButton("");
    }

    input.current.value = "";
  };

  const getData = async () => {
    try {
      const _balances = { xstbl: "0", stakedXSTBL: "0", earned: "0" };

      if ($account) {
        try {
          const XSTBLBalance = await client.readContract({
            address: STABILITY_TOKENS[$stakeNetwork?.id].xstbl
              .address as TAddress,
            abi: ERC20ABI,
            functionName: "balanceOf",
            args: [$account],
          });

          _balances.xstbl = formatUnits(
            XSTBLBalance,
            STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals
          );
        } catch (err) {
          console.error("Error: XSTBL balance", err);
        }

        try {
          const stakedSTBLBalance = await client.readContract({
            address: STAKING_CONTRACT,
            abi: IXStakingABI,
            functionName: "balanceOf",
            args: [$account],
          });

          const parsedStaked = formatUnits(
            stakedSTBLBalance as bigint,
            STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals
          );

          _balances.stakedXSTBL = parsedStaked;
        } catch (err) {
          console.error("Error: stakedSTBLBalance", err);
        }

        try {
          const earned = await client.readContract({
            address: STAKING_CONTRACT,
            abi: IXStakingABI,
            functionName: "earned",
            args: [$account],
          });

          const parsedEarned = formatUnits(
            earned,
            STABILITY_TOKENS[$stakeNetwork?.id].xstbl.decimals
          );
          _balances.earned = parsedEarned;
          setIsClaimable(!!Number(parsedEarned));
        } catch (err) {
          console.error("Error: earned", err);
        }

        try {
          const stakedSTBLAllowance = await client.readContract({
            address: STABILITY_TOKENS[$stakeNetwork?.id].xstbl
              .address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account, STAKING_CONTRACT],
          });

          const parsedAllowance = Number(
            formatUnits(
              stakedSTBLAllowance,
              STABILITY_TOKENS[
                $stakeNetwork?.id as keyof typeof STABILITY_TOKENS
              ].xstbl.decimals
            )
          );

          setAllowance(parsedAllowance);
        } catch (err) {
          console.error("Error: allowance", err);
        }
      }

      setBalances(_balances);
    } catch (err) {
      console.error("getData error:", err);
    }
  };

  useEffect(() => {
    getData();
  }, [$account, $lastTx, $stakeNetwork]);

  return (
    <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col md:flex-row">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[24px] leading-8 font-semibold">
            Stake xSTBL
          </span>
          <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
            Stake your xSTBL to earn revenue from Stability profit generating
            units.
          </span>
        </div>

        {!!balances.stakedXSTBL && (
          <div className="flex flex-col items-start gap-1 my-5 md:my-0">
            <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
              Your stake
            </span>
            <p className="text-[20px] min-[850px]:text-[28px] font-bold">
              {formatNumber(balances.stakedXSTBL, "format")}{" "}
              <span className="text-[#A995FF]">xSTBL</span>
            </p>
          </div>
        )}
      </div>
      <div className="lg:w-1/3 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-2 text-[14px]">
          {isClaimable && (
            <span
              className={cn(
                "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
                stakeType === "Claim" &&
                  "bg-[#22242A] text-white cursor-default"
              )}
              onClick={() => stakeTypeHandler("Claim")}
            >
              Claim
            </span>
          )}
          <span
            className={cn(
              "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
              stakeType === "Stake" && "bg-[#22242A] text-white cursor-default"
            )}
            onClick={() => stakeTypeHandler("Stake")}
          >
            Stake
          </span>
          <span
            className={cn(
              "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
              stakeType === "Unstake" &&
                "bg-[#22242A] text-white cursor-default"
            )}
            onClick={() => stakeTypeHandler("Unstake")}
          >
            Unstake
          </span>
        </div>
        <div className={cn(stakeType === "Claim" && "hidden")}>
          <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
            <div className="flex items-center justify-between">
              <input
                ref={input}
                name="amount"
                placeholder="0"
                onChange={() => handleInputChange()}
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                inputMode="decimal"
                autoComplete="off"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
              <div
                className={cn(
                  "bg-[#151618] border border-[#23252A] rounded-lg px-3 py-1 text-[14px]",
                  $connected && "cursor-pointer"
                )}
                onClick={() => handleInputChange("max")}
              >
                MAX
              </div>
            </div>
            {stakeType === "Stake" ? (
              <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
                <span>Balance: </span>
                <span>{!!balances.xstbl ? balances.xstbl : "0"} xSTBL</span>
              </div>
            ) : (
              <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
                <span>Balance: </span>
                <span>
                  {!!balances.stakedXSTBL ? balances.stakedXSTBL : "0"} xSTBL
                </span>
              </div>
            )}
          </label>
        </div>

        <ActionButton
          type={button}
          network={$stakeNetwork?.id}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={stakeHandler}
        />
      </div>
    </div>
  );
};

export { Stake };
