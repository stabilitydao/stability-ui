import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { Skeleton } from "@ui";

import { formatNumber } from "@utils";

import { convertToUSD, formatHealthFactor } from "../../functions";

import { useUserPoolData, useUserReservesData } from "../../hooks";

import { account, connected, lastTx, currentChainID } from "@store";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  type: MarketSectionTypes;
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  value: string;
};

const BasicStats: React.FC<TProps> = ({ type, market, activeAsset, value }) => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);
  const $lastTx = useStore(lastTx);

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    deposited: "0",
    borrowed: "0",
    APR: "0",
    futureDeposited: "0",
    futureBorrowed: "0",
    depositedInUSD: "$0",
    borrowedInUSD: "$0",
    LTV: "0",
    futureLTV: "0",
    healthFactor: "∞",
    futureHealthFactor: "∞",
    loaded: false,
  });

  const { data: userPoolData, isLoading: isPoolLoading } = useUserPoolData(
    market?.network?.id as string,
    market?.pool
  );

  const { data: userData, isLoading: isReservesLoading } =
    useUserReservesData(market);

  const handleStats = async () => {
    const _stats = {
      deposited: "0",
      borrowed: "0",
      APR: Number(activeAsset?.supplyAPR).toFixed(2),
      futureDeposited: "0",
      futureBorrowed: "0",
      depositedInUSD: "$0",
      borrowedInUSD: "$0",
      LTV: "0",
      futureLTV: "0",
      healthFactor: "∞",
      futureHealthFactor: "0",
      loaded: true,
    };

    const inputValue = Number(value);
    const price = Number(activeAsset?.price ?? 0);

    const totalCollateral = Number(userPoolData?.totalCollateralBase ?? 0);
    const totalDebt = Number(userPoolData?.totalDebtBase ?? 0);

    const liquidationThreshold = Number(
      userPoolData?.currentLiquidationThreshold ?? 0
    );

    const maxLTV = Number(userPoolData?.maxLTV ?? 0);

    let newCollateral = totalCollateral;
    let newDebt = totalDebt;

    if (isCollateral) {
      const deposited = Number(reserve?.withdraw?.balance ?? 0);

      if (deposited) {
        _stats.deposited = formatNumber(
          deposited,
          deposited > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );
        _stats.depositedInUSD = convertToUSD(deposited * price);
      }

      if (inputValue) {
        const futureDeposited =
          type === MarketSectionTypes.Supply
            ? deposited + inputValue
            : deposited - inputValue;

        _stats.futureDeposited = formatNumber(
          futureDeposited,
          futureDeposited > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );

        newCollateral =
          type === MarketSectionTypes.Supply
            ? totalCollateral + inputValue * price
            : totalCollateral - inputValue * price;
      }
    } else {
      const borrowed = Number(reserve?.repay?.balance ?? 0);

      if (borrowed) {
        _stats.borrowed = formatNumber(
          borrowed,
          borrowed > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );
        _stats.borrowedInUSD = convertToUSD(borrowed * price);
      }

      if (inputValue) {
        const futureBorrowed =
          type === MarketSectionTypes.Borrow
            ? borrowed + inputValue
            : borrowed - inputValue;

        _stats.futureBorrowed = formatNumber(
          futureBorrowed,
          futureBorrowed > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );

        newDebt =
          type === MarketSectionTypes.Borrow
            ? totalDebt + inputValue * price
            : totalDebt - inputValue * price;
      }
    }

    if (userPoolData?.healthFactor) {
      _stats.healthFactor = formatHealthFactor(userPoolData?.healthFactor ?? 0);
    }

    const currentLTV = !!totalCollateral
      ? (totalDebt / totalCollateral) * 100
      : 0;
    _stats.LTV = Math.min(currentLTV, 100).toFixed(2);

    if (inputValue) {
      const rawFutureLTV = !!newCollateral
        ? (newDebt / newCollateral) * 100
        : 0;

      const futureLTV = Math.min(rawFutureLTV, maxLTV);

      const futureHF = !!newDebt
        ? (newCollateral * liquidationThreshold) / newDebt
        : Infinity;

      _stats.futureLTV = futureLTV.toFixed(2);
      _stats.futureHealthFactor = formatHealthFactor(futureHF);
    }

    setStats(_stats);
  };

  const reserve = useMemo(() => {
    if (!activeAsset?.address) return undefined;
    return userData?.[activeAsset.address];
  }, [activeAsset, userData]);

  const isCollateral = useMemo(() => {
    return [MarketSectionTypes.Supply, MarketSectionTypes.Withdraw].includes(
      type
    );
  }, [type]);

  useEffect(() => {
    handleStats();
  }, [
    value,
    activeAsset,
    userData,
    userPoolData,
    $connected,
    $account,
    $currentChainID,
    $lastTx,
  ]);

  useEffect(() => {
    if (stats.loaded && !isReservesLoading && !isPoolLoading) {
      setIsLoading(false);
    }
  }, [stats, isReservesLoading]);

  return (
    <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col gap-2 md:gap-6 w-full lg:w-2/3 font-medium">
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            {isCollateral ? "Deposited" : "Borrowed"}
          </span>

          {isLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <>
              {isCollateral ? (
                <>
                  {stats?.futureDeposited !== "0" ? (
                    <div className="flex items-center gap-2 text-[24px] leading-8">
                      <span className="text-[#7C7E81]">{stats.deposited}</span>
                      <img
                        src="/icons/arrow-right.png"
                        alt="arrow right"
                        className="w-4 h-4"
                      />
                      <span>
                        {stats.futureDeposited} {activeAsset?.assetData?.symbol}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[24px] leading-8">
                      {stats.deposited} {activeAsset?.assetData?.symbol}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {stats?.futureBorrowed !== "0" ? (
                    <div className="flex items-center gap-2 text-[24px] leading-8">
                      <span className="text-[#7C7E81]">{stats.borrowed}</span>
                      <img
                        src="/icons/arrow-right.png"
                        alt="arrow right"
                        className="w-4 h-4"
                      />
                      <span>
                        {stats.futureBorrowed} {activeAsset?.assetData?.symbol}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[24px] leading-8">
                      {stats.borrowed} {activeAsset?.assetData?.symbol}
                    </span>
                  )}
                </>
              )}
            </>
          )}

          {isLoading ? (
            <Skeleton height={20} width={50} />
          ) : (
            <span className="text-[#7C7E81] text-[14px] leading-5">
              {isCollateral ? stats.depositedInUSD : stats.borrowedInUSD}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Supply APR
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            {isLoading ? (
              <Skeleton height={32} width={100} />
            ) : (
              <span>{stats.APR}%</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">LTV</span>
          {isLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <>
              {stats?.futureLTV !== "0" ? (
                <div className="flex items-center gap-2 text-[24px] leading-8">
                  <span className="text-[#7C7E81]">{stats.LTV}%</span>
                  <img
                    src="/icons/arrow-right.png"
                    alt="arrow right"
                    className="w-4 h-4"
                  />
                  <span>{stats.futureLTV}%</span>
                </div>
              ) : (
                <span className="text-[24px] leading-8">{stats?.LTV}%</span>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Health Factor
          </span>
          {isLoading ? (
            <Skeleton height={32} width={100} />
          ) : (
            <>
              {stats?.futureHealthFactor !== "0" ? (
                <div className="flex items-center gap-2 text-[24px] leading-8">
                  <span className="text-[#7C7E81]">{stats.healthFactor}</span>
                  <img
                    src="/icons/arrow-right.png"
                    alt="arrow right"
                    className="w-4 h-4"
                  />
                  <span>{stats.futureHealthFactor}</span>
                </div>
              ) : (
                <span className="text-[24px] leading-8">
                  {stats?.healthFactor}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { BasicStats };
