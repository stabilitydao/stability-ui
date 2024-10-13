import { useState, useEffect } from "react";

import { strategies } from "@stabilitydao/stability";

import { Breadcrumbs, HeadingText, TableColumnSort } from "@ui";

import { StrategyStatus } from "../../ui";

import { sortTable } from "@utils";

import { STRATEGIES_TABLE } from "@constants";

import { STRATEGIES_INFO } from "../../constants";

import type { TStrategyState, TTableColumn, TTableStrategy } from "@types";

const toStrategy = (id: string): void => {
  window.location.href = `/strategies/${id.toLowerCase()}`;
};

const Strategies = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(STRATEGIES_TABLE);
  const [tableData, setTableData] = useState<TTableStrategy[]>([]);

  const initTableData = async () => {
    if (strategies) {
      const strategiesData = Object.entries(strategies).map((strategy) => ({
        id: strategy[1].id,
        shortId: strategy[1].shortId,
        state: strategy[1].state,
        contractGithubId: strategy[1].contractGithubId,
        color: strategy[1].color,
        bgColor: strategy[1].bgColor,
      }));
      setTableData(strategiesData);
    }
  };

  useEffect(() => {
    initTableData();
  }, []);

  return (
    <div>
      <Breadcrumbs links={["Platform", "Strategies"]} />

      <HeadingText text="Strategies" scale={1} />

      <div className="flex items-center justify-center flex-wrap relative mb-7">
        {STRATEGIES_INFO.map(({ name, state, color }) => (
          <div
            key={name}
            className={`flex w-[140px] h-[120px] mx-[20px] rounded-full ${color} items-center justify-center flex-col`}
          >
            <div className="text-4xl">{state}</div>
            <div className="flex self-center justify-center text-[14px]">
              {name}
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
        <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
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
                ({ id, shortId, state, contractGithubId, color, bgColor }) => {
                  return (
                    <tr
                      onClick={() => toStrategy(shortId)}
                      className="h-[48px] hover:bg-accent-950 cursor-pointer"
                      key={shortId}
                    >
                      <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                        <div className="flex justify-center">
                          <span
                            className="flex justify-center px-3 rounded-xl w-[86px]"
                            style={{
                              backgroundColor: bgColor,
                              color: color,
                            }}
                          >
                            {shortId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{id}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <StrategyStatus state={state as TStrategyState} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <a
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex"
                            href={`https://github.com/stabilitydao/stability-contracts/issues/${contractGithubId}`}
                            target="_blank"
                            title="Go to strategy issue page on Github"
                          >
                            <img
                              src="/icons/github.svg"
                              alt="Github"
                              className="w-[20px]"
                            />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Strategies };
