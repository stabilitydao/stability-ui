import { useEffect, useState, useCallback } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits, zeroAddress } from "viem";

import { getTokenData } from "@utils";

import { connected, account } from "@store";

import { StabilityDAOABI, web3clients } from "@web3";

import { STBL_DAO } from "../constants";

type TUserData = {
  balance: string;
  delegatedTo: string;
  delegatedToYou: string;
};

type TResult = {
  data: TUserData;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useUserData = (network: string): TResult => {
  const [data, setData] = useState<TUserData>({
    balance: "0",
    delegatedTo: "Self",
    delegatedToYou: "0",
  });

  const [isLoading, setIsLoading] = useState(true);

  const client = web3clients[network as keyof typeof web3clients];

  const $connected = useStore(connected);
  const $account = useStore(account);

  const fetchUserData = useCallback(async () => {
    if (!$account) return;

    setIsLoading(true);

    try {
      const decimals = getTokenData(STBL_DAO)?.decimals ?? 18;

      const balanceRaw = (await client.readContract({
        address: STBL_DAO,
        abi: StabilityDAOABI,
        functionName: "balanceOf",
        args: [$account],
      })) as bigint;

      const votesRaw = (await client.readContract({
        address: STBL_DAO,
        abi: StabilityDAOABI,
        functionName: "getVotes",
        args: [$account],
      })) as bigint;

      const delegatesRaw = await client.readContract({
        address: STBL_DAO,
        abi: StabilityDAOABI,
        functionName: "delegates",
        args: [$account],
      });

      const balance = Number(formatUnits(balanceRaw, decimals)).toFixed(2);

      const formattedVotes = Number(formatUnits(votesRaw, decimals)).toFixed(2);

      const delegatedToYou = String(Number(formattedVotes) - Number(balance));

      const delegatedTo = [zeroAddress, $account.toLowerCase()].includes(
        delegatesRaw[0]
      )
        ? "Self"
        : delegatesRaw[0];

      setData({
        balance,
        delegatedTo,
        delegatedToYou,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [$account, $connected]);

  useEffect(() => {
    fetchUserData();
  }, [$account, $connected]);

  return { data, isLoading, refetch: fetchUserData };
};
