import { useEffect, useState } from "react";

import { formatUnits } from "viem";

import { VESTING_ADDRESSES } from "../constants";

import { VestingABI, web3clients } from "@web3";

import type { TAddress } from "@types";

type TResult = {
  data: {
    foundation: string;
    community: string;
    investors: string;
    team: string;
  };
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useVestingData = (network: string): TResult => {
  const [data, setData] = useState({
    foundation: "0",
    community: "0",
    investors: "0",
    team: "0",
  });
  const [isLoading, setIsLoading] = useState(true);

  const client = web3clients[network as keyof typeof web3clients];

  const fetchVestingData = async () => {
    setIsLoading(true);

    try {
      const foundationReleasable = (await client.readContract({
        address: VESTING_ADDRESSES.foundation as TAddress,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const communityReleasable = (await client.readContract({
        address: VESTING_ADDRESSES.community as TAddress,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const investorsReleasable = (await client.readContract({
        address: VESTING_ADDRESSES.investors as TAddress,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const teamReleasable = (await client.readContract({
        address: VESTING_ADDRESSES.team as TAddress,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const formattedFoundationReleasable = Number(
        formatUnits(foundationReleasable, 18)
      ).toFixed(2);

      const formattedCommunityReleasable = Number(
        formatUnits(communityReleasable, 18)
      ).toFixed(2);

      const formattedInvestorsReleasable = Number(
        formatUnits(investorsReleasable, 18)
      ).toFixed(2);

      const formattedTeamReleasable = Number(
        formatUnits(teamReleasable, 18)
      ).toFixed(2);

      setData({
        foundation: formattedFoundationReleasable,
        community: formattedCommunityReleasable,
        investors: formattedInvestorsReleasable,
        team: formattedTeamReleasable,
      });
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
