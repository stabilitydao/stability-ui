import type { TBalances, TPlatformGetBalance } from "@types";

const addAssetsBalance = (data: TPlatformGetBalance): TBalances | undefined => {
  const assets = data[0].map((address: string) => address.toLowerCase());
  const assetsBalances = data[2];
  const balances: TBalances = {};
  if (assets?.length === assetsBalances?.length) {
    for (let i = 0; i < assets.length; i++) {
      balances[assets[i]] = assetsBalances[i];
    }
    return balances;
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
};

export { addAssetsBalance };
