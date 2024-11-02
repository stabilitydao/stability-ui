import { useMemo } from "react";

import {
  type ApiMainReply,
  assets,
  chains,
  getChainBridges,
  getChainProtocols,
  getChainStrategies,
  getStrategyProtocols,
  integrations,
} from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData, vaults } from "@store";

import { formatNumber } from "@utils";

import { Breadcrumbs, HeadingText } from "@ui";

import { ChainStatus, StrategyStatus } from "../../ui";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

import type { TStrategyState, TVault } from "@types";

interface IProps {
  chain: number;
}

const Chain: React.FC<IProps> = ({ chain }) => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  const $vaults = useStore(vaults);

  const chainData = {
    ...chains[chain],
    tvl: $apiData?.total.chainTvl[chain] || 0,
  };

  const bridges = getChainBridges(chainData.name);

  const protocols = getChainProtocols(chain.toString());

  const showChainLibIssue =
    [
      "AWAITING_DEVELOPER",
      "AWAITING_DEPLOYMENT",
      "AWAITING_ISSUE_CREATION",
      "CHAINLIB_DEVELOPMENT",
    ].includes(chainData.status) && chainData.chainLibGithubId;

  const chainInfo = [
    { name: "Chain ID", content: chain },
    {
      name: "Status",
      content: !showChainLibIssue ? (
        <ChainStatus status={chainData.status} />
      ) : (
        <div className="flex items-center">
          <ChainStatus status={chainData.status} />
          <a
            className="inline-flex items-center gap-2 bg-accent-800 rounded-full ml-2"
            href={`https://github.com/stabilitydao/stability-contracts/issues/${chainData.chainLibGithubId}`}
            target="_blank"
            title="Go to chain library issue page on Github"
          >
            <img src="/icons/github.svg" alt="Github" className="w-[20px]" />
          </a>
        </div>
      ),
    },
    {
      name: "TVL",
      content: `\$${formatNumber($apiData?.total.chainTvl[chain.toString()] ? $apiData?.total.chainTvl[chain.toString()].toFixed(0) : "-", "withSpaces")}`,
    },
  ];

  const vaultsInfo = useMemo(() => {
    if (!$apiData) return [];

    const chainVaults: TVault[] = Object.entries($vaults[chain] || {}).map(
      (vault) => vault[1] as TVault
    );

    const vaultsTVL: number = chainVaults.reduce(
      (acc: number, cur) => (acc += Number(cur?.tvl)),
      0
    );

    const weightedAverageAPR: number = chainVaults.reduce(
      (acc: number, cur) =>
        acc +
        (Number(cur?.earningData?.apr?.daily) * Number(cur?.tvl)) / vaultsTVL,
      0
    );

    return [
      {
        name: "Vaults",
        content: chainVaults.length,
      },
      {
        name: "Vaults APR",
        content: `${weightedAverageAPR.toFixed(2)}%`,
      },
      {
        name: "Vaults TVL",
        content: formatNumber(vaultsTVL, "abbreviate"),
      },
    ];
  }, [$vaults, chain]);

  const chainAssets = assets.filter((asset) =>
    Object.keys(asset.addresses).includes(chain.toString())
  );

  const strategies = getChainStrategies(chainData.name);

  return (
    <div className="flex flex-col max-w-[1200px] w-full lg:w-[960px]  xl:min-w-[1200px]">
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

          <div className="flex items-center justify-center flex-wrap p-[16px] ">
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
          {chainData.status === "SUPPORTED" && vaultsInfo.length ? (
            <div className="flex items-center justify-center flex-wrap p-[16px] ">
              {vaultsInfo.map(({ name, content }, index) => (
                <div
                  key={name}
                  className="flex w-full sm:w-6/12 md:w-4/12 lg:w-4/12 min-[1440px]:w-4/12 h-[120px] px-[12px] rounded-full text-gray-200 items-center justify-center flex-col it"
                >
                  {!index ? (
                    <a
                      className="h-[50px] text-[30px] whitespace-nowrap items-center self-center flex"
                      target="_blank"
                      href={`/?chain=${chain}&status=all`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="h-[50px] text-[30px] whitespace-nowrap items-center self-center flex">
                      {content}
                    </div>
                  )}

                  <div className="flex self-center justify-center text-[16px]">
                    {name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
        </div>

        {strategies.length > 0 && (
          <div className="mb-5">
            <HeadingText text="Strategies" scale={2} styles="mb-3" />

            <table className="font-manrope w-full">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] uppercase">
                  <td className="text-[12px] px-3 font-manrope font-semibold">
                    Strategy
                  </td>
                  <td className="text-[12px] px-3 font-manrope font-semibold">
                    State
                  </td>
                  <td className="text-[12px] px-3 font-manrope font-semibold">
                    Issue
                  </td>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {strategies.map((strategy) => (
                  <tr
                    key={strategy.id}
                    className="h-[48px] hover:bg-accent-950"
                  >
                    <td className="px-4 py-2">
                      <div
                        className="inline-flex whitespace-nowrap items-center rounded-xl"
                        style={{
                          backgroundColor: strategy.bgColor,
                          color: strategy.color,
                        }}
                      >
                        <span className="inline-flex w-[100px] gap-1 justify-end text-right">
                          {getStrategyProtocols(strategy.shortId).map(
                            (protocol) => (
                              <img
                                key={protocol.name}
                                className="w-[24pxx] h-[24px]"
                                src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img || integrations[protocol.organization as string].img}`}
                                alt=""
                              />
                            )
                          )}
                        </span>
                        <span className="inline-flex justify-start px-3 rounded-xl w-[300px] text-[16px] font-bold">
                          {strategy.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StrategyStatus
                        state={strategy.state as TStrategyState}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        className="inline-flex"
                        href={`https://github.com/stabilitydao/stability-contracts/issues/${strategy.contractGithubId}`}
                        target="_blank"
                        title="Go to strategy issue page on Github"
                      >
                        <img
                          src="/icons/github.svg"
                          alt="Github"
                          className="w-[20px]"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-5">
          <HeadingText text="Bridges" scale={2} styles="mb-3" />

          <div className="flex items-center justify-center flex-wrap">
            {bridges.map((bridge) => (
              <a
                key={bridge.name}
                className="w-[144px] h-[100px] m-2 text-[14px] pt-3 pb-1 inline-flex flex-col justify-center bg-accent-900 hover:bg-accent-800 rounded-xl items-center relative"
                title={bridge.name}
                href={bridge.dapp}
                target="_blank"
              >
                <img
                  src="/link.svg"
                  alt="ExternalLink"
                  className="w-4 h-4 absolute right-2 top-2"
                />
                <img
                  className="w-[36px] h-[36px] rounded-full mb-2"
                  src={`https://raw.githubusercontent.com/stabilitydao/.github/main/${bridge.img}`}
                  alt={bridge.name}
                />
                <span className="text-center truncated-text">
                  {bridge.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {protocols.length > 0 && (
          <div className="mb-5">
            <HeadingText text="Protocols" scale={2} styles="mb-4" />
            <div className="flex flex-wrap items-center justify-center">
              {protocols.map((protocol) => (
                <a
                  key={protocol.name}
                  className="w-[144px] h-[100px] m-2 text-[14px] pt-3 pb-1 inline-flex flex-col justify-center bg-accent-900 hover:bg-accent-800 rounded-xl items-center relative"
                  href={integrations[protocol.organization as string].website}
                  title={`Go to ${integrations[protocol.organization as string].name} website`}
                  target="_blank"
                >
                  <img
                    src="/link.svg"
                    alt="ExternalLink"
                    className="w-4 h-4 absolute right-2 top-2"
                  />
                  <img
                    className="w-[36px] h-[36px] rounded-full mb-2"
                    src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img || integrations[protocol.organization as string].img}`}
                    alt={protocol.name}
                  />
                  <span>{protocol.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {chainAssets.length > 0 && (
          <div className="mb-5">
            <HeadingText text="Assets" scale={2} styles="mb-4" />
            <div className="flex flex-wrap items-center justify-center">
              {chainAssets.map((asset) => (
                <a
                  key={asset.symbol}
                  className="w-[144px] h-[100px] m-2 text-[14px] pt-3 pb-1 inline-flex flex-col justify-center bg-accent-900 hover:bg-accent-800 rounded-xl items-center relative"
                  href={asset.website}
                  title={`Go to ${asset.symbol} website`}
                  target="_blank"
                >
                  <img
                    src="/link.svg"
                    alt="ExternalLink"
                    className="w-4 h-4 absolute right-2 top-2"
                  />
                  <img
                    className="w-[36px] h-[36px] rounded-full mb-2"
                    src={
                      tokenlist.tokens.filter(
                        (token) =>
                          token.symbol.toLowerCase() ===
                          asset.symbol.toLowerCase()
                      )[0].logoURI
                    }
                    alt={asset.symbol}
                  />
                  <span>{asset.symbol}</span>
                </a>
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
      </div>
    </div>
  );
};

export { Chain };
