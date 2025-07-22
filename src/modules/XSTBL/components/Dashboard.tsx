import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { formatUnits } from "viem";

import { TextSkeleton, Skeleton } from "@ui";

import { Timer } from "../ui";

import { formatNumber } from "@utils";

import { STABILITY_TOKENS } from "@constants";

import { account, assetsPrices, connected, lastTx } from "@store";

import {
  sonicClient,
  ERC20ABI,
  IXStakingABI,
  IXSTBLABI,
  IRevenueRouterABI,
} from "@web3";

import type { TStakeDashboard, TAddress } from "@types";

const Dashboard = (): JSX.Element => {
  const showChart = false;

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $assetsPrices = useStore(assetsPrices);
  const $lastTx = useStore(lastTx);

  const { open } = useWeb3Modal();

  const [isLoaded, setIsLoaded] = useState(false);

  const STAKING_CONTRACT: TAddress =
    "0x17a7cf838a7c91de47552a9f65822b547f9a6997";

  const REVENUE_ROUTER_CONTRACT: TAddress =
    "0x23b8cc22c4c82545f4b451b11e2f17747a730810";

  const [dashboard, setDashboard] = useState<TStakeDashboard>({
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
    lendingFeesXSTBL: 0,
    lendingFeesUSD: 0,
    APR: 0,
    timestamp: 0,
  });

  const getData = async () => {
    try {
      setIsLoaded(false);

      const SECONDS_IN_WEEK = 7 * 24 * 60 * 60;
      const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const _balances = { xstbl: "0", stakedXSTBL: "0", earned: "0" };

      const _dashboardData: TStakeDashboard = {
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
            parsedLendingPendingRevenue * stblPrice;
          _dashboardData.lendingFeesXSTBL = parsedLendingPendingRevenue;
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
      }

      setDashboard(_dashboardData);
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
    <div className="flex flex-col gap-[28px]">
      <div className="flex items-stretch gap-3 flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Pending APR
            </span>
            {isLoaded ? (
              <span className="text-[#48C05C] text-[32px] leading-10 font-semibold">
                +{formatNumber(dashboard.APR, "formatAPR")}%
              </span>
            ) : (
              <TextSkeleton lineHeight={40} width={160} />
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Total staked
            </span>
            {isLoaded ? (
              <div className="flex flex-col items-center">
                <span className="text-[32px] leading-10 font-semibold">
                  {formatNumber(dashboard.totalStaked, "format")}
                </span>
                <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                  ~ ${formatNumber(dashboard.totalStakedInUSD, "format")}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <TextSkeleton lineHeight={40} width={160} />
                <TextSkeleton lineHeight={24} width={80} />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Your stake
            </span>

            {isLoaded ? (
              <>
                {$connected ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] leading-10 font-semibold">
                      {formatNumber(dashboard.userStaked, "format")}
                    </span>
                    <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                      ~ ${formatNumber(dashboard.userStakedInUSD, "format")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-[16px] leading-6 font-semibold">
                      You haven't connected your wallet
                    </span>
                    <button
                      className="text-[14px] leading-5 font-semibold px-4 py-2 rounded-[10px] border border-[#9180F4] bg-[linear-gradient(340deg,_#5B63D3_17.51%,_#9180F4_100%)]"
                      onClick={() => open()}
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center">
                <TextSkeleton lineHeight={40} width={160} />
                <TextSkeleton lineHeight={24} width={80} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
          <h3 className="text-[32px] leading-40 font-semibold">
            Sonic Generator
          </h3>
          {isLoaded ? (
            <Timer end={dashboard.timestamp} />
          ) : (
            <Skeleton height={48} width={130} />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              showChart ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Vault fees
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">50%</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>

                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(dashboard.pendingRevenueInSTBL, "format")}{" "}
                      xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${dashboard.pendingRevenue.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Lending fees
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">25%</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(dashboard.lendingFeesXSTBL, "format")} xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${dashboard.lendingFeesUSD.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                PVP Rewards
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">100%</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(dashboard.pendingRebaseInSTBL, "format")}{" "}
                      xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${dashboard.pendingRebase.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Agents
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">50%</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>
                  <span className="font-semibold">0 xSTBL</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  <span className="font-semibold">$0</span>
                </div>
              </div>
            </div>
          </div>

          {showChart && (
            <div className="bg-[#101012] rounded-lg p-4 flex items-center justify-center">
              <h3>Chart</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
