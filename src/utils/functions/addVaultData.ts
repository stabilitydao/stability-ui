import type { TVaultDataKey, TPlatformGetBalance } from "@types";

/**
 * Converts platform balance data into a vault data object
 *
 * @example
 * ```
 * const data = [
 *   ['0xVault1', '0xVault2'],
 *   [100, 200],
 *   [50, 150]
 * ];
 * const vaultData = addVaultData(data);
 * ```
 *
 * @param {TPlatformGetBalance} data - The platform balance data, consisting of:
 *   - `vaultAddress`: Array of vault addresses
 *   - `vaultSharePrice`: Array of share prices for each vault
 *   - `vaultUserBalance`: Array of user balances for each vault
 *
 * @returns {TVaultDataKey | undefined} An object where each key is a lowercased vault address, and the value is an object containing:
 *   - `vaultSharePrice`: The share price of the vault
 *   - `vaultUserBalance`: The user balance in the vault
 *   If the lengths of the input arrays do not match, it logs an error and returns `undefined`
 *
 * @remarks This function assumes that all input arrays (`vaultAddress`, `vaultSharePrice`, and `vaultUserBalance`) have the same length
 */

const addVaultData = (data: TPlatformGetBalance): TVaultDataKey | undefined => {
  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
  const vault: TVaultDataKey = {};
  if (
    vaultAddress.length === vaultSharePrice.length &&
    vaultAddress.length === vaultUserBalance.length
  ) {
    for (let i = 0; i < vaultAddress.length; i++) {
      vault[vaultAddress[i].toLowerCase()] = {
        vaultSharePrice: vaultSharePrice[i],
        vaultUserBalance: vaultUserBalance[i],
      };
    }
    return vault;
  } else {
    console.error("There is an error, arrays length are different.");
  }
};

export { addVaultData };
