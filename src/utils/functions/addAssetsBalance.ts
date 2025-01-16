import type { TBalances, TFrontendBalances } from "@types";

/**
 * Converts platform balance data into a standardized balance object
 *
 * @example
 * ```
 * const data = [
 *   10n,
 *   ["0xaddress","0xaddress"],
 *   [1000n, 2000n]
 *   [1000n, 2000n]
 * ];
 *
 * const balances = addAssetsBalance(data);
 * ```
 *
 * @param {TFrontendBalances} data - Data array containing platform balance information
 *
 * @returns {TBalances} An object where the keys are asset addresses (in lowercase) and the values are their corresponding balances
 */

const addAssetsBalance = (data: TFrontendBalances): TBalances => {
  const assets = data[1].map((address: string) => address.toLowerCase());
  const assetsBalances = data[3];
  const balances: TBalances = {};

  for (let i = 0; i < assets.length; i++) {
    balances[assets[i]] = assetsBalances[i];
  }
  return balances;
};

export { addAssetsBalance };
