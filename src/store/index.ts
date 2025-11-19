import { atom, map, deepMap } from "nanostores";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

import { deserialize, serialize } from "wagmi";

import { DEFAULT_ERROR, DEFAULT_TRANSACTION_SETTINGS } from "@constants";

import type {
  TPlatformData,
  TBalances,
  TAddress,
  TSettings,
  TError,
  TMultichainPrices,
  TTokens,
  TVaultDataKey,
  TAPRPeriod,
  TMarketPrices,
  TLiquidation,
  TMarketUser,
  TUserPoolData,
  TUserReservesMap,
  TStakingData,
  TMetaVaultUser,
} from "@types";

// atoms
const account = atom<TAddress | undefined>();
const publicClient = atom<any>();
const platformsData = atom<TPlatformData>({});

const platformVersions = atom<Record<string, string>>({});

const lastTx = atom<string | undefined>();
const assetsPrices = atom<TMultichainPrices>({});
const assetsBalances = atom<{ [key: string]: TBalances }>({});
const vaultData = atom<TVaultDataKey>({});
const transactionSettings = atom<TSettings>(DEFAULT_TRANSACTION_SETTINGS);

const marketPrices = atom<TMarketPrices>({});

const visible = atom<boolean>(true);
const isVaultsLoaded = atom<boolean>(false);
const isMarketsLoaded = atom<boolean>(false);

const tokens = atom<TTokens>({});

const connected = atom<boolean | undefined>();

const isNavbar = atom<boolean>(false);

const reload = atom<boolean>(false);
const error = atom<TError>(DEFAULT_ERROR);
const isWeb3Load = atom<boolean>(true);

const currentChainID = atom();

const stakingData = atom<TStakingData | undefined>(undefined);

// deepMaps

const vaults = deepMap<any>(false);
const metaVaults = deepMap<any>(false);
const markets = deepMap<any>(false);
const apiData = deepMap<any>(false);

const marketsLiquidations = deepMap<Record<string, TLiquidation[]>>({});
const marketsUsers = deepMap<Record<string, TMarketUser[]>>({});
const userPoolsData = deepMap<Record<string, TUserPoolData>>({});
const userReservesData = deepMap<Record<string, TUserReservesMap>>({});

const metaVaultsUsers = deepMap<Record<TAddress, TMetaVaultUser[]>>({});

// maps for loading states

const userPoolsLoading = map<Record<string, boolean>>({});
const userReservesLoading = map<Record<string, boolean>>({});

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
  lastTx,
  assetsPrices,
  assetsBalances,
  vaultData,
  vaults,
  isVaultsLoaded,
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
  metaVaults,
  marketPrices,
  isNavbar,
  markets,
  isMarketsLoaded,
  marketsLiquidations,
  marketsUsers,
  userPoolsData,
  userReservesData,
  userPoolsLoading,
  userReservesLoading,
  stakingData,
  metaVaultsUsers,
};
