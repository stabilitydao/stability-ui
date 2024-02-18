import { atom, deepMap } from "nanostores";
import type { PublicClient } from "wagmi";

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
const publicClient = atom<PublicClient | undefined>();
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

// temp hide fee APR condition
const hideFeeApr = atom(false);

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
};
