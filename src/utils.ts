import type { TokenData } from "./types";
import tokenlist from "./stability.tokenlist.json";

export function getTokenData(address: string): TokenData | undefined {
  for (const token of tokenlist.tokens) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return {
        address: token.address,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
      };
    }
  }
  return undefined;
}
