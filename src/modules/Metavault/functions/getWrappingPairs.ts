import { getTokenData } from "@utils";

import { TMetaVault, TTokenData, TAddress, VaultTypes } from "@types";

export const getWrappingPairs = (
  vault: TMetaVault,
  assetsForDeposit: TAddress[]
): TTokenData => {
  if (vault.type === VaultTypes.MultiVault) {
    const wrap = getTokenData(assetsForDeposit?.[0].toLowerCase());

    const unwrapMap: Record<string, TTokenData> = {
      metaUSDC: {
        address: "0xeeeeeee6d95e55a468d32feb5d6648754d10a967",
        symbol: "wmetaUSDC",
      },
      metascUSD: {
        address: "0xcccccccca9fc69a2b32408730011edb3205a93a1",
        symbol: "wmetascUSD",
      },
      metawS: {
        address: "0xffffffff2fcbefae12f1372c56edc769bd411685",
        symbol: "wmetawS",
      },
    };

    return { wrap, unwrap: unwrapMap[vault.symbol] ?? {} };
  }

  const wrap = vault;
  const unwrap =
    vault.symbol === "metaUSD"
      ? {
          address: "0xaaaaaaaac311d0572bffb4772fe985a750e88805",
          symbol: "wmetaUSD",
        }
      : {
          address: "0xbbbbbbbbbd0ae69510ce374a86749f8276647b19",
          symbol: "wmetaS",
        };

  return { wrap, unwrap };
};
