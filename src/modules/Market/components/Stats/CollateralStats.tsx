import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { getTokenData, formatNumber } from "@utils";

import { convertToUSD, formatHealthFactor } from "../../functions";

import { useUserPoolData } from "../../hooks";

import { account, connected, lastTx, currentChainID } from "@store";

import {
  TMarketReserve,
  TAddress,
  TMarket,
  TReservesData,
  MarketSectionTypes,
} from "@types";

type TProps = {
  type: MarketSectionTypes;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: TReservesData | Record<TAddress, string>;
  isLoading: boolean;
  value: string;
};

const CollateralStats: React.FC<TProps> = ({
  type,
  market,
  asset,
  assets,
  userData,
  isLoading,
  value,
}) => {
  const assetData = getTokenData(asset?.address as TAddress);

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);
  const $lastTx = useStore(lastTx);

  const [stats, setStats] = useState({
    deposited: "0",
    APR: "0",
    futureDeposited: "0",
    depositedInUSD: "$0",
  });

  const { data: userPoolData, isLoading: loading } = useUserPoolData(
    market?.network?.id as string,
    market.pool
  );

  const handleUserSupplyStats = async () => {
    const _stats = {
      deposited: "0",
      APR: Number(asset?.supplyAPR).toFixed(2),
      futureDeposited: "0",
      depositedInUSD: "$0",
    };

    const deposited =
      type === MarketSectionTypes.Supply
        ? Number(userData[asset?.address]?.deposited ?? 0)
        : Number(userData[asset?.address] ?? 0);

    const inputValue = Number(value);

    if (!!deposited) {
      _stats.deposited = formatNumber(
        deposited,
        deposited > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
      );

      _stats.depositedInUSD = convertToUSD(
        deposited * Number(asset?.price ?? 0)
      );
    }

    if (!!inputValue) {
      const futureDeposited =
        type === MarketSectionTypes.Supply
          ? deposited + inputValue
          : deposited - inputValue;

      _stats.futureDeposited = formatNumber(
        futureDeposited,
        futureDeposited > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
      );
    }

    setStats(_stats);
  };

  useEffect(() => {
    handleUserSupplyStats();
  }, [value, asset, userData, $connected, $account, $currentChainID, $lastTx]);

  return (
    <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col gap-2 md:gap-6 w-full lg:w-2/3 font-medium">
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Deposited
          </span>

          {stats?.futureDeposited !== "0" ? (
            <div className="flex items-center gap-2 text-[24px] leading-8">
              <span className="text-[#7C7E81]">{stats.deposited}</span>
              <img
                src="/icons/arrow-right.png"
                alt="arrow right"
                className="w-4 h-4"
              />
              <span>
                {stats.futureDeposited} {assetData?.symbol}
              </span>
            </div>
          ) : (
            <span className="text-[24px] leading-8">
              {stats.deposited} {assetData?.symbol}
            </span>
          )}

          <span className="text-[#7C7E81] text-[14px] leading-5">
            {stats.depositedInUSD}
          </span>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Supply APR
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            {/* <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            /> */}
            <span>{stats.APR}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">LTV</span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            {/* <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            /> */}
            <span>{userPoolData?.ltv}%</span>
          </div>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Health Factor
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            {/* <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            /> */}
            <span>{formatHealthFactor(userPoolData?.healthFactor ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CollateralStats };
