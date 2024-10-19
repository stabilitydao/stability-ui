import { getChainBridges, ChainName } from "@stabilitydao/stability";

type TProps = {
  chainId: number;
  chainName: ChainName;
};

const BridgesList: React.FC<TProps> = ({ chainId, chainName }) => {
  let bridges = getChainBridges(chainName);

  const total = bridges.length;

  if (chainId === 1) {
    return (
      <span className="flex w-full justify-center self-center text-[12px]">
        all
      </span>
    );
  }

  let more;
  if (total > 6) {
    bridges = bridges.slice(0, 5);
    more = `+${total - 5}`;
  }

  return (
    <div className="flex flex-wrap items-center">
      {bridges.map((bridge) => (
        <a
          key={bridge.name}
          className="inline-flex p-1 hover:bg-gray-700 rounded-xl"
          title={bridge.name}
          href={bridge.dapp}
          target="_blank"
        >
          <img
            className="w-[20px] h-[20px] rounded-full"
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/${bridge.img}`}
            alt={bridge.name}
          />
        </a>
      ))}
      {!!more && (
        <p className="text-accent-400 text-[12px] flex items-center justify-center font-semibold w-6 h-6 bg-accent-900 rounded-full">
          {more}
        </p>
      )}
    </div>
  );
};

export { BridgesList };
