import type { TVaultData, TPlatformGetBalance, TAddress } from "@types";

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
 * @returns {TVaultData} An object where each key is a lowercased vault address, and the value is an object containing:
 *   - `vaultSharePrice`: The share price of the vault
 *   - `vaultUserBalance`: The user balance in the vault
 *
 * @remarks This function assumes that all input arrays (`vaultAddress`, `vaultSharePrice`, and `vaultUserBalance`) have the same length
 */

const addVaultData = (data: TPlatformGetBalance): TVaultData => {
  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
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
