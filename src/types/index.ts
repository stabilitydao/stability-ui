import { Dispatch, SetStateAction } from "react";
import type {
  Chain,
  DeFiOrganization,
  YieldContest,
} from "@stabilitydao/stability";

// interfaces
interface IL {
  rate: number;
  title: string;
  desc: string;
  color: string;
}

interface IProtocol {
  name: string;
  logoSrc: string;
}

interface IStrategyInfo {
  id: string;
  shortId: string;
  state?: string;
  contractGithubId?: number;
  color: string;
  bgColor: string;
  protocols: IProtocol[];
  baseStrategies: string[];
  ammAdapter: string;
  sourceCode: string;
  il?: IL;
}

interface IChainData extends Chain {
  chainId: number;
  protocols: number;
  assets: number;
  strategies: number;
  bridges: number;
  tvl: number;
}

type TAssetData = {
  symbol: string;
  website: string;
  price: number;
  addresses: number;
};
type TTableStrategy = {
  id: string;
  shortId: string;
  state: string;
  contractGithubId: number | "is-being-created";
  color: string;
  bgColor: string;
};

// types
type TPlatformData = {
  [key: string]: {
    platform: TAddress;
    factory: TAddress;
    buildingPermitToken: TAddress;
    buildingPayPerVaultToken: TAddress;
    zap: TAddress;
  };
};

type TTokens = {
  [chainId: string]: TAddress[];
};

type TPlatformGetData = [
  string[],
  string[],
  string[],
  string[],
  string[],
  bigint[],
  string[],
  boolean[],
  string[],
  string[],
];
type TPlatformGetBalance = [
  string[],
  bigint[],
  bigint[],
  string[],
  bigint[],
  bigint[],
  string[],
  bigint[],
  bigint,
];

type TUserBalance = {
  buildingPayPerVaultTokenBalance: bigint;
  erc20Balance: { [token: string]: bigint };
  erc721Balance: { [token: string]: bigint };
};

type TInitParams = {
  initVaultAddresses: string[];
  initVaultNums: bigint[];
  initStrategyAddresses: string[];
  initStrategyNums: bigint[];
  initStrategyTicks: number[];
};

type TAllowedBBTokenVaults = {
  [token: string]: number;
};

type TTokenData = {
  address: TAddress;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  tags?: string[];
};

//New types

type TAPRData = {
  latest: string;
  daily: string;
  weekly: string;
};

type TEarningData = {
  apr: TAPRData;
  apy: TAPRData;
  poolSwapFeesAPR: TAPRData;
  farmAPR: TAPRData;
};

type TVaults = {
  [vaultAddress: string]: TVault;
};

type TVaultData = {
  [address: TAddress]: {
    vaultSharePrice: bigint;
    vaultUserBalance: bigint;
  };
};

type TVaultDataKey = {
  [chainId: string]: TVaultData;
};

type TToken = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  logo?: string;
  color?: string;
  tags?: string[];
};

type TPriceInfo = {
  price: string;
  trusted: boolean;
};
type TMultichainPrices = {
  [network: string]: {
    [key: string]: TPriceInfo;
  };
};

type TBalances = {
  [address: string]: bigint;
};

type TAsset = {
  address: TAddress;
  color: string;
  logo: string;
  name: string;
  symbol: string;
};

type TPool = {
  address?: TAddress;
  ammAlgoName?: string;
  ammName?: string;
  amountToken0?: number;
  amountToken1?: number;
  fee?: number;
  tick?: number;
  tvl?: number;
};

type TAPRPeriod = "latest" | "daily" | "weekly";

type TAlmPosition = {
  amountToken0: number;
  amountToken1: number;
  inRange: boolean;
  lowerTick: number;
  tvl: number;
  upperTick: number;
};

type TAlm = {
  protocol: string;
  amountToken0: number;
  amountToken1: number;
  tvl: number;
  positions: TAlmPosition[];
};
type TRisk = {
  factors: string[];
  isRektStrategy: boolean | string;
  symbol: string;
};
type TRebalances = {
  daily: number;
  weekly: number;
};

type TShareData = {
  sharePriceOnCreation?: string;
  sharePrice?: string;
  yieldPercent?: string;
};

type THoldData = {
  symbol: string;
  initPrice: string;
  price: string;
  priceDifference: string;
  dailyAPR: string;
  weeklyAPR: string;
  latestAPR: string;
  APR: string;
};

