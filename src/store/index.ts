import { atom, deepMap } from "nanostores";
import type { PublicClient } from "wagmi";
import type {
  TPlatformData,
  TUserBalance,
  TVaults,
  TAssetPrices,
  TBalances,
  TVaultAssets,
  TLocalVault,
  TAddress,
} from "@types";
import { platform } from "@web3";

// atoms
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

const balances = atom<any>();
const vaultAssets = atom<TVaultAssets[] | undefined>();
const isVaultsLoaded = atom<boolean>(false);

const tokens = atom<TAddress[] | undefined>();

const connected = atom<boolean | undefined>();

const apiData = atom<any>();
const vaultTypes = atom();
const strategyTypes = atom();

// deepMaps

const vaults = deepMap<any>();

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
  vaultAssets,
  isVaultsLoaded,
  balances,
  tokens,
  connected,
  apiData,
  vaultTypes,
  strategyTypes,
};
