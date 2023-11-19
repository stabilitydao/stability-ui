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
  assets: { logo: string; symbol: string }[];
  symbol: string;
  type: string;
  strategy: string;
  balance: string;
  shareprice: string;
  tvl: string;
  apr: string;
};
type TVaultAssets = [string, string];

type TTableColumn = {
  name: string;
  keyName: string;
  sortType: string;
  dataType: string;
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
};