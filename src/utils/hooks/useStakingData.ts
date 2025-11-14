import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import { apiData, stakingData } from "@store";

import { TStakingData } from "@types";

type TResult = {
  data: TStakingData | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useStakingData = (): TResult => {
  const $stakingData = useStore(stakingData);
  const $apiData = useStore(apiData);

  const fetchStakingData = async () => {
    try {
      if (!$apiData?.total) return;

      const general = $apiData.total;

      const APR = Number(Number(general?.xSTBLPendingAPR ?? 0).toFixed());
      const staked = Number(general?.xSTBLStaked ?? 0);
      // @todo add staked in usd etc and use in staking page
      stakingData.set({ APR, staked });
    } catch (error) {
      console.error("Error fetching staking data:", error);
    }
  };

  useEffect(() => {
    if ($stakingData === undefined) {
      fetchStakingData();
    }
  }, [$apiData]);

  return {
    data: $stakingData,
    isLoading: $stakingData === undefined,
    refetch: fetchStakingData,
  };
};
