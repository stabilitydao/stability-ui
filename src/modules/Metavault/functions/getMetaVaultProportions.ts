import { formatUnits } from "viem";

import { sonicClient, IMetaVaultABI } from "@web3";

import type { TAddress } from "@types";

export const getMetaVaultProportions = async (address: TAddress) => {
  const [current, target] = await Promise.all([
    sonicClient.readContract({
      address,
      abi: IMetaVaultABI,
      functionName: "currentProportions",
    }),
    sonicClient.readContract({
      address,
      abi: IMetaVaultABI,
      functionName: "targetProportions",
    }),
  ]);

  return {
    current: current.map(
      (proportion: bigint) => Number(formatUnits(proportion, 18)) * 100
    ),
    target: target.map(
      (proportion: bigint) => Number(formatUnits(proportion, 18)) * 100
    ),
  };
};
