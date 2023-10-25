import type { TokenData } from "./types";
import tokenlist from "./stability.tokenlist.json"

export function getTokenData(address: string): TokenData|undefined {
    for (const t of tokenlist.tokens) {
        if (t.address.toLowerCase() === address.toLowerCase()) {
            return {
                address: t.address,
                chainId: t.chainId,
                decimals: t.decimals,
                name: t.name,
                symbol: t.symbol,
                logoURI: t.logoURI,
            }
        }
    }
    return undefined
}
