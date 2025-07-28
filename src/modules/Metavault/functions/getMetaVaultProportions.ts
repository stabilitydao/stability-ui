import { formatUnits } from "viem";

import { sonicClient, IMetaVaultABI } from "@web3";

import type { TAddress } from "@types";

type VaultProportions = Record<string, { current: number; target: number }>;

export const getMetaVaultProportions = async (
  address: TAddress
): Promise<VaultProportions> => {
  const [vaults, current, target] = await Promise.all([
    sonicClient.readContract({
      address,
      abi: IMetaVaultABI,
      functionName: "vaults",
    }),
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

  return vaults.reduce((acc, vault: TAddress, index: number) => {
    acc[vault.toLowerCase()] = {
      current: Number(formatUnits(current[index], 18)) * 100,
      target: Number(formatUnits(target[index], 18)) * 100,
    };
    return acc;
  }, {} as VaultProportions);
};
