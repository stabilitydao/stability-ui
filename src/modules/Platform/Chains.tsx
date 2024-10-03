import {
  type ApiMainReply,
  ChainName,
  chains,
  getChainBridges,
  getChainsTotals,
} from "@stabilitydao/stability";
import { useStore } from "@nanostores/react";
import { apiData } from "@store";

import { formatNumber } from "@utils";

const shortAddress = (address: string, firstChars: number = 4, lastChars: number = 2): string => {
  return `${address.slice(0, firstChars)}..${address.slice(-lastChars)}`;
};

const BridgesList: React.FC<{
  chainId: string;
  chainName: ChainName;
}> = ({ chainId, chainName }) => {
  let bridges = getChainBridges(chainName);
  const total = bridges.length;
  if (+chainId === 1) {
    return (
      <span className="flex w-full justify-center self-center text-[12px]">
        all
      </span>
    );
  }

  let more;
  if (total > 6) {
    bridges = bridges.slice(0, 5);
    more = <span className="text-[12px] ml-1">... +{total - 5}</span>;
  }

  return (
    <div className="flex flex-wrap items-center">
      {bridges.map((b) => (
        <a
          key={b.name}
          className="inline-flex p-1 hover:bg-gray-700 rounded-xl"
          title={b.name}
          href={b.dapp}
          target="_blank"
        >
          <img
            className="w-[20px] h-[20px] rounded-full"
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/${b.img}`}
            alt={b.name}
          />
        </a>
      ))}
      {more}
    </div>
  );
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
  } else if (status === "AWAITING_ISSUE_CREATION") {
    bg = "bg-orange-900";
  }

  return (
    <span
      className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[160px] whitespace-nowrap ${bg} ${text}`}
    >
      {status
        .replace("AWAITING_DEPLOYMENT", "Awaiting deployment")
        .replace("NOT_SUPPORTED", "Not supported")
        .replace("SUPPORTED", "Supported")
        .replace("AWAITING_ISSUE_CREATION", "Awaiting issue creation")}
    </span>
  );
};

const Chains = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);
  const totalChains = getChainsTotals();

  const chainsInfo = [
    ["Total", Object.keys(chains).length, "text-gray-400"],
    ["Supported", totalChains.SUPPORTED, "text-green-400"],
    ["Awaiting deployment", totalChains.AWAITING_DEPLOYMENT, "text-violet-400"],
    ["Development", totalChains.CHAINLIB_DEVELOPMENT, "text-blue-400"],
    ["Awaiting developer", totalChains.AWAITING_DEVELOPER, "text-yellow-200"],
    ["Awaiting issue", totalChains.AWAITING_ISSUE_CREATION, "text-orange-300"],
  ];
  return (
    <div>
      <div className="flex mb-5 text-[14px] text-gray-300">
        <a href="/platform" className="mr-2 font-bold">
          Platform
        </a>{" "}
        - <span className="ml-2">Chains</span>
      </div>

      <h1 className="mb-3">Chains</h1>

      <div className="flex flex-wrap relative mb-5">
        {chainsInfo.map((chain) => (
          <div
            key={chain[0]}
            className={`flex w-[140px] h-[120px] mx-[20px] rounded-full ${chain[2]} items-center justify-center flex-col`}
          >
            <div className="text-4xl">{chain[1]}</div>
            <div className="flex self-center justify-center text-[14px]">
              {chain[0]}
            </div>
          </div>
        ))}
      </div>

      <table className="w-full">
        <thead className="h-[34px]">
          <tr className="text-[14px] font-bold">
            <td>Chain</td>
            <td className="px-3 text-center">ID</td>
            <td className="px-3 text-right">TVL</td>
            <td className="px-3">Treasury</td>
            <td className="px-3 text-center">Issue</td>
            <td className="px-3 text-center">Status</td>
            <td className="px-3 text-center">Bridges</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(chains).map(
            ([chainId, { name, status, img, multisig, chainLibGithubId }]) => (
              <tr key={chainId} className="hover:bg-gray-800">
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
                <td className="px-3 text-right whitespace-nowrap">
                  {$apiData?.total.chainTvl[chainId] && (
                    <span>
                      {formatNumber(
                        $apiData.total.chainTvl[chainId],
                        "abbreviate"
                      )}
                    </span>
                  )}
                </td>
                <td className="px-3 text-[12px]">
                  <div className="flex">
                    {multisig && <span>{shortAddress(multisig)}</span>}
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
                    <BridgesList chainId={chainId} chainName={name} />
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

export { Chains, shortAddress };
