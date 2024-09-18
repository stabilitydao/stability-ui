/**
 * Redirects the user to the vault page based on the provided network and vault address
 *
 * @param {string} network - Network
 * @param {string} address - Vault's unique address
 */

export const toVault = (network: string, address: string): void => {
  window.location.href = `/vault/${network}/${address}`;
};
