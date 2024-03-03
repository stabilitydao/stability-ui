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

interface IFeature {
  name: string;
  logoSrc?: string;
  svg?: any;
}

interface IStrategyInfo {
  name: string;
  shortName: string;
  specific?: string;
  protocols: IProtocol[];
  features: IFeature[];
  color: string;
  bgColor: string;
  baseStrategies: string[];
  ammAdapter: string;
  sourceCode: string;
  il?: IL;
}

// types
type TPlatformData = {
  platform: TAddress;
  factory: TAddress;
  buildingPermitToken: TAddress;
  buildingPayPerVaultToken: TAddress;
  zap: TAddress;
  buildingPrices: { [vaultType: string]: bigint };
};

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
  address: string;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  tags?: string[];
};

//New types

type TVaults = {
  [vaultAddress: string]: TVaultData;
};

type TVaultData = {
  vaultSharePrice: bigint;
  vaultUserBalance: bigint;
};

type TToken = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags?: string[];
};

type TAssetPrices = {
  [address: string]: bigint;
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
  balance: string;
  lastHardWork: bigint;
  apy: number;
  daily: number;
  assets: TAsset[];
  assetsProportions: number[];
  strategyInfo: IStrategyInfo;
  il: number;
  underlying: TAddress;
  strategyAddress: TAddress;
  strategyDescription: string;
  status: number;
  version: string;
  strategyVersion: string;
  rebalances: any;
  earningData: any; // todo type
};

type TTableColumn = {
  name: string;
  keyName: string;
  sortType: string;
  dataType: string;
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

type TAPRModal = {
  earningData: any; // todo type for earningData
  daily: number;
  lastHardWork: any;
  state: boolean;
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

////          VAULT

type TVaultBalance = {
  [balance: string]: string;
};

type TVaultInput = {
  [assetAdress: string]: string;
};

type TVaultAllowance = {
  [asset: string]: bigint[];
};

type TVaultsAddress = {
  [vaultAddress: string]: string | any;
};

type TVaultStatuses = {
  [key: number]: string;
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

//// CHART
type TChartData = {
  APR?: number;
  TVL?: number;
  address?: TAddress;
  sharePrice?: number;
  timestamp: string;
  unixTimestamp?: string;
  date: string;
};

//// DAO
type TDAOData = {
  platformVersion: string;
  platformGovernance: string;
  multisigAddress: string;
  strategieNames: string[];
  platformFee: string;
  vaultManagerFee: string;
  typesOfVaults: string;
  strategyLogicFee: string;
  ecosystemFee: string;
  farmsLength: number;
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

//// EVENTS

type TError = {
  state: boolean;
  type: string;
  description: string;
};

export type {
  TPlatformData,
  TUserBalance,
  TInitParams,
  TAllowedBBTokenVaults,
  TTokenData,
  TVaults,
  TVaultData,
  TToken,
  TAssetPrices,
  TBalances,
  TVault,
  TAsset,
  TTableColumn,
  TAPRModal,
  TBuildVariant,
  TAddress,
  IProtocol,
  IFeature,
  IStrategyInfo,
  TInputItem,
  TVaultsAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TDAOData,
  TGitHubUser,
  TMultisigBalance,
  TMultiTokenData,
  TTokenomics,
  TSettings,
  TProfitTokenWallet,
  TSdivTokenWallet,
  TVaultStatuses,
  TTableFilters,
  TTAbleFiltersVariant,
  TPendingPlatformUpgrade,
  TToast,
  TIQMFAlm,
  TChartData,
  TError,
};
