import { assetsBalances } from "@store";

import type { TBalances } from "@types";

const addAssetsBalance = (data: any[]) => {
  const assets = data[0];
  const _assetsBalances = data[2];
  const balances: TBalances = {};
  if (assets.length === _assetsBalances.length) {
    for (let i = 0; i < assets.length; i++) {
      balances[assets[i]] = {
        assetBalance: _assetsBalances[i],
      };
    }
    assetsBalances.set(balances);
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
};

export { addAssetsBalance };
