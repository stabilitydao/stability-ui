import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { Dashboard } from "./Dashboard";

import { ActionButton } from "@ui";

import { formatNumber, getTransactionReceipt, cn } from "@utils";

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
    xstbl: "0",
    stakedXSTBL: "0",
    earned: "0",
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
  const [isLoaded, setIsLoaded] = useState(false);

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
      setButton(`Claim ${Number(balances.earned).toFixed(2)} xSTBL`);
    } else {
      setButton("");
    }

    input.current.value = "";
  };

  const getData = async () => {
    try {
      setIsLoaded(false);

      const SECONDS_IN_WEEK = 7 * 24 * 60 * 60;
      const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const _balances = { xstbl: "0", stakedXSTBL: "0", earned: "0" };

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
        lendingFeesXSTBL: 0,
        lendingFeesUSD: 0,
      };

      let _totalStaked = BigInt(0);
      let pendingRebase = BigInt(0);
      let pendingRevenue = BigInt(0);
      let lendingPendingRevenue = BigInt(0);

      try {
        _totalStaked = (await sonicClient.readContract({
          address: STAKING_CONTRACT,
          abi: IXStakingABI,
          functionName: "totalSupply",
        })) as bigint;
      } catch (err) {
        console.error("Error: totalSupply", err);
      }

      try {
        pendingRebase = (await sonicClient.readContract({
          address: STABILITY_TOKENS[146].xstbl.address as TAddress,
          abi: IXSTBLABI,
          functionName: "pendingRebase",
        })) as bigint;
      } catch (err) {
        console.error("Error: pendingRebase", err);
      }

      try {
        pendingRevenue = (await sonicClient.readContract({
          address: REVENUE_ROUTER_CONTRACT,
          abi: IRevenueRouterABI,
          functionName: "pendingRevenue",
        })) as bigint;
      } catch (err) {
        console.error("Error: pendingRevenue", err);
      }

      try {
        lendingPendingRevenue = (await sonicClient.readContract({
          address: REVENUE_ROUTER_CONTRACT,
          abi: IRevenueRouterABI,
          functionName: "pendingRevenue",
          args: [BigInt(0)],
        })) as bigint;
      } catch (err) {
        console.error("Error: lendingPendingRevenue", err);
      }

      const parsedTotal = Number(formatUnits(_totalStaked, 18));
      const parsedPendingRebase = Number(formatUnits(pendingRebase, 18));
      const parsedPendingRevenue = Number(formatUnits(pendingRevenue, 18));

      const parsedLendingPendingRevenue = Number(
        formatUnits(lendingPendingRevenue, 18)
      );

      _dashboardData.totalStaked = parsedTotal;

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

        if (parsedLendingPendingRevenue >= 0) {
          allIncome += parsedLendingPendingRevenue;

          _dashboardData.lendingFeesUSD =
            (parsedLendingPendingRevenue +
              parsedPendingRebase +
              parsedPendingRevenue) *
            stblPrice;
          _dashboardData.lendingFeesXSTBL =
            parsedLendingPendingRevenue +
            parsedPendingRebase +
            parsedPendingRevenue;
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
        try {
          const XSTBLBalance = await sonicClient.readContract({
            address: STABILITY_TOKENS[146].xstbl.address as TAddress,
            abi: ERC20ABI,
            functionName: "balanceOf",
            args: [$account],
          });

          _balances.xstbl = formatUnits(
            XSTBLBalance,
            STABILITY_TOKENS[146].xstbl.decimals
          );
        } catch (err) {
          console.error("Error: XSTBL balance", err);
        }

        try {
          const stakedSTBLBalance = await sonicClient.readContract({
            address: STAKING_CONTRACT,
            abi: IXStakingABI,
            functionName: "balanceOf",
            args: [$account],
          });

          const parsedStaked = formatUnits(
            stakedSTBLBalance as bigint,
            STABILITY_TOKENS[146].xstbl.decimals
          );

          _balances.stakedXSTBL = parsedStaked;
          _dashboardData.userStaked = Number(parsedStaked);
          _dashboardData.userStakedInUSD = Number(parsedStaked) * stblPrice;
          _dashboardData.estimatedProfit =
            (allIncome * Number(parsedStaked)) / parsedTotal;
          _dashboardData.estimatedProfitInUSD =
            _dashboardData.estimatedProfit * stblPrice;
        } catch (err) {
          console.error("Error: stakedSTBLBalance", err);
        }

        try {
          const earned = await sonicClient.readContract({
            address: STAKING_CONTRACT,
            abi: IXStakingABI,
            functionName: "earned",
            args: [$account],
          });

          const parsedEarned = formatUnits(
            earned,
            STABILITY_TOKENS[146].xstbl.decimals
          );
          _balances.earned = parsedEarned;
          setIsClaimable(!!Number(parsedEarned));
        } catch (err) {
          console.error("Error: earned", err);
        }

        try {
          const stakedSTBLAllowance = await sonicClient.readContract({
            address: STABILITY_TOKENS[146].xstbl.address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account, STAKING_CONTRACT],
          });

          const parsedAllowance = Number(
            formatUnits(
              stakedSTBLAllowance,
              STABILITY_TOKENS[146].xstbl.decimals
            )
          );

          setAllowance(parsedAllowance);
        } catch (err) {
          console.error("Error: allowance", err);
        }
      }

      setBalances(_balances);
      setDashboardData(_dashboardData);
      setIsLoaded(true);
    } catch (err) {
      console.error("getData error:", err);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (Object.keys($assetsPrices).length) {
      getData();
    }
  }, [$account, $lastTx, $assetsPrices]);

  return (
    <div className="flex flex-col gap-6">
      <Dashboard data={dashboardData} isLoaded={isLoaded} />
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
                stakeType === "Stake" &&
                  "bg-[#22242A] text-white cursor-default"
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
