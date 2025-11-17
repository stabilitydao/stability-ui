import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import axios from "axios";

import { getLTVTextColor } from "../functions";

import { marketsUsers } from "@store";

import { seeds } from "@stabilitydao/stability";

import type { TAddress, TMarket, TMarketUser } from "@types";

type TResult = {
  data: TMarketUser[] | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useMarketUsers = (market: TMarket): TResult => {
  const marketId = market?.marketId;
  const network = market?.network?.id;

  const $marketsUsers = useStore(marketsUsers);

  const data = $marketsUsers[marketId];

  const fetchUsers = async () => {
    // @dev if we have data but need to refetch LTV color
    if (data) {
      const users: TMarketUser[] = data.map((obj) => ({
        ...obj,
        LTVColor: getLTVTextColor(
          obj?.LTV * 100,
          market.risk.maxLTV,
          market.risk.LT
        ),
      }));

      marketsUsers.setKey(marketId, users);
      return;
    }

    try {
      const res = await axios.get(
        `${seeds[0]}/lending/${network}/${marketId}/users`
      );

      if (res.data) {
        const users: TMarketUser[] = Object.entries(res.data).map(
          ([address, userData]: [string, any]) => ({
            address: address as TAddress,
            collateral: userData?.aTokenBalanceUsd ?? 0,
            debt: userData?.debtTokenBalanceUsd ?? 0,
            LTV: userData?.ltv ?? 0,
            LTVColor: getLTVTextColor(
              (userData?.ltv ?? 0) * 100,
              market.risk.maxLTV,
              market.risk.LT
            ),
          })
        );

        marketsUsers.setKey(marketId, users);
      }
    } catch (error) {
      console.error("Get market users error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [market]);

  return {
    data,
    isLoading: !data,
    refetch: fetchUsers,
  };
};
