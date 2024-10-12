import { useState, useEffect } from "react";

import { integrations } from "@stabilitydao/stability";

import { ProtocolBadge } from "../ui";

import { Breadcrumbs, TableColumnSort } from "@ui";

import { sortTable } from "@utils";

import { INTEGRATIONS_TABLE } from "@constants";

import type { TTableColumn } from "@types";

import type { DeFiOrganization } from "@stabilitydao/stability";

const Integrations = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(INTEGRATIONS_TABLE);
  const [tableData, setTableData] = useState<DeFiOrganization[]>([]);

  const initTableData = async () => {
    if (integrations) {
      const integrationsData = Object.entries(integrations).map(
        (integration) => ({
          ...integration[1],
          protocolsLength: Object.keys(integration[1].protocols).length,
        })
      );
      setTableData(integrationsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, []);
  return (
    <div>
      <Breadcrumbs links={["Platform", "Integrations"]} />

      <h1>Integrations</h1>

      <table className="w-full font-manrope">
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
              <tr className="h-[48px] hover:bg-accent-950" key={name}>
                <td className="px-4 py-3">
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
  );
};

export { Integrations };
