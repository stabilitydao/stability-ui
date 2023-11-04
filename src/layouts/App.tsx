/** @format */

import type React from "react";
import { useStore } from "@nanostores/react";
import { vaultsData } from "../state/StabilityStore";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { walletConnectProvider, EIP6963Connector } from "@web3modal/wagmi";
import { WagmiConfig, configureChains, createConfig, useConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { polygon } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { defineChain } from "viem";
import { AppStore } from "../components/AppStore";
import { walletConnectProjectId } from "../constants";

export function Vaults() {
  const $vaultData = useStore(vaultsData);

  if (Object.keys($vaultData) && Object.keys($vaultData).length > 0) {
    return (
      <table style={{ display: "flex", justifyContent: "center" }}>
        <tbody>
          {Object.keys($vaultData).map(vaultAdress => (
            <tr
              key={vaultAdress}
              style={{
                display: "grid",
                border: "1px",
                borderStyle: "solid",
                padding: "10px",
                borderColor: "grey",
              }}>
              <td style={{ display: "grid" }}>
                {" "}
                <a href={`/vault/${vaultAdress}`}>
                  Vault:
                  {vaultAdress}
                </a>
              </td>

              <td>
                <a href={`/vault/${vaultAdress}`}>
                  TVL: {$vaultData[vaultAdress].vaultSharePrice.toString()}
                </a>
              </td>
              <td>
                <a href={`/vault/${vaultAdress}`}>
                  User Balance:{" "}
                  {$vaultData[vaultAdress].vaultUserBalance.toString()}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return <h1>Loading Vaults..</h1>;
  }
}

export const polygonForking = defineChain({
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

const metadata = {
  name: "Stability",
  description: "Stability Asset Management Platform",
  url: "https://stabilitydao.org",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

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

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, chains });

export default function App(props: React.PropsWithChildren) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppStore>{props.children}</AppStore>
    </WagmiConfig>
  );
}
