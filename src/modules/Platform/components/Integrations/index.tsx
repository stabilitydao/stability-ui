import { useState, useEffect } from "react";

import { integrations } from "@stabilitydao/stability";

import { ProtocolBadge } from "../../ui";

import { TableColumnSort, HeadingText } from "@ui";

import { sortTable } from "@utils";

import { INTEGRATIONS_TABLE } from "@constants";

import type { TTableColumn } from "@types";

import type { DeFiOrganization } from "@stabilitydao/stability";

const toIntegration = (name: string): void => {
  window.location.href = `/integrations/${name.toLowerCase()}`;
};

const Integrations = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(INTEGRATIONS_TABLE);
  const [tableData, setTableData] = useState<DeFiOrganization[]>([]);

  const initTableData = async () => {
    if (integrations) {
      const integrationsData = Object.values(integrations).map(
        (integration) => ({
          ...integration,
          protocolsLength: Object.keys(integration.protocols).length,
        })
      );

      setTableData(integrationsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, []);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <HeadingText text="Integrations" scale={1} />

      <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
        <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
          <thead className="bg-accent-950 text-neutral-600 h-[36px]">
            <tr className="text-[12px] font-bold uppercase">
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
            {tableData.map(
              ({ name, img, website, github, defiLlama, protocols }) => (
                <tr
                  onClick={() => toIntegration(name)}
                  className="h-[48px] hover:bg-accent-950 cursor-pointer"
                  key={name}
                >
                  <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                    <div className="flex items-center py-2">
                      <img
                        className="w-[32px]"
                        src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${img}`}
                        alt={name}
                      />
                      <span className="ml-2">{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <a
                        href={website}
                        className="hover:bg-gray-700 p-2"
                        target="_blank"
                        title="Go to organization's website"
                      >
                        <img
                          src="/icons/web.svg"
                          alt="Website"
                          className="w-[20px]"
                        />
                      </a>
                      {github ? (
                        <a
                          href={`https://github.com/${github}`}
                          className="hover:bg-gray-700 p-2"
                          target="_blank"
                          title="Go to organization's guthub"
                        >
                          <img
                            src="/icons/github.svg"
                            alt="Github"
                            className="w-[20px]"
                          />
                        </a>
                      ) : (
                        <span className="w-[22px] m-2" />
                      )}
                      {defiLlama ? (
                        <a
                          href={`https://defillama.com/protocol/${defiLlama}`}
                          className="hover:bg-gray-700 p-2"
                          target="_blank"
                          title="Go to Defillama"
                        >
                          <img
                            src="/icons/defillama.svg"
                            alt="DefiLlama"
                            className="w-[20px]"
                          />
                        </a>
                      ) : (
                        <span className="w-[22px] m-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {Object.keys(protocols).map((propocolId) => (
                        <ProtocolBadge
                          key={propocolId}
                          name={protocols[propocolId].name}
                          category={protocols[propocolId].category}
                          supportedChains={protocols[propocolId].chains.length}
                        />
                      ))}
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

export { Integrations };
