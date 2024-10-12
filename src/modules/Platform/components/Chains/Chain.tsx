import {
  type ApiMainReply,
  chains,
  getChainBridges,
  getChainProtocols,
  integrations,
} from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import { formatNumber } from "@utils";

import { Breadcrumbs } from "@ui";

import { ChainStatus } from "../../ui";

interface IProps {
  chain: number;
}

const Chain: React.FC<IProps> = ({ chain }) => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  const chainData = {
    ...chains[chain],
    tvl: $apiData?.total.chainTvl[chain] || 0,
  };

  const bridges = getChainBridges(chainData.name);

  const protocols = getChainProtocols(chain.toString());

  const chainInfo = [
    { name: "Chain ID", content: chain },
    { name: "Status", content: <ChainStatus status={chainData.status} /> },
    {
      name: "TVL",
      content: `\$${formatNumber($apiData?.total.chainTvl[chain.toString()] ? $apiData?.total.chainTvl[chain.toString()].toFixed(0) : "-", "withSpaces")}`,
    },
  ];

  return (
    <div className="flex flex-col lg:w-[800px]">
      <Breadcrumbs links={["Platform", "Chains", chainData.name]} />

      <div className="flex flex-col gap-[30px]">
        <div>
          <h1 className="mb-0 flex justify-center items-center text-[36px]">
            <img
              className="w-[36px] h-[36px] mr-4"
              src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chainData.img}`}
              alt=""
            />{" "}
            {chainData.name}
          </h1>

          <div className="flex flex-wrap p-[16px] ">
            {chainInfo.map(({ name, content }) => (
              <div
                key={name}
                className="flex w-full sm:w-6/12 md:w-4/12 lg:w-4/12 min-[1440px]:w-4/12 h-[120px] px-[12px] rounded-full text-gray-200 items-center justify-center flex-col it"
              >
                <div className="h-[50px] text-[30px] whitespace-nowrap items-center self-center flex">
                  {content}
                </div>
                <div className="flex self-center justify-center text-[16px]">
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <h2>Bridges</h2>

          <div className="flex flex-wrap">
            {bridges.map((bridge) => (
              <a
                key={bridge.name}
                className="inline-flex py-1 px-3 hover:bg-accent-800 rounded-xl items-center"
                title={bridge.name}
                href={bridge.dapp}
                target="_blank"
              >
                <img
                  className="w-[20px] h-[20px] rounded-full mr-2"
                  src={`https://raw.githubusercontent.com/stabilitydao/.github/main/${bridge.img}`}
                  alt={bridge.name}
                />
                <span>{bridge.name}</span>
              </a>
            ))}
          </div>
        </div>

        {protocols.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-4">Protocols</h2>
            <div className="flex flex-wrap gap-3">
              {protocols.map((protocol) => (
                <div
                  key={protocol.name}
                  className="inline-flex py-1 px-3 items-center"
                >
                  <img
                    className="w-[20px] h-[20px] rounded-full mr-2"
                    src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img || integrations[protocol.organization as string].img}`}
                    alt={protocol.name}
                  />
                  <span>{protocol.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {chainData.multisig && (
          <div className="mb-5">
            <h2 className="mb-4">Treasury</h2>
            <div className="text-[16px]">{chainData.multisig}</div>
          </div>
        )}

        {chainData.chainLibGithubId && (
          <div className="mb-5">
            <h2 className="mb-5">Development</h2>
            <a
              className="inline-flex items-center gap-2 bg-accent-800 px-4 py-0.5 rounded-xl"
              href={`https://github.com/stabilitydao/stability-contracts/issues/${chainData.chainLibGithubId}`}
              target="_blank"
              title="Go to chain library issue page on Github"
            >
              <img src="/icons/github.svg" alt="Github" className="w-[20px]" />
              <span className="text-[16px]">
                stability-contracts #{chainData.chainLibGithubId}
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export { Chain };
