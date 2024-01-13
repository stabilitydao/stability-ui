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
  [address: string]: {
    tokenPrice: bigint;
  };
};

type TBalances = {
  [balance: string]: TAssetBalance;
};

type TAssetBalance = {
  assetBalance: bigint;
};
type TVault = {
  address: TAddress;
  name: string;
  symbol: string;
  type: string;
  strategy: string;
  shareprice: string;
  tvl: string;
  apr: string;
  apy: string;
  strategyApr: string;
  strategySpecific: string;
  balance: string;
  lastHardWork: bigint;
  daily: number;
  monthlyUnderlyingApr: number;
  assets: {
    address: TAddress;
    color: string;
    logo: string;
    name: string;
    symbol: string;
  }[];
  assetsProportions: number[];
  assetsWithApr: string[];
  assetsAprs: string[];
  strategyInfo: IStrategyInfo;
  il: number;
  underlying: TAddress;
  strategyAddress: TAddress;
  status: number;
  version: string;
  strategyVersion: string;
};

type TVaultAssets = [string, string];

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
  apr: string;
  assetsWithApr: any;
  assetsAprs: number;
  lastHardWork: any;
  strategyApr: number;
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

//// DAO
type TDAOData = {
  platformVersion: string;
  platformGovernance: string;
  multisigAddress: string;
  numberOfTotalVaults: string;
  totalTvl: number;
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
  pmMinted: string;
};

type TProfitTokenWallet = {
  profitBalance: number;
  profitStaked: number;
};

type TSdivTokenWallet = {
  sdivBalance: number;
  sdivEarned: number;
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
  TAssetBalance,
  TVault,
  TVaultAssets,
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
  TProfitTokenWallet,
  TSdivTokenWallet,
  TVaultStatuses,
  TTableFilters,
  TTAbleFiltersVariant,
  TPendingPlatformUpgrade,
};
