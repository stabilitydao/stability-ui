import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { account, network } from "@store";

function Wallet() {
  const $account = useStore(account);
  const $network = useStore(network);

  const { open } = useWeb3Modal();

  return (
    <div className="flex flex-nowrap justify-end whitespace-nowrap">
      {$network && (
        <button
          className="bg-button py-1 px-2 rounded-md mx-4"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          {$network}
        </button>
      )}
      <button
        className="bg-button py-1 px-2 rounded-md mx-4"
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
