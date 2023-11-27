import type { TTokenData } from "@types";
import tokenlist from "../../stability.tokenlist.json";

export const getTokenData = (address: string): TTokenData | undefined => {
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
};
