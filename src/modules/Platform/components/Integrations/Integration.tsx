import {
  integrations,
  chains,
  getIntegrationStatus,
  strategies,
  type StrategyShortId,
} from "@stabilitydao/stability";

import { protocolStatusInfo } from "@stabilitydao/stability/out/integrations";

import { StrategyStatus, ProtocolsChip } from "../../ui";

import { HeadingText } from "@ui";

import { extractDomain } from "@utils";

import type { TStrategyState } from "@types";

interface IProps {
  integrationName: string;
}

const Integration: React.FC<IProps> = ({ integrationName }) => {
  integrationName = integrationName.toLowerCase().replace(/\s+/g, "");
  const integration =
    Object.values(integrations).find(
      (protocol) =>
        protocol.name.toLowerCase().replace(/\s+/g, "") === integrationName
    ) || integrations.chainlink;

  const flatChains = Object.values(chains);

  const website = extractDomain(integration.website);

  const protocols = Object.values(integration.protocols);

  const strategiesData = Object.values(strategies).filter((strategy) =>
    strategy.protocols.some((protocol) => protocol.includes(integrationName))
  );

  return (
    <div className="flex flex-col lg:w-[960px] xl:min-w-[1200px]">
      <div className="flex flex-col">
        <div className="flex items-center justify-center gap-2">
          <img
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${integration.img}`}
            className="w-8 h-8"
            alt={integration.name}
            title={integration.name}
          />
          <HeadingText text={integration.name} scale={1} styles="mb-0" />
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <a
            href={integration.website}
            className="p-2 flex items-center justify-center gap-1"
            target="_blank"
            title="Go to organization's website"
          >
            <img src="/icons/web.svg" alt="Website" className="w-[20px]" />
            <span>{website}</span>
          </a>
          {!!integration.github && (
            <a
              href={`https://github.com/${integration.github}`}
              className="p-2 flex items-center justify-center gap-1"
              target="_blank"
              title="Go to organization's guthub"
            >
              <img src="/icons/github.svg" alt="Github" className="w-[20px]" />
              <span>{integration.github}</span>
            </a>
          )}
          {!!integration.defiLlama && (
            <a
              href={`https://defillama.com/protocol/${integration.defiLlama}`}
              className="p-2 flex items-center justify-center gap-1"
              target="_blank"
              title="Go to Defillama"
            >
              <img
                src="/icons/defillama.svg"
                alt="DefiLlama"
                className="w-[20px]"
              />
              <span>{integration.defiLlama}</span>
            </a>
          )}
        </div>
      </div>

      {!!strategiesData.length && (
        <div className="mt-5">
          <HeadingText text="Strategies" scale={2} styles="text-center mb-5" />
          <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
            <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] uppercase">
                  <td className="text-[12px] px-3 font-manrope font-semibold">
                    Strategy
                  </td>
                  <td className="text-[12px] px-3 font-manrope font-semibold">
                    Name
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
                {strategiesData.map((strategy) => (
                  <tr
                    key={strategy.id}
                    className="h-[48px] hover:bg-accent-950"
                  >
                    <td className="px-4 py-2">
                      <ProtocolsChip
                        id={strategy.shortId as StrategyShortId}
                        bgColor={strategy.bgColor}
                        color={strategy.color}
                      />
                    </td>
                    <td className="px-4 py-2 text-[16px] font-semibold">
                      {strategy.id}
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
        </div>
      )}

      <HeadingText text="Protocols" scale={2} styles="text-center mt-5" />

      <div className="flex items-stretch justify-center flex-wrap w-full gap-5 mt-5">
        {!!protocols.length &&
          protocols.map(({ name, category, chains, img }, index) => {
            const status = getIntegrationStatus(protocols[index]);

            const statusInfo = protocolStatusInfo[status];
            return (
              <div className="px-6 max-w-[450px]" key={name}>
                <div className="flex flex-col items-center justify-center p-[16px] gap-[8px] bg-accent-950 rounded-[24px]">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {img && (
                      <img
                        src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${img}`}
                        alt={name}
                        title={name}
                        className="w-6 h-6"
                      />
                    )}
                    <HeadingText text={name} scale={3} />
                  </div>

                  <div className="flex items-center justify-center flex-col">
                    <div className="h-[12px] flex uppercase text-[12px] leading-3 text-neutral-500 mb-0 md:mb-0">
                      Category
                    </div>
                    <div className="h-[40px] flex items-center text-[18px] font-semibold whitespace-nowrap">
                      {category}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-[12px] flex uppercase text-[12px] leading-3 text-neutral-500 mb-0 md:mb-0">
                      Status
                    </div>
                    <p
                      className="text-[18px] font-bold"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.title}
                    </p>
                    <p className="text-[16px]">{statusInfo.description}</p>
                  </div>

                  <div className="h-[12px] flex uppercase text-[12px] leading-3 text-neutral-500 mb-0 md:mb-0">
                    Chains
                  </div>

                  {!!chains.length && (
                    <div className="flex flex-wrap items-start justify-center gap-3">
                      {chains.map((chain) => {
                        const chainData = flatChains.find(
                          (_) => _.name === chain
                        );
                        return (
                          <a
                            key={chain}
                            href={`/chains/${chainData?.chainId}`}
                            target="_blank"
                            className="flex items-center justify-center gap-1"
                          >
                            <img
                              src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chainData?.img}`}
                              alt={chain}
                              title={chain}
                              className="w-5 h-5"
                            />
                            <span>{chain}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export { Integration };
