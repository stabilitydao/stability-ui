import { configureChains, createConfig, useConfig } from "wagmi";
import { defineChain } from "viem";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { EIP6963Connector } from "@web3modal/wagmi";

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

const platform = "0xb2a0737ef27b5Cc474D24c779af612159b1c3e60";

const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stabilitydao.org",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const polygon = defineChain({
  id: 137,
  name: "Polygon",
  network: "polygon",
  nativeCurrency: {
    decimals: 18,
    name: "Matic",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: {
      http: ["https://polygon-rpc.com/"],
      webSocket: ["wss://polygon-rpc.com/"],
    },
    public: {
      http: ["https://polygon-rpc.com/"],
      webSocket: ["wss://polygon-rpc.com/"],
    },
  },
});

const { chains, publicClient } = configureChains(
  [polygon],
  //   [walletConnectProvider({ projectId: walletConnectProjectId }), publicProvider()]
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
        showQrModal: false,
        metadata,
      },
    }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: metadata.name },
    }),
  ],
  publicClient,
});

export {
  platform,
  walletConnectProjectId,
  ERC20ABI,
  ERC20MetadataUpgradeableABI,
  ERC20DQMFABI,
  FactoryABI,
  IVaultManagerABI,
  PlatformABI,
  StrategyABI,
  VaultABI,
  polygon,
  chains,
  publicClient,
  wagmiConfig,
  IERC721Enumerable,
  ZapABI,
  DividendMinterABI,
  DividendTokenABI,
};
