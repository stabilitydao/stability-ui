import { atom } from "nanostores";
import type { PublicClient } from "wagmi";
import type {
  TPlatformData,
  TUserBalance,
  TVaults,
  TAssetPrices,
  TBalances,
  TVaultAssets,
} from "@types";

const account = atom<string | undefined>();
const network = atom<string | undefined>();
const publicClient = atom<PublicClient | undefined>();
const platformData = atom<TPlatformData | undefined>();
const userBalance = atom<TUserBalance | undefined>();
const lastTx = atom<string | undefined>();
const assets = atom<string[] | undefined>();
const assetsPrices = atom<TAssetPrices | undefined>();
const assetsBalances = atom<TBalances | undefined>();

const vaultData = atom<TVaults>({});

const vaults = atom<any>();
const vaultAssets = atom<TVaultAssets[] | undefined>();

//Assets balances
const addAssetBalance = (r: any[]) => {
  const assets = r[0];
  const _assetsBalances = r[2];
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

//Vaults list
const addVaultData = (data: any[]) => {
  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
  const vault: TVaults = {};
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
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
};

export {
  account,
  network,
  publicClient,
  platformData,
  userBalance,
  lastTx,
  assets,
  assetsPrices,
  assetsBalances,
  vaultData,
  vaults,
  addAssetBalance,
  addVaultData,
  vaultAssets,
};
