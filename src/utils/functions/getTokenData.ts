import type { TAddress, TTokenData } from "@types";
import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

/**
 * Function to get token data from token list
 *
 * @example
 *
 * ```
 * getTokenData("0x2791bca1f2de4661ed88a30c99a7a9449aa84174")
 * ```
 *
 * @param address - Token address
 *
 * @returns {Object} Token Information
 * @property {string} address - Token contract address
 * @property {number} chainId - ID of the blockchain network (e.g., 137 for Polygon)
 * @property {number} decimals - Number of decimals the token uses
 * @property {string} name - Full name of the token (e.g., "Dai Stablecoin").
 * @property {string} symbol - Token ticker symbol (e.g., "DAI").
 * @property {string} logoURI - URL of the token's logo image.
 * @property {string[]} tags - Array of tags related to the token (e.g., ["stablecoin", "DeFi"]).
 *
 **/

const getTokenData = (address: string): TTokenData | undefined => {
  for (const token of tokenlist.tokens) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return {
        address: token.address.toLowerCase() as TAddress,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token?.tags,
      };
    }
  }
  return undefined;
};

export { getTokenData };
