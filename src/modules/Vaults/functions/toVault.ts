export const toVault = (network: string, address: string): void => {
  window.location.href = `/vault/${network}/${address}`;
};
