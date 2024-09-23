import {type ApiMainReply, ChainName, chains, getChainBridges} from "@stabilitydao/stability";
import { useStore } from "@nanostores/react";
import { apiData } from "@store";

const formatTvl = (tvl: number): string => {
  if (tvl > 1_000_000_000) {
    return "" + (tvl / 1_000_000_000).toFixed(1) + " B";
  }
  if (tvl > 3_000_000) {
    return "" + (tvl / 1_000_000).toFixed(0) + " M";
  }

  return "" + (tvl / 1_000_000).toFixed(1) + " M";
};

const shortAddr = (m: string): string => {
  return `${m.slice(0, 4)}...${m.slice(-2)}`;
};

const ChainStatus: React.FC<{
  status: string;
}> = ({ status }) => {
  let bg = "bg-gray-800";
  let text = "text-white";
  if (status === "SUPPORTED") {
    bg = "bg-green-800";
  } else if (status === "AWAITING_DEPLOYMENT") {
    bg = "bg-violet-800";
  }

  return (
    <span
      className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[160px] whitespace-nowrap ${bg} ${text}`}
    >
      {status
        .replace("AWAITING_DEPLOYMENT", "Awaiting deployment")
        .replace("NOT_SUPPORTED", "Not supported")
        .replace("SUPPORTED", "Supported")}
    </span>
  );
};

const Chains = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  return (
    <div>
      <h1>Chains</h1>

      <table>
        <thead>
        <tr className="text-[14px] font-bold">
          <td>Chain</td>
          <td className="px-3 text-center">ID</td>
          <td className="px-3 text-right">TVL</td>
          <td className="px-3">Treasury</td>
          <td className="px-3">Issue</td>
          <td className="px-3 text-center">Status</td>
          <td className="px-3">Bridges</td>
        </tr>
        </thead>
        <tbody>
          {Object.entries(chains).map(
            ([chainId, {
              name,
              status,
              img,
              multisig, chainLibGithubId
            }]) => (
              <tr key={chainId}>
                <td className="py-1">
                  <div className="flex items-center">
                    {img && (
                      <img
                        src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${img}`}
                        alt={name}
                        className="w-[24px] h-[24px] mr-2 rounded-full"
                      />
                    )}
                    {name}
                  </div>
                </td>
                <td className="px-3 text-center text-[14px] font-bold">
                  {chainId}
                </td>
                <td className="px-3 text-right">
                  {$apiData?.total.chainTvl[chainId] && (
                    <span>{formatTvl($apiData.total.chainTvl[chainId])}</span>
                  )}
                </td>
                <td className="px-3 text-[12px]">
                  <div className="flex">
                    {multisig && <span>{shortAddr(multisig)}</span>}
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-center">
                    {chainLibGithubId && (
                      <a
                        className="inline-flex"
                        href={`https://github.com/stabilitydao/stability-contracts/issues/${chainLibGithubId}`}
                        target="_blank"
                        title="Go to chain library issue page on Github"
                      >
                        <img
                          src="/icons/github.svg"
                          alt="Github"
                          className="w-[20px]"
                        />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-3">
                  <ChainStatus status={status} />
                </td>
                <td className="px-3 text-center">
                  <div className="flex items-center">
                    {+chainId === 1 ? (
                      <span className="flex w-full justify-center self-center text-[12px]">all</span>
                    ) : (
                      <div className="flex flex-wrap">
                        {getChainBridges(name).map(b => (
                          <a
                            className="inline-flex p-1 hover:bg-gray-700 rounded-xl"
                            title={b.name}
                            href={b.dapp}
                            target="_blank"
                          >
                            <img className="w-[20px] h-[20px] rounded-full" src={`https://raw.githubusercontent.com/stabilitydao/.github/main/${b.img}`} alt={b.name} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export { Chains };