type TVault = {
  address: TAddress;
  name: string;
  symbol: string;
  created: string;
  assetsPricesOnCreation: string[];
  type: string;
  strategy: string;
  shareprice: string;
  tvl: string;
  strategySpecific: string;
  balance: string | bigint;
  balanceInUSD: number;
  lastHardWork: string;
  hardWorkOnDeposit: boolean;
  daily: number;
  assets: TAsset[];
  assetsSymbol: string;
  assetsProportions: number[];
  strategyInfo: IStrategyInfo;
  il: number;
  underlying: TUnderlyingData;
  strategyAddress: TAddress;
  strategyDescription: string;
  status: string;
  version: string;
  strategyVersion: string;
  NFTtokenID: string;
  gasReserve: string;
  rebalances: TRebalances;
  earningData: TEarningData;
  sortAPR: string;
  pool: TPool;
  alm: TAlm;
  risk: TRisk;
  vsHold24H: number;
  vsHoldWeekly: number;
  lifetimeVsHold: number;
  vsHoldAPR: number;
  assetsVsHold: THoldData[];
  isVsActive: boolean;
  yearnProtocols: TYearnProtocol[];
  network: string;
};

type TZAPData = {
  address: string;
  amountIn: string;
  amountOut: string;
  img: string;
  router: string;
  symbol: string;
  txData: string;
};

type TxTokens = {
  [tokenAddress: string]: TLocalStorageToken;
};

type TTableColumn = {
  name: string;
  keyName: string;
  sortType: string;
  dataType: string;
  unsortable?: boolean;
};

type TLeaderboard = {
  rank?: number;
  address: TAddress;
  deposit: number;
  earned: number;
  points?: number;
};

type TTAbleFiltersVariant = {
  name: string;
  state: boolean;
};

type TTableFilters = {
  name: string;
  type: string;
  variants?: TTAbleFiltersVariant[];
  state: boolean;
};

type TVsHoldModal = {
  assetsVsHold: THoldData[];
  lifetimeVsHold: number;
  vsHoldAPR: number;
  created: number;
  state: boolean;
  isVsActive: boolean;
};

type TAPRModal = {
  earningData: TEarningData;
  daily: number;
  lastHardWork: string;
  symbol: string;
  state: boolean;
  pool: TPool;
};

type TBuildVariant = {
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  canBuild: boolean;
  initParams: TInitParams;
};

type TAddress = `0x${string}`;
type TInputItem = {
  inputValue: string | number;
  valuePerDay: string;
};

type TYearnProtocol = { title: string; link: string };

type TTableProtocol = { name: string; img: string; website: string };

type TChain = {
  name: string;
  id: string;
  logoURI: string;
  explorer: string;
  active: boolean;
};

type TUnderlyingToken = {
  address: TAddress;
  symbol: string;
  decimals: number;
  balance: number | string;
  allowance: number;
  logoURI: string;
};

type TUnderlyingData = {
  address: TAddress;
  symbol: string;
  decimals: number;
  logo: string;
};

////          VAULT

type TVaultBalance = {
  [balance: string]: string;
};

type TVaultInput = {
  [assetAdress: string]: string;
};

type TLocalStorageToken = { amount: string; symbol?: string; logo?: string };

type TVaultAllowance = {
  [asset: string]: bigint;
};

type TVaultsAddress = {
  [vaultAddress: string]: string;
};

type TSettings = {
  slippage: string;
  approves: string;
  gasLimit: string;
};

type TToast = {
  hash: string;
  status: string;
  timestamp: number;
  tokens: Record<string, { amount: string }>;
  type: string;
  vault: string;
};

type TContractInfo = {
  address: TAddress;
  logo: string;
  symbol: string;
  type: string;
  isCopy: boolean;
};
type TUpgradesTable = {
  contract: string;
  oldVersion: string;
  newVersion: string;
  proxy: TAddress;
  oldImplementation: TAddress;
  newImplementation: TAddress;
};

//// CHART
type TChartData = {
  APR: number;
  APR24H: string;
  date: string;
  timestamp: number | string;
  unixTimestamp: number;
  vsHoldAPR: string;
  periodVsHoldAPR?: number;
  TVL?: string;
  address?: string;
  sharePrice?: string;
};
type TChartPayload = {
  chartType?: string;
  color?: string;
  dataKey: string;
  formatter?: undefined;
  hide?: boolean;
  name: string;
  payload: TChartData;
  type?: string;
  unit?: string;
  value: number;
};

type TPieChartData = {
  address: TAddress;
  amount: string;
  amountInUSD: number;
  color: string;
  formatedAmountInUSD?: string;
  logo: string;
  percent: number;
  symbol: string;
  decimals: number;
};

