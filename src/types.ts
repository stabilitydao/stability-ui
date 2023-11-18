export type PlatformData = {
  platform: `0x${string}`;
  factory: `0x${string}`;
  buildingPermitToken: `0x${string}`;
  buildingPayPerVaultToken: `0x${string}`;
  buildingPrices: { [vaultType: string]: bigint };
};

export type UserBalance = {
  buildingPayPerVaultTokenBalance: bigint;
  erc20Balance: { [token: string]: bigint };
  erc721Balance: { [token: string]: bigint };
};

export type InitParams = {
  initVaultAddresses: string[];
  initVaultNums: bigint[];
  initStrategyAddresses: string[];
  initStrategyNums: bigint[];
  initStrategyTicks: number[];
};

export type AllowedBBTokenVaults = {
  [token: string]: number;
};

export type TokenData = {
  address: string;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  logoURI: string;
};

//New types

export type Vaults = {
  [vaultAddress: string]: VaultData;
};

export type VaultData = {
  vaultSharePrice: bigint;
  vaultUserBalance: bigint;
};

export type Token = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags?: string[];
};

export type assetPrices = {
  [address: string]: {
    tokenPrice: bigint;
  };
};

export type Balances = {
  [balance: string]: AssetBalance;
};

export type AssetBalance = {
  assetBalance: bigint;
};
export type TLocalVault = {
  name: string;
  assets: { logo: string; symbol: string }[];
  symbol: string;
  type: string;
  strategy: string;
  balance: string;
  sharePrice: string;
  tvl: string;
  apr: string;
};
export type TVaultAssets = [string, string];
