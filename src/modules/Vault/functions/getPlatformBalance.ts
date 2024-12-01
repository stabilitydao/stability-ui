import { addAssetsBalance } from "@utils";

import { assetsBalances } from "@store";

import { platforms, PlatformABI } from "@web3";

import type { TAddress, TBalances } from "@types";

/**
 * Retrieves the balance of a user's assets from a specific platform on a blockchain network, updates the global store, and returns the balances
 *
 * @example
 * ```
 * const balances = await getPlatformBalance(publicClient, "mainnet", "0xUserAddress");
 * ```
 *
 * @param {any} publicClient - Public client instance used to interact with the blockchain
 * @param {string} network - Network
 * @param {TAddress} address - User wallet address for which the balance is retrieved
 *
 * @returns {Promise<TBalances>} Promise that resolves to the balances of assets for the given platform
 */

export const getPlatformBalance = async (
  publicClient: any,
  network: string,
  address: TAddress
): Promise<TBalances> => {
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
