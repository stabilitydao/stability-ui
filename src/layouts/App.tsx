import type React from "react";

import { WagmiConfig } from "wagmi";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { AppStore } from "./AppStore";
import { walletConnectProjectId, wagmiConfig, chains } from "@web3";

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, chains });

const App = (props: React.PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppStore>{props.children}</AppStore>
    </WagmiConfig>
  );
};

export default App;
