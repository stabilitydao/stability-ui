import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { createWalletClient, http } from "viem";

import { polygon, base, real } from "wagmi/chains";

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

import type { TAddress } from "@types";

const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

// 137 || 8453 || 111188
const platforms: { [key: string]: TAddress } = {
  "137": deployments[137].core?.platform,
  "8453": deployments[8453].core?.platform,
  "111188": deployments[111188].core?.platform,
};

const priceReaders: { [key: string]: TAddress } = {
  "137": deployments[137].core.priceReader,
  "8453": deployments[8453].core.priceReader,
  "111188": deployments[111188].core?.priceReader,
};

const defiedgeFactories: { [key: string]: TAddress } = {
  "137": "0x730d158D29165C55aBF368e9608Af160DD21Bd80",
  "8453": "0xa631c80f5F4739565d8793cAB6fD08812cE3337D",
};

const quickSwapIchiFactory = "0x11700544C577Cb543a498B27B4F0f7018BDb6E8a";

const retroIchiFactory = "0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7";

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stabilitydao.org",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = defaultWagmiConfig({
  chains: [polygon, base, real],
  projectId: walletConnectProjectId,
  metadata,
});

const walletClient = createWalletClient({
  chain: polygon,
  transport: http(),
});

export {
  platforms,
  defiedgeFactories,
  quickSwapIchiFactory,
  retroIchiFactory,
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
};
