import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { Skeleton } from "@ui";

import { formatNumber } from "@utils";

import { useUserReservesData, useUserPoolData } from "../hooks";

import { formatHealthFactor } from "../functions";

import { connected } from "@store";

import { TMarket } from "@types";

type TProps = {
  marketData: TMarket;
};

const Dashboard: React.FC<TProps> = ({ marketData }) => {
  const $connected = useStore(connected);

  const { data: userReservesData, isLoading: isReservesLoading } =
    useUserReservesData(marketData);

  const { data: userPoolData, isLoading: isPoolLoading } = useUserPoolData(
    marketData?.network?.id as string,
    marketData?.pool
  );

  const [stats, setStats] = useState({
    netWorth: "0",
    HF: "∞",
    netAPR: "0",
  });

  const initStats = async () => {
    if (!userReservesData || !userPoolData) return;

    let totalSupplied = 0;
    let totalBorrowed = 0;

    let supplyInterestUSD = 0;
    let borrowInterestUSD = 0;

    marketData.reserves.forEach((reserve) => {
      const reservesData = userReservesData[reserve.address];

      if (!reservesData) return;

      const price = Number(reserve.price) || 0;

      const supplied = Number(reservesData.withdraw?.balance || 0);

      const suppliedUSD = supplied * price;

      totalSupplied += suppliedUSD;

      const supplyAPR = Number(reserve.supplyAPR || 0) / 100;

      supplyInterestUSD += suppliedUSD * supplyAPR;

      if (reserve.isBorrowable) {
        const borrowed = Number(reservesData.repay?.balance || 0);

        const borrowedUSD = borrowed * price;

        totalBorrowed += borrowedUSD;

        const borrowAPR = Number(reserve.borrowAPR || 0) / 100;

        borrowInterestUSD += borrowedUSD * Math.abs(borrowAPR);
      }
    });

    const netWorth = totalSupplied - totalBorrowed;

    const HF = formatHealthFactor(userPoolData?.healthFactor ?? 0);

    const netInterestUSD = supplyInterestUSD - borrowInterestUSD;

    const netAPR = netWorth > 0 ? netInterestUSD / netWorth : 0;

    setStats({
      netWorth: netWorth.toFixed(2),
      HF,
      netAPR: (netAPR * 100).toFixed(2),
    });
  };

  useEffect(() => {
    initStats();
  }, [userReservesData, userPoolData]);

  if (!$connected) return null;

  return (
    <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col w-full font-medium">
      <div className="flex items-start justify-between gap-5 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Net worth
          </span>
          {isPoolLoading || isReservesLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <span className="text-[24px] leading-8">
              {formatNumber(stats.netWorth, "abbreviate")}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Health Factor
          </span>
          {isPoolLoading || isReservesLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <span className="text-[24px] leading-8">{stats.HF}</span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[#7C7E81] text-[16px] leading-6">Net APR</span>
          {isPoolLoading || isReservesLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <span className="text-[24px] leading-8">{stats.netAPR}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
