import { useState, useEffect } from "react";

import { chains, getChainBridges } from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import { Breadcrumbs, HeadingText, TableColumnSort } from "@ui";

import { BridgesList, ChainStatus, ProtocolsList } from "../../ui";

import { formatNumber, sortTable } from "@utils";

import { CHAINS_TABLE } from "@constants";

import { CHAINS_INFO } from "../../constants";

import type { TTableColumn, IChainData } from "@types";

import { getChainProtocols, integrations } from "@stabilitydao/stability";

import type { ApiMainReply } from "@stabilitydao/stability";

const toChain = (chainId: number): void => {
  window.location.href = `/chains/${chainId}`;
};

const Chains = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  const [tableStates, setTableStates] = useState(CHAINS_TABLE);
  const [tableData, setTableData] = useState<IChainData[]>([]);

  const initTableData = async () => {
    if (chains) {
      const chainsData = Object.entries(chains).map((chain) => {
        const allChainProtocols = getChainProtocols(chain[0]);

        const protocols = allChainProtocols.map(({ organization }) => ({
          name: integrations[organization as string].name,
          img: integrations[organization as string].img,
          website: integrations[organization as string].website,
        }));

        const uniqueProtocols = protocols.filter(
          (protocol, index, self) =>
            index === self.findIndex((p) => p.name === protocol.name)
        );

        return {
          ...chain[1],
          chainId: Number(chain[1].chainId),
          bridgesCount: getChainBridges(chain[1].name).length,
          protocols: uniqueProtocols,
          protocolsCount: protocols.length,
          tvl: $apiData?.total.chainTvl[chain[0]] || 0,
        };
      });

      setTableData(chainsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, [$apiData]);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Platform", "Chains"]} />

      <HeadingText text="Chains" scale={1} styles="mt-3" />

      <div className="flex items-center justify-center flex-wrap relative mb-5">
        {CHAINS_INFO.map(({ name, length, color }) => (
          <div
            key={name}
            className={`flex w-[140px] h-[120px] mx-[20px] rounded-full ${color} items-center justify-center flex-col`}
          >
            <div className="text-4xl">{length}</div>
            <div className="flex self-center justify-center text-[14px]">
              {name}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto lg:overflow-x-visible lg:min-w-[1000px]">
        <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[1000px] lg:min-w-full">
          <thead className="bg-accent-950 text-neutral-600 h-[36px]">
            <tr className="text-[12px] uppercase">
              {tableStates.map((value: TTableColumn, index: number) => (
                <TableColumnSort
                  key={value.name + index}
                  index={index}
                  value={value.name}
                  sort={sortTable}
                  table={tableStates}
                  setTable={setTableStates}
                  tableData={tableData}
                  setTableData={setTableData}
                />
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {!!tableData.length &&
              tableData.map(
                ({
                  chainId,
                  name,
                  status,
                  img,
                  // chainLibGithubId,
                  // multisig,
                  tvl,
                  protocols,
                }) => (
                  <tr
                    onClick={() => toChain(chainId)}
                    key={chainId}
                    className="h-[48px] hover:bg-accent-950 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center sticky lg:relative left-0 lg:table-cell bg-accent-950 lg:bg-transparent z-10">
                      <div className="flex font-bold whitespace-nowrap items-center">
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
                    <td className="px-4 py-3 text-center font-bold">
                      {chainId}
                    </td>
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      {formatNumber(tvl, "abbreviate")}
                    </td>
                    {/* <td className="px-4 py-3 text-[12px]">
                    <div className="flex">
                      {multisig && <span>{getShortAddress(multisig)}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {chainLibGithubId && (
                        <a
                          className="inline-flex"
                          href={`https://github.com/stabilitydao/stability-contracts/issues/${chainLibGithubId}`}
                          target="_blank"
                          title="Go to chain library issue page on Github"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <img
                            src="/icons/github.svg"
                            alt="Github"
                            className="w-[20px]"
                          />
                        </a>
                      )}
                    </div>
                  </td> */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <ChainStatus status={status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex lg:justify-center items-center">
                        <BridgesList chainId={chainId} chainName={name} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex lg:justify-center items-center">
                        <ProtocolsList protocols={protocols} />
                      </div>
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Chains };
