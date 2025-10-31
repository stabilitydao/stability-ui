import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import axios from "axios";

import { formatTimestampToDate } from "@utils";

import { marketsLiquidations } from "@store";

import { seeds } from "@stabilitydao/stability";

import type { TLiquidation } from "@types";

type TResult = {
  data: TLiquidation[] | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useMarketLiquidations = (
  network: string,
  market: string
): TResult => {
  const $marketsLiquidations = useStore(marketsLiquidations);
  const data = $marketsLiquidations[market];

  const fetchLiquidations = async () => {
    try {
      const req = await axios.get(
        `${seeds[0]}/lending/${network}/${market}/liquidations`
      );

      if (req.data) {
        const liquidations: TLiquidation[] = req.data.map(
          (liquidation: any) => ({
            user: liquidation.user,
            liquidator: liquidation.liquidator,
            liquidated: Number(liquidation?.liquidatedCollateralAmountInUSD),
            debt: Number(liquidation?.debtToCoverInUSD),
            timestamp: Number(liquidation.blockTimestamp),
            date: formatTimestampToDate(
              liquidation?.blockTimestamp,
              true,
              true
            ),
          })
        );

        marketsLiquidations.setKey(market, liquidations);
      }
    } catch (error) {
      console.error("Get market liquidations error:", error);
    }
  };

  useEffect(() => {
    if (data === undefined) {
      fetchLiquidations();
    }
  }, [network, market, seeds]);

  return {
    data,
    isLoading: data === undefined,
    refetch: fetchLiquidations,
  };
};
