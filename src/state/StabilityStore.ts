import { atom } from "nanostores";
import type { PublicClient } from "wagmi";
import type { PlatformData, UserBalance, Vaults, assetPrices } from "../types";

export const account = atom<string | undefined>();
export const network = atom<string | undefined>();
export const publicClient = atom<PublicClient | undefined>();
export const platformData = atom<PlatformData | undefined>();
export const userBalance = atom<UserBalance | undefined>();
export const lastTx = atom<string | undefined>();
export const assets = atom<string[] | undefined>();
export const assetsPrices = atom<assetPrices | undefined>();

//Vaults list
export const vaultData = atom<Vaults>({});

export function addVaultData(data: any[]) {
  console.log(vaultData);

  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
  const vault: Vaults = {};
  if (
    vaultAddress.length === vaultSharePrice.length &&
    vaultAddress.length === vaultUserBalance.length
  ) {
    for (let i = 0; i < vaultAddress.length; i++) {
      vault[vaultAddress[i]] = {
        vaultSharePrice: vaultSharePrice[i],
        vaultUserBalance: vaultUserBalance[i],
      };
    }
    vaultData.set(vault);
    console.log(vaultData);
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
}
//Vaults list
//Vault for URL
