import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits, zeroAddress } from "viem";

import { getTokenData } from "@utils";

import { connected, account, marketPrices, apiData } from "@store";

import { StabilityDAOABI, web3clients } from "@web3";

import { STBL_DAO } from "../constants";

type TUserData = {
  balance: string;
  balanceInUSD: string;
  share: string;
  rank: string;
  delegatedTo: string;
  delegatedToYou: string;
  totalSupply: string;
  totalSupplyInUSD: string;
};

type TResult = {
  data: TUserData;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useUserData = (network: string): TResult => {
  const [data, setData] = useState<TUserData>({
    balance: "0",
    balanceInUSD: "0",
    share: "0",
    rank: "-",
    delegatedTo: "Self",
    delegatedToYou: "0",
    totalSupply: "0",
    totalSupplyInUSD: "0",
  });

  const [isLoading, setIsLoading] = useState(true);

  const client = web3clients[network as keyof typeof web3clients];

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $marketPrices = useStore(marketPrices);
  const $apiData = useStore(apiData);

  const fetchUserData = async () => {
    if (!$account) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const STBL_PRICE = Number($marketPrices?.STBL?.price) ?? 0;

    let rank = "-";

    if (!!$apiData?.daoTokenHolders?.[146]) {
      //@ts-ignore
      const holdersData = Object.values($apiData?.daoTokenHolders?.[146])
        .sort((a, b) => Number(b?.percentage) - Number(a?.percentage))
        .map((data: any, index: number) => ({
          ...data,
          rank: index + 1,
        }));

      rank = String(
        holdersData.find(
          (holder) => holder.address.toLowerCase() === $account.toLowerCase()
        )?.rank ?? "-"
      );
    }

    try {
      const decimals = getTokenData(STBL_DAO)?.decimals ?? 18;

      const totalSupplyRaw = (await client.readContract({
        address: STBL_DAO,
        abi: StabilityDAOABI,
        functionName: "totalSupply",
      })) as bigint;

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

      const totalSupply = Number(formatUnits(totalSupplyRaw, decimals)).toFixed(
        2
      );

      const totalSupplyInUSD = (Number(totalSupply) * STBL_PRICE).toFixed(2);

      const balanceInUSD = (Number(balance) * STBL_PRICE).toFixed(2);

      const share = ((Number(balance) / Number(totalSupply)) * 100).toFixed(2);

      setData({
        balance,
        balanceInUSD,
        share,
        rank,
        delegatedTo,
        delegatedToYou,
        totalSupply,
        totalSupplyInUSD,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [$account, $connected, $marketPrices, $apiData]);

  return { data, isLoading, refetch: fetchUserData };
};
