import type React from "react";

import { WagmiConfig } from "wagmi";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { AppStore } from "@components";
import { wagmiConfig, chains } from "@web3";

import { walletConnectProjectId } from "../constants";

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, chains });

const App = (props: React.PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppStore>{props.children}</AppStore>
    </WagmiConfig>
  );
};

export default App;
