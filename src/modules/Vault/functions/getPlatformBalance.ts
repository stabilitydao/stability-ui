import { addAssetsBalance } from "@utils";

import { assetsBalances } from "@store";

import { platforms, PlatformABI } from "@web3";

import type { TAddress, TBalances } from "@types";

const getPlatformBalance = async (
  publicClient: any,
  network: string,
  address: TAddress
): Promise<TBalances | undefined> => {
  const contractBalance = await publicClient?.readContract({
    address: platforms[network],
    abi: PlatformABI,
    functionName: "getBalance",
    args: [address],
  });

  const currentChainBalances = addAssetsBalance(contractBalance);

  const oldBalances = assetsBalances.get();

  oldBalances[network] = currentChainBalances;

  assetsBalances.set(oldBalances);

  return currentChainBalances;
};

export { getPlatformBalance };
