import type React from "react";

import { createWeb3Modal } from "@web3modal/wagmi/react";

import { AppStore } from "./AppStore";

import { WagmiLayout } from "@layouts";

import { walletConnectProjectId, wagmiConfig } from "@web3";

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });

const App = (props: React.PropsWithChildren) => {
  return (
    <WagmiLayout>
      <AppStore>{props.children}</AppStore>
    </WagmiLayout>
  );
};

export default App;
