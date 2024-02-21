import type React from "react";

import { WagmiProvider } from "wagmi";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { createWeb3Modal } from "@web3modal/wagmi/react";

import { AppStore } from "./AppStore";

import { queryClient, persister } from "@store";

import { walletConnectProjectId, wagmiConfig } from "@web3";

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });

const App = (props: React.PropsWithChildren) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <AppStore>{props.children}</AppStore>{" "}
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
