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
  value?: number;
  allocation?: number;
  creationDate: number;
  audits: { name: string; url: string }[];
  accidents: { date: number; url: string; name: string }[];
}

interface IProtocolModal extends IProtocol {
  state: boolean;
  type: string;
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
  tags: string[];
  img: string;
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

type TFrontendBalances = [bigint, string[], bigint[], bigint[]];

type TInitParams = {
  initVaultAddresses: string[];
  initVaultNums: bigint[];
  initStrategyAddresses: string[];
  initStrategyNums: bigint[];
  initStrategyTicks: number[];
};

type TTokenData = {
  address: TAddress;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  tags?: string[];
  mintApp?: string;
};

type TOptionInfo = {
  address: string | string[];
  symbol: string | string[];
  logoURI: string | string[];
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
  gemsAPR: TAPRData;
};

type TVaults = {
  [vaultAddress: string]: TVault;
};

type TMetaVaults = {
  [vaultAddress: string]: TMetaVault;
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
  type: VaultTypes;
  created: string;
  launchDate: string;
  assetsPricesOnCreation: string[];
  vaultType: string;
  strategy: string;
  shareprice: string;
  sharePriceLast: string;
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
  // yearnProtocols: TYearnProtocol[];
  network: string;
  sonicPoints: undefined | number;
  ringsPoints: undefined | number;
  leverageLending?: TLeverageLendingData;
  liveAPR: undefined | number;
  assetAPR: undefined | number;

  leverage?: number;

  farmId: number;

  ///// meta vault
  proportions?: { current: number; target: number; allocation: number };
  vaults?: TVault[];
};

type TMetaVault = {
  address: TAddress;
  symbol: string;
  name: string;
  type: VaultTypes;
  APR: string;
  totalAPR: string;
  merklAPR: string;
  gemsAPR: string;
  sharePrice: string;
  assets: TAddress[];
  decimals: number;
  deposited: string;
  tvl: string;
  vaults: TAddress[];
  endVaults?: TAddress[];
  protocols?: { name: string; logoSrc: string }[];
  strategies?: string[];
  sonicPoints?: number;
  network: string;
};

type TEndMetaVaults = {
  metaVault?: TAddress;
  vault?: TAddress;
  vaults?: TAddress[];
}[];

type TLeverageLendingData = {
  borrowApr: number;
  leverage: number;
  ltv: number;
  maxLtv: number;
  supplyApr: number;
  targetLeveragePercent: number;
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
  metaVaults?: {
    [address: string]: {
      deposit: number;
      earned: number;
    };
  };
};

type TMarketUser = {
  address: TAddress;
  collateral: number;
  debt: number;
  LTV: number;
  LTVColor: string;
};

type TTAbleFiltersVariant = {
  name: string;
  title?: string;
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

type TStakingData = {
  APR: number;
  staked: number;
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
  chainId: string;
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
  type?: string;
  isCopy: boolean;
};

type TMarketInfo = {
  logo: string;
  symbol: string;
  link: string;
};

type TUpgradesTable = {
  contract: string;
  oldVersion: string;
  newVersion: string;
  proxy: TAddress;
  oldImplementation: TAddress;
  newImplementation: TAddress;
};

type TPoolTable = {
  id: TAddress;
  ammAdapter: TAddress;
  pool?: TAddress;
  tokenIn: TAddress;
  tokenOut: TAddress;
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

type TFrontendContractData = [bigint, TAddress[], bigint[], bigint[]] | [];

type TChartNames = "" | "sharePrice" | "TVL" | "APR" | "apr" | "tvl" | "vsHodl";

type TActiveChart = {
  name: TChartNames;
  data: [];
};

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
  | IExtendedYieldContest[]
  | TPoolTable[]
  | TMarketUser[];

type TDispatchedTableData =
  | Dispatch<SetStateAction<IChainData[]>>
  | Dispatch<SetStateAction<TAssetData[]>>
  | Dispatch<SetStateAction<DeFiOrganization[]>>
  | Dispatch<SetStateAction<TTableStrategy[]>>
  | Dispatch<SetStateAction<TLeaderboard[]>>
  | Dispatch<SetStateAction<IExtendedYieldContest[]>>
  | Dispatch<SetStateAction<TPoolTable[]>>
  | Dispatch<SetStateAction<TMarketUser[]>>;

type TSort = {
  table: TTableColumn[];
  setTable: Dispatch<SetStateAction<TTableColumn[]>>;
  tableData: TTableData | any;
  setTableData: TDispatchedTableData;
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
  rewardsLength: number | "TBA";
  quests: Integration | undefined;
  questsLength: number;
}

type TVSHoldModalState = {
  assetsVsHold: THoldData[];
  lifetimeVsHold: number;
  vsHoldAPR: number;
  created: number;
  state: boolean;
  isVsActive: boolean;
};

type TNetwork = {
  name: string;
  id: string;
  logoURI: string;
  explorer: string;
  nativeCurrency: string;
  active: boolean;
};

type TTableActiveParams = {
  search: number;
  sort: number;
  filters: number;
};

type TStakeDashboard = {
  totalStaked: number;
  totalStakedInUSD: number;
  userStaked: number;
  userStakedInUSD: number;
  pendingRebase: number;
  estimatedProfit: number;
  estimatedProfitInUSD: number;
  pendingRebaseInSTBL: number;
  pendingRevenue: number;
  pendingRevenueInSTBL: number;
  timestamp: number;
  lendingFeesXSTBL: number;
  lendingFeesUSD: number;
};

type TVestPeriod = {
  id: number;
  amount: number;
  start: number;
  end: number;
  isFullyExited: boolean;
};

type TMarketPrice = {
  price: string;
  priceChange: number;
};

type TMarketPrices = Record<string, TMarketPrice>;

type TUserReserveWithdrawData = {
  balance: string;
  maxWithdraw: string;
};

type TUserReserveBorrowData = {
  balance: string;
  maxBorrow: string;
};

type TUserReserveData = {
  balance: string;
  allowance?: string;
};

type TUserReserve = {
  supply?: TUserReserveData;
  withdraw?: TUserReserveWithdrawData;
  borrow?: TUserReserveBorrowData;
  repay?: TUserReserveData;
};

type TUserReservesMap = Record<TAddress, TUserReserve>;

type TMarketReserve = {
  // lib data
  address: TAddress;
  aToken: TAddress;
  aTokenSymbol: string;
  isBorrowable: boolean;
  oracle: TAddress;
  oracleName: string;
  treasury: TAddress;

  // assetData
  assetData?: TTokenData;

  // backend data
  name: string;
  debtToken: TAddress;
  price: string;

  supplyAPR: string;
  borrowAPR: string;

  supplyTVL: string;
  supplyTVLInUSD: string;

  borrowTVL: string;
  borrowTVLInUSD: string;

  cap: string;
  borrowCap: string;

  reserveFactor: string;
  maxLtv: string;
  liquidationThreshold: string;
  liquidationBonus: string;
  utilization: string;

  availableToBorrow: string;
  availableToBorrowInUSD: string;

  interestStrategy: {
    address: TAddress;
    maxVariableBorrowRate: string;
    optimalUsageRation: string;
    variableRateSlope1: string;
    variableRateSlope2: string;
  };
};

type TMarket = {
  marketId: string;
  reserves: TMarketReserve[];
  roles: { name: string; addresses: TAddress[] }[];
  deployed: string;
  deprecated?: boolean;
  engine: string;
  pool: TAddress;
  protocolDataProvider: TAddress;
  isStable: boolean;
  risk: {
    maxLTV: number;
    LT: number;
  };

  network?: TNetwork;

  // table sort
  supplyAPR?: number;
  borrowAPR?: number;
  supplyTVL?: number;
  supplyTVLInUSD?: number;
  borrowTVL?: number;
  utilization?: number;
};

type TLiquidation = {
  user: string;
  liquidator: string;
  liquidated: number;
  debt: number;
  timestamp: number;
  date: string;
};

type TUserPoolData = {
  totalCollateralBase: number;
  totalDebtBase: number;
  currentLiquidationThreshold: number;
  maxLTV: number;
  healthFactor: number;
};

type TVote = {
  choice: string;
  percent: string;
  count: number;
};

type TProposal = {
  id: string;
  title: string;
  state: string;
  choices: string[];
  votes: TVote[];
  start: number;
  end: number;
};

// enums
export enum DisplayTypes {
  Rows = "rows",
  Grid = "grid",
}

export enum MetaVaultTableTypes {
  Destinations = "destinations",
  Protocols = "protocols",
}

export enum MetaVaultDisplayTypes {
  Lite = "lite",
  Pro = "pro",
}

export enum MetaVaultSectionTypes {
  Operations = "operations",
  Allocations = "allocations",
  Charts = "charts",
}

export enum DAOSectionTypes {
  Governance = "governance",
  InterChain = "inter-chain",
  Tokenomics = "tokenomics",
  Holders = "holders",
}

export enum TransactionTypes {
  Deposit = "deposit",
  Withdraw = "withdraw",
  Wrap = "wrap",
  Unwrap = "unwrap",
}

export enum VaultTypes {
  Vault = "Vault",
  MetaVault = "MetaVault",
  MultiVault = "MultiVault",
}

export enum MarketSectionTypes {
  Operations = "Operations",
  Supply = "Supply",
  Withdraw = "Withdraw",
  Borrow = "Borrow",
  Repay = "Repay",
  // Leverage = "Leverage",
  Information = "Information",
  Users = "Users",
  Liquidations = "Liquidations",
}

export enum TimelineTypes {
  Day = "DAY",
  Week = "WEEK",
  Month = "MONTH",
  Year = "YEAR",
}

export type {
  TPlatformData,
  TInitParams,
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
  TEarningData,
  TChartPayload,
  TVaultDataKey,
  TFrontendBalances,
  TChain,
  TUnderlyingToken,
  TTokens,
  TAPRPeriod,
  TLocalStorageToken,
  IChainData,
  TSort,
  TAssetData,
  TTableData,
  TPoolTable,
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
  TFrontendContractData,
  TLeverageLendingData,
  IL,
  TOptionInfo,
  TVSHoldModalState,
  TTableActiveParams,
  TStakeDashboard,
  TVestPeriod,
  TMarketPrice,
  TMarketPrices,
  TMetaVault,
  TMetaVaults,
  TEndMetaVaults,
  TMarketInfo,
  TActiveChart,
  IProtocolModal,
  TMarket,
  TMarketReserve,
  TNetwork,
  TChartNames,
  TMarketUser,
  TLiquidation,
  TUserPoolData,
  TUserReserve,
  TUserReservesMap,
  TProposal,
  TVote,
  TStakingData,
};
