import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { createWalletClient, http, createPublicClient } from "viem";

import { avalanche, sonic } from "viem/chains";

import { deployments } from "@stabilitydao/stability";

import ERC20ABI from "./abi/ERC20ABI.ts";
import ERC20MetadataUpgradeableABI from "./abi/ERC20MetadataUpgradeableABI.ts";
import FactoryABI from "./abi/FactoryABI.ts";
import PlatformABI from "./abi/PlatformABI.ts";
import StrategyABI from "./abi/StrategyABI.ts";
import VaultABI from "./abi/VaultABI.ts";
import ZapABI from "./abi/ZapABI.ts";
import ICHIABI from "./abi/ICHIABI.ts";
import IFrontendABI from "./abi/IFrontendABI.ts";
import IMerkleDistributor from "./abi/IMerkleDistributor.ts";
import IRevenueRouterABI from "./abi/IRevenueRouterABI.ts";
import IXStakingABI from "./abi/IXStakingABI.ts";
import IXSTBLABI from "./abi/IXSTBLABI.ts";
import IMetaVaultABI from "./abi/IMetaVaultABI.ts";
import WrappedMetaVaultABI from "./abi/WrappedMetaVaultABI.ts";
import SwapperABI from "./abi/SwapperABI.ts";

import type { TAddress } from "@types";

const CONTRACT_PAGINATION = 20;

const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

const platforms: { [key: string]: TAddress } = Object.entries(
  deployments
).reduce(
  (acc, [key, value]) => {
    if (value?.core?.platform) {
      acc[key] = value.core.platform;
    }
    return acc;
  },
  {} as { [key: string]: TAddress }
);

const priceReaders: { [key: string]: TAddress } = Object.entries(
  deployments
).reduce(
  (acc, [key, value]) => {
    if (value?.core?.priceReader) {
      acc[key] = value.core.priceReader;
    }
    return acc;
  },
  {} as { [key: string]: TAddress }
);

const frontendContracts: { [key: string]: TAddress } = Object.entries(
  deployments
).reduce(
  (acc, [key, value]) => {
    if (value?.periphery?.frontend) {
      acc[key] = value?.periphery?.frontend;
    }
    return acc;
  },
  {} as { [key: string]: TAddress }
);

const factories: { [key: string]: TAddress } = Object.entries(
  deployments
).reduce(
  (acc, [key, value]) => {
    if (value?.core?.factory) {
      acc[key] = value?.core?.factory;
    }
    return acc;
  },
  {} as { [key: string]: TAddress }
);

const defiedgeFactories: { [key: string]: TAddress } = {
  "137": "0x730d158D29165C55aBF368e9608Af160DD21Bd80",
  "8453": "0xa631c80f5F4739565d8793cAB6fD08812cE3337D",
};

const ichiFactories: { [key: string]: TAddress } = {
  quickSwap: "0x11700544C577Cb543a498B27B4F0f7018BDb6E8a",
  retro: "0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7",
};

const sGEM1 = deployments[146].tokenomics.gem1;

const merkleDistributor = deployments[146].tokenomics.merkleDistributor;

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stability.farm",
  icons: ["https://stability.farm/logo.svg"],
};

const wagmiConfig = defaultWagmiConfig({
  chains: [sonic, avalanche],
  projectId: walletConnectProjectId,
  metadata,
});

const walletClient = createWalletClient({
  chain: sonic,
  transport: http(),
});

const sonicClient = createPublicClient({
  chain: sonic,
  transport: http("https://sonic.drpc.org"), //import.meta.env.PUBLIC_SONIC_RPC
});

const avalancheClient = createPublicClient({
  chain: avalanche,
  transport: http("https://avalanche.public-rpc.com"), //import.meta.env.PUBLIC_SONIC_RPC
});

const web3clients = {
  "146": sonicClient,
  "43114": avalancheClient,
};

export {
  CONTRACT_PAGINATION,
  platforms,
  frontendContracts,
  defiedgeFactories,
  ichiFactories,
  walletConnectProjectId,
  walletClient,
  priceReaders,
  ERC20ABI,
  ERC20MetadataUpgradeableABI,
  FactoryABI,
  PlatformABI,
  StrategyABI,
  VaultABI,
  wagmiConfig,
  ZapABI,
  ICHIABI,
  IFrontendABI,
  IMerkleDistributor,
  IRevenueRouterABI,
  IXStakingABI,
  IXSTBLABI,
  sGEM1,
  merkleDistributor,
  sonicClient,
  avalancheClient,
  web3clients,
  IMetaVaultABI,
  WrappedMetaVaultABI,
  SwapperABI,
  factories,
};
