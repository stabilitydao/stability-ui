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
  if (vaultSymbol.match(/CF$/)) {
    return "CF";
  }
  if (vaultSymbol.match(/DQMFN[a-z0-9]{1}$/)) {
    return "DQMF";
  }
  if (vaultSymbol.match(/IQMF[a-z0-9]{0,1}$/)) {
    return "IQMF";
  }
  if (vaultSymbol.match(/GQMF(S|N|W)$/)) {
    const symbol = vaultSymbol.match(/GQMFS$/)
      ? "GQMF Stable"
      : vaultSymbol.match(/GQMFN$/)
      ? "GQMF Narrow"
      : vaultSymbol.match(/GQMFW$/)
      ? "GQMF Wide"
      : "Unknown";
    return symbol;
  }

  return "Unknown";
};
