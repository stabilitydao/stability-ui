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
 * @returns {TBalances | undefined} An object where the keys are asset addresses (in lowercase) and the values are their corresponding balances
 *   If the lengths of the address and balance arrays do not match, the function logs an error and returns `undefined`
 */

const addAssetsBalance = (data: TPlatformGetBalance): TBalances | undefined => {
  const assets = data[0].map((address: string) => address.toLowerCase());
  const assetsBalances = data[2];
  const balances: TBalances = {};
  if (assets?.length === assetsBalances?.length) {
    for (let i = 0; i < assets.length; i++) {
      balances[assets[i]] = assetsBalances[i];
    }
    return balances;
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
};

export { addAssetsBalance };
