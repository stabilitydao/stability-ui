import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@web3";

import { queryClient, persister } from "@store";

const WagmiLayout = (props: React.PropsWithChildren) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {props.children}
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
};

export default WagmiLayout;
