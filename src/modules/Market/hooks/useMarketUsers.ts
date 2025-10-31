import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import axios from "axios";

import { marketsUsers } from "@store";

import { seeds } from "@stabilitydao/stability";

import type { TAddress, TMarketUser } from "@types";

type TResult = {
  data: TMarketUser[] | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useMarketUsers = (network: string, market: string): TResult => {
  const $marketsUsers = useStore(marketsUsers);
  const data = $marketsUsers[market];

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${seeds[0]}/lending/${network}/${market}/users`
      );

      if (res.data) {
        const users: TMarketUser[] = Object.entries(res.data).map(
          ([address, userData]: [string, any]) => ({
            address: address as TAddress,
            collateral: userData?.aTokenBalanceUsd ?? 0,
            debt: userData?.debtTokenBalanceUsd ?? 0,
            LTV: userData?.ltv ?? 0,
          })
        );

        marketsUsers.setKey(market, users);
      }
    } catch (error) {
      console.error("Get market users error:", error);
    }
  };

  useEffect(() => {
    if (data === undefined) {
      fetchUsers();
    }
  }, [network, market, seeds]);

  return {
    data,
    isLoading: data === undefined,
    refetch: fetchUsers,
  };
};
