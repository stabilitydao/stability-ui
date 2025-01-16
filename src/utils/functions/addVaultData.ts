import type { TVaultData, TFrontendBalances, TAddress } from "@types";

/**
 * Converts platform balance data into a vault data object
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
 * const vaultData = addVaultData(data);
 * ```
 *
 * @param {TFrontendBalances} data - The platform balance data, consisting of:
 *   - `vaultAddress`: Array of vault addresses
 *   - `vaultSharePrice`: Array of share prices for each vault
 *   - `vaultUserBalance`: Array of user balances for each vault
 *
 * @returns {TVaultData} An object where each key is a lowercased vault address, and the value is an object containing:
 *   - `vaultSharePrice`: The share price of the vault
 *   - `vaultUserBalance`: The user balance in the vault
 *
 * @remarks This function assumes that all input arrays (`vaultAddress`, `vaultSharePrice`, and `vaultUserBalance`) have the same length
 */

const addVaultData = (data: TFrontendBalances): TVaultData => {
  const vaultAddress = data[1];
  const vaultSharePrice = data[2];
  const vaultUserBalance = data[3];
  const vault: TVaultData = {};

  for (let i = 0; i < vaultAddress.length; i++) {
    vault[vaultAddress[i].toLowerCase() as TAddress] = {
      vaultSharePrice: vaultSharePrice[i],
      vaultUserBalance: vaultUserBalance[i],
    };
  }
  return vault;
};

export { addVaultData };
