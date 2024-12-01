import type { TBalances, TPlatformGetBalance } from "@types";

/**
 * Converts platform balance data into a standardized balance object
 *
 * @example
 * ```
 * const data = [
 *   ['0x123...', '0xabc...'],
 *   [],
 *   [1000, 2000]
 * ];
 *
 * const balances = addAssetsBalance(data);
 * ```
 *
 * @param {TPlatformGetBalance} data - Data array containing platform balance information
 *
 * @returns {TBalances} An object where the keys are asset addresses (in lowercase) and the values are their corresponding balances
 */

const addAssetsBalance = (data: TPlatformGetBalance): TBalances => {
  const assets = data[0].map((address: string) => address.toLowerCase());
  const assetsBalances = data[2];
  const balances: TBalances = {};

  for (let i = 0; i < assets.length; i++) {
    balances[assets[i]] = assetsBalances[i];
  }
  return balances;
};

export { addAssetsBalance };
