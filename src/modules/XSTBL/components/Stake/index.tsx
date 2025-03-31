import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { Dashboard } from "./Dashboard";

import { formatNumber } from "@utils";

import { ActionButton } from "../../ui";

import { getTransactionReceipt } from "../../functions";

import { connected, account, lastTx, assetsPrices } from "@store";

import {
  sonicClient,
  ERC20ABI,
  wagmiConfig,
  IXStakingABI,
  IXSTBLABI,
  IRevenueRouterABI,
} from "@web3";

import { STABILITY_TOKENS } from "@constants";

import type { TStakeDashboardData, TAddress } from "@types";

const Stake = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);
  const $assetsPrices = useStore(assetsPrices);

  const input = useRef<HTMLInputElement>(null);

  const [balances, setBalances] = useState({
    xstbl: 0,
    stakedXSTBL: 0,
    earned: 0,
  });

  const [allowance, setAllowance] = useState(0);

  const [dashboardData, setDashboardData] = useState<TStakeDashboardData>({
    totalStaked: 0,
    totalStakedInUSD: 0,
    userStaked: 0,
    userStakedInUSD: 0,
    pendingRebase: 0,
    estimatedProfit: 0,
    estimatedProfitInUSD: 0,
    pendingRebaseInSTBL: 0,
    pendingRevenue: 0,
    pendingRevenueInSTBL: 0,
    APR: 0,
    timestamp: 0,
  });

  const [button, setButton] = useState("");

  const [isClaimable, setIsClaimable] = useState(false);

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [stakeType, setStakeType] = useState("Stake");

  const STAKING_CONTRACT: TAddress =
    "0x17a7cf838a7c91de47552a9f65822b547f9a6997";

  const REVENUE_ROUTER_CONTRACT: TAddress =
    "0x23b8cc22c4c82545f4b451b11e2f17747a730810";

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

    const xSTBL = STABILITY_TOKENS[146].xstbl.address as TAddress;

    const decimals = STABILITY_TOKENS[146].stbl.decimals;

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

          const newAllowance = await sonicClient.readContract({
            address: STABILITY_TOKENS[146].xstbl.address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, STAKING_CONTRACT as TAddress],
          });

          let parsedAllowance = Number(
            formatUnits(newAllowance, STABILITY_TOKENS[146].xstbl.decimals)
          );

          setAllowance(parsedAllowance);

          if (Number(parsedAllowance) >= Number(amount)) {
            setButton("Stake");
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        const newAllowance = await sonicClient.readContract({
          address: STABILITY_TOKENS[146].xstbl.address as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, STAKING_CONTRACT as TAddress],
        });

        let parsedAllowance = Number(
          formatUnits(newAllowance, STABILITY_TOKENS[146].xstbl.decimals)
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
    const decimals = STABILITY_TOKENS[146].xstbl.decimals;

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
      setButton(`Claim ${balances.earned} xSTBL`);
    } else {
      setButton("");
    }

    input.current.value = "";
  };

  const getData = async () => {
    try {
      const SECONDS_IN_WEEK = 7 * 24 * 60 * 60;

      const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

      const currentTimestamp = Math.floor(Date.now() / 1000);

      const _balances = { xstbl: 0, stakedXSTBL: 0, earned: 0 };

      const _dashboardData: TStakeDashboardData = {
        totalStaked: 0,
        totalStakedInUSD: 0,
        userStaked: 0,
        userStakedInUSD: 0,
        pendingRebase: 0,
        estimatedProfit: 0,
        estimatedProfitInUSD: 0,
        pendingRebaseInSTBL: 0,
        pendingRevenue: 0,
        pendingRevenueInSTBL: 0,
        APR: 0,
        timestamp: 0,
      };

      const _totalStaked = await sonicClient.readContract({
        address: STAKING_CONTRACT,
        abi: IXStakingABI,
        functionName: "totalSupply",
      });

      const pendingRebase = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "pendingRebase",
      });

      const pendingRevenue = await sonicClient.readContract({
        address: REVENUE_ROUTER_CONTRACT,
        abi: IRevenueRouterABI,
        functionName: "pendingRevenue",
      });

      let parsedTotal = Number(formatUnits(_totalStaked as bigint, 18));

      let parsedPendingRebase = Number(
        formatUnits(pendingRebase as bigint, 18)
      );

      let parsedPendingRevenue = Number(
        formatUnits(pendingRevenue as bigint, 18)
      );

      if (parsedTotal) {
        _dashboardData.totalStaked = parsedTotal;
      }

      const stblPrice =
        Number(
          $assetsPrices[146][STABILITY_TOKENS[146].stbl.address.toLowerCase()]
            ?.price
        ) || 0;

      _dashboardData.timestamp =
        Math.floor(currentTimestamp / SECONDS_IN_WEEK + 1) * SECONDS_IN_WEEK;

      let allIncome = 0;

      if (stblPrice) {
        _dashboardData.totalStakedInUSD = parsedTotal * stblPrice;

        if (parsedPendingRebase) {
          allIncome += parsedPendingRebase;

          _dashboardData.pendingRebase = parsedPendingRebase * stblPrice;
          _dashboardData.pendingRebaseInSTBL = parsedPendingRebase;
        }

        if (parsedPendingRevenue) {
          allIncome += parsedPendingRevenue;

          _dashboardData.pendingRevenue = parsedPendingRevenue * stblPrice;
          _dashboardData.pendingRevenueInSTBL = parsedPendingRevenue;

          const timePassed =
            currentTimestamp - (_dashboardData.timestamp - SECONDS_IN_WEEK);

          _dashboardData.APR =
            (allIncome / parsedTotal) * (SECONDS_IN_YEAR / timePassed) * 100;
        }
      }

      if ($account) {
        const XSTBLBalance = await sonicClient.readContract({
          address: STABILITY_TOKENS[146].xstbl.address as TAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        });

        const stakedSTBLBalance = await sonicClient.readContract({
          address: STAKING_CONTRACT as TAddress,
          abi: IXStakingABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        });

        const stakedSTBLAllowance = await sonicClient.readContract({
          address: STABILITY_TOKENS[146].xstbl.address as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, STAKING_CONTRACT as TAddress],
        });

        const earned = (await sonicClient.readContract({
          address: STAKING_CONTRACT as TAddress,
          abi: IXStakingABI,
          functionName: "earned",
          args: [$account as TAddress],
        })) as bigint;

        let parsedBalance = Number(
          formatUnits(XSTBLBalance, STABILITY_TOKENS[146].xstbl.decimals)
        );

        let parsedEarned = Number(
          formatUnits(earned, STABILITY_TOKENS[146].xstbl.decimals)
        );

        let parsedStakedBalance = Number(
          formatUnits(
            stakedSTBLBalance as bigint,
            STABILITY_TOKENS[146].xstbl.decimals
          )
        );

        let parsedAllowance = Number(
          formatUnits(stakedSTBLAllowance, STABILITY_TOKENS[146].xstbl.decimals)
        );

        if (parsedBalance) {
          _balances.xstbl = parsedBalance;
        }

        if (parsedEarned) {
          _balances.earned = parsedEarned;

          setIsClaimable(!!parsedEarned);
        }

        if (parsedStakedBalance) {
          _balances.stakedXSTBL = parsedStakedBalance;
          _dashboardData.userStaked = parsedStakedBalance;
          _dashboardData.userStakedInUSD = parsedStakedBalance * stblPrice;

          _dashboardData.estimatedProfit =
            (allIncome * parsedStakedBalance) / parsedTotal;

          _dashboardData.estimatedProfitInUSD =
            _dashboardData.estimatedProfit * stblPrice;
        }

        if (parsedAllowance) {
          setAllowance(parsedAllowance);
        }

        setBalances(_balances);
      }

      setDashboardData(_dashboardData);
    } catch (error) {
      console.error("Get STBL balance error:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [$account, $lastTx]);

  return (
    <div className="flex flex-col gap-5">
      <Dashboard data={dashboardData} />
      <div className="bg-accent-950 p-5 rounded-2xl flex justify-between flex-col md:flex-row">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <span className="text-[26px]">Stake xSTBL</span>
            <span className="text-[18px]">
              Stake your xSTBL to earn 100% of protocol fees, vote incentives,
              and penalties from exits.
            </span>
          </div>

          {!!balances.stakedXSTBL && (
            <div className="flex flex-col items-start mb-5 mt-5 md:mb-0">
              <span className="text-[15px] font-light">Your stake</span>
              <p className="text-[20px] min-[850px]:text-[28px] font-bold">
                {formatNumber(balances.stakedXSTBL, "format")}{" "}
                <span className="text-[#A995FF]">xSTBL</span>
              </p>
            </div>
          )}
        </div>
        <div className="lg:w-1/3 flex flex-col justify-between">
          <div className="flex items-center font-semibold relative text-[20px] mb-2 select-none">
            {isClaimable && (
              <p
                className={`whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-2 border-b-[1.5px] border-transparent w-1/2 ${stakeType === "Claim" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
                onClick={() => stakeTypeHandler("Claim")}
              >
                Claim
              </p>
            )}

            <p
              className={`whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-2 border-b-[1.5px] border-transparent w-1/2 ${stakeType === "Stake" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => stakeTypeHandler("Stake")}
            >
              Stake
            </p>
            <p
              className={`whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-2 border-b-[1.5px] border-transparent w-1/2 ${stakeType === "Unstake" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => stakeTypeHandler("Unstake")}
            >
              Unstake
            </p>
          </div>
          <div className={`${stakeType === "Claim" ? "hidden" : ""}`}>
            <label className="relative block h-[60px] w-full">
              <img
                src="/STBL_plain.png"
                alt="STBL"
                title="STBL"
                className="absolute top-[27%] left-4 w-8 h-8 text-neutral-500 rounded-full pointer-events-none"
              />

              <input
                ref={input}
                name="amount"
                placeholder="0"
                onChange={() => handleInputChange()}
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                inputMode="decimal"
                autoComplete="off"
                className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[60px] my-[2px] pl-[60px] pr-3"
              />

              {stakeType === "Stake" ? (
                <>
                  {!!$connected && !!balances.xstbl && (
                    <button
                      type="button"
                      onClick={() => handleInputChange("max")}
                      className="absolute top-[27%] right-1 flex items-center px-3 py-1 text-accent-400 text-[16px] font-semibold"
                    >
                      Max
                    </button>
                  )}
                </>
              ) : (
                <>
                  {!!$connected && !!balances.stakedXSTBL && (
                    <button
                      type="button"
                      onClick={() => handleInputChange("max")}
                      className="absolute top-[27%] right-1 flex items-center px-3 py-1 text-accent-400 text-[16px] font-semibold"
                    >
                      Max
                    </button>
                  )}
                </>
              )}
            </label>
            {stakeType === "Stake" ? (
              <div
                className={`text-[16px] leading-3 text-neutral-500 flex items-center gap-1 my-3 ${
                  $connected ? "" : "opacity-0"
                }`}
              >
                <span>Balance: </span>
                <span>{!!balances.xstbl ? balances.xstbl : "0"} xSTBL</span>
              </div>
            ) : (
              <div
                className={`text-[16px] leading-3 text-neutral-500 flex items-center gap-1 my-3 ${
                  $connected ? "" : "opacity-0"
                }`}
              >
                <span>Balance: </span>
                <span>
                  {!!balances.stakedXSTBL ? balances.stakedXSTBL : "0"} xSTBL
                </span>
              </div>
            )}
          </div>

          <ActionButton
            type={button}
            transactionInProgress={transactionInProgress}
            needConfirm={needConfirm}
            actionFunction={stakeHandler}
          />
        </div>
      </div>
    </div>
  );
};

export { Stake };
