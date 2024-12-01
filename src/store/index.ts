import { atom, deepMap } from "nanostores";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

import { deserialize, serialize } from "wagmi";

import { DEFAULT_ERROR, DEFAULT_TRANSACTION_SETTINGS } from "@constants";

import type {
  TPlatformData,
  TUserBalance,
  TBalances,
  TAddress,
  TSettings,
  TError,
  TMultichainPrices,
  TTokens,
  TVaultDataKey,
  TAPRPeriod,
} from "@types";

// atoms
const account = atom<TAddress | undefined>();
const publicClient = atom<any>();
const platformsData = atom<TPlatformData>({});

const platformVersions = atom<Record<string, string>>({});
const userBalance = atom<TUserBalance | undefined>();
const lastTx = atom<string | undefined>();
const assetsPrices = atom<TMultichainPrices>({});
const assetsBalances = atom<{ [key: string]: TBalances }>({});
const vaultData = atom<TVaultDataKey>({});
const transactionSettings = atom<TSettings>(DEFAULT_TRANSACTION_SETTINGS);

const balances = atom<any>();
const visible = atom<boolean>(true);
const isVaultsLoaded = atom<boolean>(false);

const tokens = atom<TTokens>({});

const connected = atom<boolean | undefined>();

const reload = atom<boolean>(false);
const error = atom<TError>(DEFAULT_ERROR);
const isWeb3Load = atom<boolean>(true);

const apiData = atom<any>();

const currentChainID = atom("137");

// deepMaps

const vaults = deepMap<any>(false);

// portfolio
const aprFilter = atom<TAPRPeriod>("daily");

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
  publicClient,
  platformsData,
  userBalance,
  lastTx,
  assetsPrices,
  assetsBalances,
  vaultData,
  vaults,
  isVaultsLoaded,
  balances,
  visible,
  tokens,
  connected,
  apiData,
  transactionSettings,
  platformVersions,
  reload,
  error,
  isWeb3Load,
  queryClient,
  persister,
  aprFilter,
  currentChainID,
};
