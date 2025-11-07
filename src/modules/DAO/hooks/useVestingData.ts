import { useEffect, useState } from "react";

import { formatUnits } from "viem";

import { VESTING_FOUNDATION } from "../constants";

import { VestingABI, web3clients } from "@web3";

type TResult = {
  data: string;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useVestingData = (network: string): TResult => {
  const [data, setData] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);

  const client = web3clients[network as keyof typeof web3clients];

  const fetchVestingData = async () => {
    setIsLoading(true);

    try {
      const releasable = (await client.readContract({
        address: VESTING_FOUNDATION,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const formattedReleasable = Number(formatUnits(releasable, 18)).toFixed(
        2
      );

      setData(formattedReleasable);
    } catch (error) {
      console.error("Get vesting data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVestingData();
  }, [client]);

  return { data, isLoading, refetch: fetchVestingData };
};
