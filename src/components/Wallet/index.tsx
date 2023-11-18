import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { account, network } from "@store";

function Wallet() {
  const _account = useStore(account);
  const _network = useStore(network);

  const { open } = useWeb3Modal();

  return (
    <div id="account-block">
      {!!_network && (
        <button
          className="btn"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          {_network}
        </button>
      )}
      <button className="btn" onClick={() => open()}>
        {_account
          ? `${_account.slice(0, -36)}...${_account.substring(38)}`
          : "Connect wallet"}
      </button>
    </div>
  );
}
export { Wallet };
