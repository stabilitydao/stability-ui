import { atom } from "nanostores";
import type { PublicClient } from "wagmi";
import type {
  PlatformData,
  UserBalance,
  Vaults,
  assetPrices,
  Balances,
} from "../types";

export const account = atom<string | undefined>();
export const network = atom<string | undefined>();
export const publicClient = atom<PublicClient | undefined>();
export const platformData = atom<PlatformData | undefined>();
export const userBalance = atom<UserBalance | undefined>();
export const lastTx = atom<string | undefined>();
export const assets = atom<string[] | undefined>();
export const assetsPrices = atom<assetPrices | undefined>();
export const assetsBalances = atom<Balances | undefined>();

export const vaultData = atom<Vaults>({});

//Assets balances
export function addAssetBalance(r: any[]) {
  const assets = r[0];
  const _assetsBalances = r[2];
  const balances: Balances = {};
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
}

//Vaults list
export function addVaultData(data: any[]) {
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
