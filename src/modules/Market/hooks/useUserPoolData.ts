import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { AavePoolABI, web3clients } from "@web3";

import {
  account,
  connected,
  currentChainID,
  lastTx,
  userPoolsData,
} from "@store";

import { TAddress, TUserPoolData } from "@types";

type TResult = {
  data: TUserPoolData | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useUserPoolData = (
  network: string,
  poolAddress: TAddress | undefined
): TResult => {
  const $account = useStore(account);
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);
  const $lastTx = useStore(lastTx);
  const $userPoolsData = useStore(userPoolsData);

  const client = web3clients[network as keyof typeof web3clients];

  const isLoading = !$userPoolsData[poolAddress || ""];

  const fetchUserData = async () => {
    if (!$account || !poolAddress) return;

    try {
      const userData = (await client.readContract({
        address: poolAddress,
        abi: AavePoolABI,
        functionName: "getUserAccountData",
        args: [$account],
      })) as bigint[];

      const ltv = Number((Number(userData[4]) / 100).toFixed(2));
      const healthFactor = Number(formatUnits(userData[5], 18));

      userPoolsData.setKey(poolAddress, {
        ltv,
        healthFactor,
      });
    } catch (error) {
      console.error("Get user pool data error:", error);
    }
  };

  useEffect(() => {
    if (!$userPoolsData[poolAddress || ""]) {
      fetchUserData();
    }
  }, [$account, $connected, $currentChainID, $lastTx, poolAddress, network]);

  return {
    data: $userPoolsData[poolAddress || ""],
    isLoading,
    refetch: fetchUserData,
  };
};
