// interfaces
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
}

// types
type TPlatformData = {
  platform: `0x${string}`;
  factory: `0x${string}`;
  buildingPermitToken: `0x${string}`;
  buildingPayPerVaultToken: `0x${string}`;
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
type TLocalVault = {
  name: string;
  assets: { logo: string; symbol: string; name: string }[];
  symbol: string;
  type: string;
  strategy: string;
  balance: string;
  shareprice: string;
  tvl: string;
  apr: string;
  strategyApr: string;
  address: string;
  strategyInfo: IStrategyInfo;
  strategySpecific: any;
};
type TVaultAssets = [string, string];

type TTableColumn = {
  name: string;
  keyName: string;
  sortType: string;
  dataType: string;
};
type TAPRModal = {
  apr: string;
  assetsWithApr: string;
  assetsAprs: any;
  lastHardWork: number;
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

//// DAO
type PlatformData = {
  platformVersion: string;
  numberOfTotalVaults: string;
  totalTvl: string;
  strategieNames: string;
  platformFee: string;
  vaultManagerFee: string;
  strategyLogicFee: string;
  ecosystemFee: string;
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
  TLocalVault,
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
  PlatformData,
};
