import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { createWalletClient, http } from "viem";

import { base, polygon, real, sonic } from "viem/chains";

import { deployments } from "@stabilitydao/stability";

import ERC20ABI from "./abi/ERC20ABI.ts";
import ERC20MetadataUpgradeableABI from "./abi/ERC20MetadataUpgradeableABI.ts";
import ERC20DQMFABI from "./abi/ERC20DQMFABI.ts";
import FactoryABI from "./abi/FactoryABI.ts";
import IVaultManagerABI from "./abi/IVaultManagerABI.ts";
import PlatformABI from "./abi/PlatformABI.ts";
import StrategyABI from "./abi/StrategyABI.ts";
import VaultABI from "./abi/VaultABI.ts";
import IERC721Enumerable from "./abi/IERC721Enumerable.ts";
import ZapABI from "./abi/ZapABI.ts";
import DividendMinterABI from "./abi/DividendMinterABI.ts";
import DividendTokenABI from "./abi/DividendTokenABI.ts";
import ICHIABI from "./abi/ICHIABI.ts";
import PriceReaderABI from "./abi/PriceReaderABI.ts";
import IFrontendABI from "./abi/IFrontendABI.ts";

import type { TAddress } from "@types";

const CONTRACT_PAGINATION = 50;

const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

// 137 || 8453 || 111188 || 146
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

const frontendContracts: { [key: string]: TAddress } = {
  "137": "0xa9f5593e6a809a24fb41d1d854a577a8bf507e28",
  "8453": "0x995c3bdee2830c7f96d4caa0c36f7b7b8ec60127",
  "111188": "0xfd1361E0565b01B85d3c1511FEf7545D6A84d93a",
  "146": "0x15487495cce9210795f9C2E0e1A7238E336dFc32",
};

const defiedgeFactories: { [key: string]: TAddress } = {
  "137": "0x730d158D29165C55aBF368e9608Af160DD21Bd80",
  "8453": "0xa631c80f5F4739565d8793cAB6fD08812cE3337D",
};

const ichiFactories: { [key: string]: TAddress } = {
  quickSwap: "0x11700544C577Cb543a498B27B4F0f7018BDb6E8a",
  retro: "0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7",
};

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stability.farm",
  icons: ["https://stability.farm/logo.svg"],
};

const wagmiConfig = defaultWagmiConfig({
  chains: [polygon, base, real, sonic],
  projectId: walletConnectProjectId,
  metadata,
});

const walletClient = createWalletClient({
  chain: polygon,
  transport: http(),
});

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
  ERC20DQMFABI,
  FactoryABI,
  IVaultManagerABI,
  PlatformABI,
  StrategyABI,
  VaultABI,
  polygon,
  wagmiConfig,
  IERC721Enumerable,
  ZapABI,
  DividendMinterABI,
  DividendTokenABI,
  ICHIABI,
  PriceReaderABI,
  IFrontendABI,
};
