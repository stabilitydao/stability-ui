export const getStrategyShortName = (vaultSymbol: string): string => {
  if (vaultSymbol.match(/GQFS$/)) {
    return "GQF Stable";
  }
  if (vaultSymbol.match(/GQFN$/)) {
    return "GQF Narrow";
  }
  if (vaultSymbol.match(/GQFW$/)) {
    return "GQF Wide";
  }
  if (vaultSymbol.match(/QSF$/)) {
    return "QSF";
  }
  return "Unknown";
};