type TPendingPlatformUpgrade = {
  newVersion: string;
  proxies: string[];
  newImplementations: string[];
};

type TGitHubUser = {
  bio: string;
  location: string;
  name: string;
  avatar_url: string;
  html_url: string;
  followers: number;
};

type TMultiTokenData = {
  balance: number;
  priceBalance: number;
};

type TMultisigBalance = Record<string, TMultiTokenData>;

type TTokenomics = {
  profitPrice: number;
  profitMarketCap: string;
  sdivTotalSupply: string;
  pmToMint: string;
  pmTotalSupply: string;
};

type TProfitTokenWallet = {
  profitBalance: number;
  profitStaked: number;
};

type TSdivTokenWallet = {
  sdivBalance: number;
  sdivEarned: number;
};

type TIQMFAlm = {
  alm: TAddress;
  feeUSD: string;
  timestamp: string;
  totalUSD: string;
};

type TStrategyState =
  | "LIVE"
  | "DEPLOYMENT"
  | "DEVELOPMENT"
  | "AWAITING"
  | "BLOCKED"
  | "PROPOSAL";

//// EVENTS

type TError = {
  state: boolean;
  type: string;
  description: string;
};

type TTableData =
  | IChainData[]
  | TAssetData[]
  | DeFiOrganization[]
  | TTableStrategy[]
  | TLeaderboard[]
  | IExtendedYieldContest[];

type TDispatchedTableData =
  | Dispatch<SetStateAction<IChainData[]>>
  | Dispatch<SetStateAction<TAssetData[]>>
  | Dispatch<SetStateAction<DeFiOrganization[]>>
  | Dispatch<SetStateAction<TTableStrategy[]>>
  | Dispatch<SetStateAction<TLeaderboard[]>>
  | Dispatch<SetStateAction<IExtendedYieldContest[]>>;

type TSort = {
  table: TTableColumn[];
  setTable: Dispatch<SetStateAction<TTableColumn[]>>;
  tableData: TTableData | any;
  setTableData: TDispatchedTableData;
};

//// API

type TAPIData = {
  title?: string;
  // about?: string;
  status?: string;
  // services?: string[];
  assetPrices?: TMultichainPrices;
  vaults?: TVaults;
  underlyings?: TVaults;
  platforms?: {
    [chainID: string]: {
      buildingPermitToken: TAddress;
      buildingPayPerVaultToken: TAddress;
      bcAssets: TAddress[];
      versions: {
        platform: string;
        strategy: {
          [strategyId: string]: string;
        };
      };
    };
  };
  error?: string;
};

type TVLRange = { min: number; max: number };

type TContests = {
  [contestId: string]: YieldContest;
};

interface Integration {
  [key: string]: string;
}

interface IExtendedYieldContest extends YieldContest {
  id: string;
  status: number;
  rewardsLength: number|"TBA";
  quests: Integration|undefined;
  questsLength: number;
}

export type {
  TPlatformData,
  TUserBalance,
  TInitParams,
  TAllowedBBTokenVaults,
  TTokenData,
  TVaults,
  TVaultData,
  TToken,
  TBalances,
  TVault,
  TAsset,
  TTableColumn,
  TAPRModal,
  TBuildVariant,
  TAddress,
  IProtocol,
  TMultichainPrices,
  IStrategyInfo,
  TInputItem,
  TVaultsAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TGitHubUser,
  TMultisigBalance,
  TMultiTokenData,
  TTokenomics,
  TSettings,
  TProfitTokenWallet,
  TSdivTokenWallet,
  TTableFilters,
  TTAbleFiltersVariant,
  TPendingPlatformUpgrade,
  TToast,
  TVsHoldModal,
  TIQMFAlm,
  TChartData,
  TError,
  TContractInfo,
  TPieChartData,
  TRisk,
  TZAPData,
  THoldData,
  TUpgradesTable,
  TYearnProtocol,
  TPriceInfo,
  TAPIData,
  TEarningData,
  TPlatformGetData,
  TChartPayload,
  TVaultDataKey,
  TPlatformGetBalance,
  TChain,
  TUnderlyingToken,
  TTokens,
  TAPRPeriod,
  TLocalStorageToken,
  IChainData,
  TSort,
  TAssetData,
  TTableData,
  TDispatchedTableData,
  TStrategyState,
  TTableStrategy,
  TLeaderboard,
  TContests,
  IExtendedYieldContest,
  TTableProtocol,
  TVLRange,
  TShareData,
  TxTokens,
};
