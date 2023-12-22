import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { account, network } from "@store";

import { CHAINS } from "@constants";

function Wallet() {
  const $account = useStore(account);
  const $network = useStore(network);

  const chain = CHAINS.find((item) => item.name === $network);

  const { open } = useWeb3Modal();

  return (
    <div className="flex flex-nowrap justify-end whitespace-nowrap">
      {chain && (
        <button
          className="bg-button sm:py-1 px-2 rounded-md mx-2 sm:mx-4 flex items-center sm:gap-1"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          <img
            className="w-6 h-6 rounded-full sm:mx-1"
            src={chain?.logoURI}
            alt={chain?.name}
          />
          <p className="hidden sm:flex"> {chain?.name}</p>
        </button>
      )}
      <button
        className="bg-button py-1 px-2 rounded-md sm:mx-4"
        onClick={() => open()}
      >
        {$account
          ? `${$account.slice(0, 6)}...${$account.slice(-4)}`
          : "Connect wallet"}
      </button>
    </div>
  );
}
export { Wallet };
