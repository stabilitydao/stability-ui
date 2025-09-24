import { getTokenData } from "@utils";

import { TMetaVault, TTokenData, TAddress, VaultTypes } from "@types";

export const getWrappingPairs = (
  vault: TMetaVault,
  assetsForDeposit: TAddress[]
): TTokenData => {
  if (vault.type === VaultTypes.MultiVault) {
    const wrap = getTokenData(assetsForDeposit?.[0].toLowerCase());

    const unwrapMap: Record<TAddress, TTokenData> = {
      "0x22222222780038f8817b3de825a070225e6d9874": {
        address: "0xeeeeeee6d95e55a468d32feb5d6648754d10a967",
        symbol: "wmetaUSDC",
      },
      "0x33333333c480194b5b651987b7d00b20ddcbd287": {
        address: "0xcccccccca9fc69a2b32408730011edb3205a93a1",
        symbol: "wmetascUSD",
      },
      "0x555555554776b14b30597d1032e48f9e16db22a4": {
        address: "0xffffffff2fcbefae12f1372c56edc769bd411685",
        symbol: "wmetawS",
      },
    };

    return { wrap, unwrap: unwrapMap[vault.address] ?? {} };
  }

  const wrap = vault;

  const unwrapMap: Record<TAddress, TTokenData> = {
    "0x22226a3c59c52f6768cd44b97b88167217c12222": {
      address: "0xcCCCaBc3370633AD166669b27A71eB3aE4bFCcCc",
      symbol: "wmetaUSDC",
    },
    "0x1111111199558661bf7ff27b4f1623dc6b91aa3e": {
      address: "0xaaaaaaaac311d0572bffb4772fe985a750e88805",
      symbol: "wmetaUSD",
    },
    "0x4444444420d9de54d69b3997b7d6a31d2bf63f32": {
      address: "0xbbbbbbbbbd0ae69510ce374a86749f8276647b19",
      symbol: "wmetaS",
    },
  };

  return { wrap, unwrap: unwrapMap[vault.address] ?? {} };
};
