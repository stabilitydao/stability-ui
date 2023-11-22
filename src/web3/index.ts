import { configureChains, createConfig, useConfig } from "wagmi";
import { defineChain } from "viem";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { EIP6963Connector } from "@web3modal/wagmi";

import ERC20ABI from "./abi/ERC20ABI.json";
import ERC20MetadataUpgradeableABI from "./abi/ERC20MetadataUpgradeableABI.json";
import FactoryABI from "./abi/FactoryABI.json";
import IVaultManagerABI from "./abi/IVaultManagerABI.json";
import PlatformABI from "./abi/PlatformABI.json";
import StrategyABI from "./abi/StrategyABI.json";
import VaultABI from "./abi/VaultABI.json";

const platform = "0xA4eBc4762601EE5792349044c796Ce3da9A13f1A";
const walletConnectProjectId = "12a65603dc5ad4317b3bc1be13138687";

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stabilitydao.org",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const polygonForking = defineChain({
  id: 137,
  name: "Polygon Forking",
  network: "polygon",
  nativeCurrency: {
    decimals: 18,
    name: "Matic",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
});

const { chains, publicClient } = configureChains(
  [polygonForking],
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
  FactoryABI,
  IVaultManagerABI,
  PlatformABI,
  StrategyABI,
  VaultABI,
  polygonForking,
  chains,
  publicClient,
  wagmiConfig,
};
