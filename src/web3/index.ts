import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { createWalletClient, http, custom } from "viem";

import { polygon } from "wagmi/chains";

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

const platform = "0xb2a0737ef27b5Cc474D24c779af612159b1c3e60";

const priceReader = "0xcCef9C4459d73F9A997ff50AC34364555A3274Aa";

const deployments: {
  [chainId: number]: {
    [contractName: string]: `0x${string}`;
  };
} = {
  137: {
    Platform: "0xb2a0737ef27b5Cc474D24c779af612159b1c3e60",
    Factory: "0xa14EaAE76890595B3C7ea308dAEBB93863480EAD",
    PriceReader: "0xcCef9C4459d73F9A997ff50AC34364555A3274Aa",
    Swapper: "0xD84E894A6646C7407b8CD1273Ea1EFc53A423762",
    HardWorker: "0x6DBFfd2846d4a556349a3bc53297700d89a94034",
    VaultManager: "0x6008b366058B42792A2497972A3312274DC5e1A8",
    StrategyLogic: "0xD16b60E39284190D9201f0eaD42c4674C310e905",
    Zap: "0xEA3fABD8cC14705d7E66D1833a547D31882aEA9b",
  },
};

const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

const defiedgeFactory = "0x730d158D29165C55aBF368e9608Af160DD21Bd80";

const quickSwapIchiFactory = "0x11700544C577Cb543a498B27B4F0f7018BDb6E8a";

const retroIchiFactory = "0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7";

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stabilitydao.org",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = defaultWagmiConfig({
  chains: [polygon],
  projectId: walletConnectProjectId,
  metadata,
});
const walletClient = createWalletClient({
  chain: polygon,
  transport: http(),
});

export {
  deployments,
  platform,
  defiedgeFactory,
  quickSwapIchiFactory,
  retroIchiFactory,
  walletConnectProjectId,
  walletClient,
  priceReader,
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
