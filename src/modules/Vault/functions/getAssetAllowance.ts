import { getAddress } from "viem";

import { account } from "@store";

import { ERC20ABI } from "@web3";

import type { TAddress } from "@types";

/**
 * Fetches the allowance of an asset for a given vault or zap address, depending on the user's interaction (Deposit/Withdraw)
 *
 * @example
 * ```
 * const allowance = await getAssetAllowance(client, assetAddress, "Deposit", vaultAddress, underlyingAddress, zapAddress);
 * ```
 *
 * @param {unknown} client - Client instance used to interact with the blockchain
 * @param {TAddress} asset - Address of the asset (ERC-20 token) to check the allowance for
 * @param {string} tab - Current tab ("Deposit" or "Withdraw"), which determines the contract to check the allowance for
 * @param {TAddress} vaultAddress - Address of the vault for which the allowance is being checked
 * @param {TAddress} underlyingAddress - Address of the underlying asset associated with the vault
 * @param {TAddress} zap - Address of the zap contract
 *
 * @returns {Promise<bigint>} Returns a promise that resolves to the allowance amount (as a `bigint`)
 */

const getAssetAllowance = async (
  client: unknown,
  asset: TAddress,
  tab: string,
  vaultAddress: TAddress,
  underlyingAddress: TAddress,
  zap: TAddress
): Promise<bigint> => {
  asset = getAddress(asset) as TAddress;

  const address = tab === "Deposit" ? asset : vaultAddress;

  const fromAddress: TAddress =
    tab === "Deposit" && asset === underlyingAddress ? vaultAddress : zap;

  const allowanceData = await client?.readContract({
    address: address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [account.get() as TAddress, fromAddress],
  });

  return allowanceData;
};

export { getAssetAllowance };
