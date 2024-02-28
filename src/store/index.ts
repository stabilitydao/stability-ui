import { atom, deepMap } from "nanostores";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

import { deserialize, serialize } from "wagmi";

import { DEFAULT_TRANSACTION_SETTINGS } from "@constants";

import type {
  TPlatformData,
  TUserBalance,
  TVaults,
  TAssetPrices,
  TBalances,
  TVaultAssets,
  TAddress,
  TSettings,
  TError,
} from "@types";

// atoms
const account = atom<string | undefined>();
const network = atom<string | undefined>();
const publicClient = atom<any>();
const platformData = atom<TPlatformData | undefined>();
const platformVersion = atom<string>("24.01.1-alpha");
const userBalance = atom<TUserBalance | undefined>();
const lastTx = atom<string | undefined>();
const assets = atom<string[] | undefined>();
const assetsPrices = atom<TAssetPrices | undefined>();
const assetsBalances = atom<TBalances | undefined>();
const vaultData = atom<TVaults>({});
const transactionSettings = atom<TSettings>(DEFAULT_TRANSACTION_SETTINGS);

const balances = atom<any>();
const visible = atom<boolean>(true);
const vaultAssets = atom<TVaultAssets[] | undefined>();
const isVaultsLoaded = atom<boolean>(false);

const tokens = atom<TAddress[] | undefined>();

const connected = atom<boolean | undefined>();

const reload = atom<boolean>(false);
const error = atom<TError>({ state: false, type: "", description: "" });
const isWeb3Load = atom<boolean>(false);

const apiData = atom<any>();
const vaultTypes = atom();
const strategyTypes = atom();

// deepMaps

const vaults = deepMap<any>();

// portfolio
const hideFeeApr = atom(false);
const aprFilter = atom("24h");

//// tanstack query

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24,
    },
  },
});
const persister = createSyncStoragePersister({
  serialize,
  storage: window.localStorage,
  deserialize,
});

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
  visible,
  tokens,
  connected,
  apiData,
  vaultTypes,
  strategyTypes,
  transactionSettings,
  platformVersion,
  hideFeeApr,
  reload,
  error,
  isWeb3Load,
  queryClient,
  persister,
  aprFilter,
};
