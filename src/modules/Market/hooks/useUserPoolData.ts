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
  userPoolsLoading,
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
  const $userPoolsLoading = useStore(userPoolsLoading);

  const client = web3clients[network as keyof typeof web3clients];
  const key = poolAddress || "";

  const isLoading = $userPoolsLoading[key] ?? false;

  const fetchUserPoolData = async () => {
    if (!$account || !poolAddress) {
      userPoolsLoading.setKey(key, false);
      return;
    }

    userPoolsLoading.setKey(key, true);

    try {
      const userData = (await client.readContract({
        address: poolAddress,
        abi: AavePoolABI,
        functionName: "getUserAccountData",
        args: [$account],
      })) as bigint[];

      const [
        totalCollateralBaseRaw,
        totalDebtBaseRaw,
        ,
        currentLiquidationThresholdRaw,
        ltvRaw,
        healthFactorRaw,
      ] = userData;

      const totalCollateralBase = Number(
        formatUnits(totalCollateralBaseRaw, 8)
      );

      const totalDebtBase = Number(formatUnits(totalDebtBaseRaw, 8));

      const currentLiquidationThreshold =
        Number(currentLiquidationThresholdRaw) / 10000;

      const maxLTV = Number(ltvRaw) / 100;

      const healthFactor = Number(formatUnits(healthFactorRaw, 18));

      userPoolsData.setKey(poolAddress, {
        totalCollateralBase,
        totalDebtBase,
        currentLiquidationThreshold,
        maxLTV,
        healthFactor,
      });
    } catch (error) {
      console.error("Get user pool data error:", error);
    } finally {
      userPoolsLoading.setKey(key, false);
    }
  };

  useEffect(() => {
    if (!$userPoolsData[key]) {
      fetchUserPoolData();
    }
  }, [$account, $connected, $currentChainID, $lastTx, poolAddress, network]);

  return {
    data: $userPoolsData[key],
    isLoading,
    refetch: fetchUserPoolData,
  };
};
