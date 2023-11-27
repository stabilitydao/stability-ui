import { assetsPrices } from "@store";
import type { TAssetPrices } from "@types";

export const addAssetsPrice = (data: any) => {
  const tokenAdress = data[0];
  const tokenPrice = data[1];
  const assetPrice: TAssetPrices = {};

  try {
    if (tokenAdress.length === tokenPrice.length) {
      for (let i = 0; i < tokenAdress.length; i++) {
        assetPrice[tokenAdress[i]] = {
          tokenPrice: tokenPrice[i],
        };
      }
      assetsPrices.set(assetPrice);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
