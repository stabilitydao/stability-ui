import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { StatItem } from "../../ui";

import { formatNumber } from "@utils";

import {
  convertToUSD,
  formatHealthFactor,
  getLTVTextColor,
  getHFTextColor,
} from "../../functions";

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

  const [stats, setStats] = useState({
    supplied: { current: "0", future: "0", inUSD: "$0" },
    borrowed: { current: "0", future: "0", inUSD: "$0" },
    LTV: { current: "0", future: "0" },
    HF: { current: "∞", future: "0" },
    APR: { supply: "0", borrow: "0" },
    maxLTV: 0,
    LT: 0,
  });

  const { data: userPoolData, isLoading: isPoolLoading } = useUserPoolData(
    market?.network?.id as string,
    market?.pool
  );

  const { data: userData, isLoading: isReservesLoading } =
    useUserReservesData(market);

  const isIsolatedMarket = market?.reserves?.length <= 2;

  const handleStats = async () => {
    const _stats = {
      supplied: { current: "0", future: "0", inUSD: "$0" },
      borrowed: { current: "0", future: "0", inUSD: "$0" },
      LTV: { current: "0", future: "0" },
      HF: { current: "∞", future: "0" },
      APR: {
        supply: Number(activeAsset?.supplyAPR).toFixed(2),
        borrow: Number(activeAsset?.borrowAPR).toFixed(2),
      },
      maxLTV: 0,
      LT: 0,
    };

    const inputValue = Number(value);
    const price = Number(activeAsset?.price ?? 0);

    const totalCollateral = Number(userPoolData?.totalCollateralBase ?? 0);
    const totalDebt = Number(userPoolData?.totalDebtBase ?? 0);

    const liquidationThreshold = Number(
      userPoolData?.currentLiquidationThreshold ?? 0
    );
    const maxLTV = Number(userPoolData?.maxLTV ?? 0);

    const LT = liquidationThreshold * 100;

    _stats.LT = LT;
    _stats.maxLTV = maxLTV;

    let newCollateral = totalCollateral;
    let newDebt = totalDebt;

    if (isCollateral) {
      const supplied = Number(reserve?.withdraw?.balance ?? 0);

      if (supplied) {
        _stats.supplied.current = formatNumber(
          supplied,
          supplied > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );
        _stats.supplied.inUSD = convertToUSD(supplied * price);
      }

      if (inputValue) {
        const futureSupplied =
          type === MarketSectionTypes.Supply
            ? supplied + inputValue
            : supplied - inputValue;

        _stats.supplied.future = formatNumber(
          futureSupplied,
          futureSupplied > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );

        newCollateral =
          type === MarketSectionTypes.Supply
            ? totalCollateral + inputValue * price
            : totalCollateral - inputValue * price;
      }
    } else {
      const borrowed = Number(reserve?.repay?.balance ?? 0);

      if (borrowed) {
        _stats.borrowed.current = formatNumber(
          borrowed,
          borrowed > 1 ? "abbreviateIntegerNotUsd" : "smallNumbers"
        );
        _stats.borrowed.inUSD = convertToUSD(borrowed * price);
      }

      if (inputValue) {
        const futureBorrowed =
          type === MarketSectionTypes.Borrow
            ? borrowed + inputValue
            : borrowed - inputValue;

        _stats.borrowed.future = formatNumber(
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
      _stats.HF.current = formatHealthFactor(userPoolData?.healthFactor ?? 0);
    }

    const currentLTV = !!totalCollateral
      ? (totalDebt / totalCollateral) * 100
      : 0;

    _stats.LTV.current = Math.min(currentLTV, 100).toFixed(2);

    if (inputValue) {
      const rawFutureLTV = !!newCollateral
        ? (newDebt / newCollateral) * 100
        : 0;

      const futureLTV = Math.min(rawFutureLTV, LT);

      const futureHF = !!newDebt
        ? (newCollateral * liquidationThreshold) / newDebt
        : Infinity;

      _stats.LTV.future = futureLTV.toFixed(2);
      _stats.HF.future = formatHealthFactor(futureHF);
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

  return (
    <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col gap-2 md:gap-6 w-full lg:w-2/3 font-medium">
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <StatItem
          label={isCollateral ? "Supplied" : "Borrowed"}
          value={isCollateral ? stats.supplied.current : stats.borrowed.current}
          futureValue={
            isCollateral ? stats.supplied.future : stats.borrowed.future
          }
          subValue={isCollateral ? stats.supplied.inUSD : stats.borrowed.inUSD}
          symbol={activeAsset?.assetData?.symbol}
          isLoading={isPoolLoading || isReservesLoading}
        />

        <StatItem
          label={isCollateral ? "Supply APR" : "Borrow APR"}
          value={`${isCollateral ? stats.APR.supply : stats.APR.borrow}%`}
          isLoading={isPoolLoading || isReservesLoading}
        />
      </div>
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        {isIsolatedMarket && (
          <StatItem
            label="LTV"
            value={`${stats.LTV.current}%`}
            futureValue={
              stats.LTV.future !== "0" ? `${stats.LTV.future}%` : undefined
            }
            valuesColor={{
              current: getLTVTextColor(
                Number(stats.LTV.current),
                stats.maxLTV,
                stats.LT
              ),
              future: getLTVTextColor(
                Number(stats.LTV.future),
                stats.maxLTV,
                stats.LT
              ),
            }}
            isLoading={isPoolLoading || isReservesLoading}
          />
        )}

        <StatItem
          label="Health Factor"
          value={stats.HF.current}
          futureValue={stats.HF.future !== "0" ? stats.HF.future : undefined}
          valuesColor={{
            current: getHFTextColor(Number(stats.HF.current), market?.type),
            future: getHFTextColor(Number(stats.HF.future), market?.type),
          }}
          isLoading={isPoolLoading || isReservesLoading}
        />
      </div>
    </div>
  );
};

export { BasicStats };
