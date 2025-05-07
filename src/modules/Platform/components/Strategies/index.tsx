import { useState, useEffect } from "react";

import { strategies, type StrategyShortId } from "@stabilitydao/stability";

import { HeadingText, TableColumnSort, Counter } from "@ui";

import { StrategyStatus, ProtocolsChip } from "../../ui";

import { sortTable } from "@utils";

import { STRATEGIES_TABLE } from "@constants";

import { STRATEGIES_INFO, STRATEGY_STATUSES } from "../../constants";

import type { TStrategyState, TTableColumn, TTableStrategy } from "@types";

const toStrategy = (id: string): void => {
  window.location.href = `/strategies/${id.toLowerCase()}`;
};

const Strategies = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(STRATEGIES_TABLE);
  const [tableData, setTableData] = useState<TTableStrategy[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<TTableStrategy[]>(
    []
  );
  const [activeStrategies, setActiveStrategies] = useState(STRATEGIES_INFO);

  const initTableData = async () => {
    const searchParams = new URLSearchParams(window.location.search);

    const strategyStatuses = searchParams.getAll("status");

    if (strategies) {
      const strategiesData = Object.values(strategies).map(
        ({ id, shortId, state, contractGithubId, color, bgColor }) => ({
          id,
          shortId,
          state,
          contractGithubId,
          color,
          bgColor,
        })
      );

      const filteredStrategiesData = strategyStatuses.length
        ? strategiesData.filter((strategy) =>
            strategyStatuses.includes(strategy.state.toLowerCase())
          )
        : strategiesData;

      const filteredStrategies = strategyStatuses.length
        ? activeStrategies.map((strategy) =>
            strategyStatuses.includes(
              strategy.name.toLowerCase().split(" ").join("_")
            )
              ? { ...strategy, active: !strategy.active }
              : strategy
          )
        : activeStrategies.map((strategy) => ({ ...strategy, active: true }));

      setTableData(strategiesData);
      setActiveStrategies(filteredStrategies);
      setFilteredTableData(filteredStrategiesData);
    }
  };

  const activeStrategiesHandler = (category: string) => {
    let updatedStrategies = activeStrategies.map((strategy) =>
      category === strategy.name
        ? { ...strategy, active: !strategy.active }
        : strategy
    );

    ///// For chains URL filters
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);
    /////

    const allActive = activeStrategies.every((strategy) => strategy.active);
    const allInactive = updatedStrategies.every((strategy) => !strategy.active);

    if (allInactive) {
      updatedStrategies = activeStrategies.map((strategy) => ({
        ...strategy,
        active: true,
      }));
    } else if (allActive) {
      updatedStrategies = activeStrategies.map((strategy) => ({
        ...strategy,
        active: strategy.name === category,
      }));
    }

    /// URL set
    const activeChainsLength = updatedStrategies.filter(
      (strategy) => strategy.active
    )?.length;

    if (activeChainsLength === updatedStrategies.length) {
      params.delete("status");
    } else {
      params.delete("status");

      updatedStrategies.forEach((strategy) => {
        const type = strategy.name.toLowerCase().split(" ").join("_");

        if (strategy.active) {
          params.append("status", type);
        }
      });
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());

    setActiveStrategies(updatedStrategies);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    const strategiesToFilter = activeStrategies.filter(
      (strategy) => strategy.active
    );

    let data: TTableStrategy[] = [];
    //filter
    strategiesToFilter.forEach((strategy) => {
      if (strategy.active) {
        data.push(
          ...tableData.filter(
            (row) =>
              row.state ===
              STRATEGY_STATUSES[strategy.name as keyof typeof STRATEGY_STATUSES]
          )
        );
      }
    });
    //sort
    sortTable({
      table,
      setTable: setTableStates,
      tableData: data,
      setTableData: setFilteredTableData,
    });
  };

  useEffect(() => {
    tableHandler();
  }, [activeStrategies]);

  useEffect(() => {
    initTableData();
  }, []);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <HeadingText text="Strategies" scale={1} />

      <div className="bg-accent-950 p-[26px] rounded-[44px] mb-6 flex flex-col select-none">
        <div className="flex flex-wrap relative justify-evenly gap-5">
          {activeStrategies.map(({ name, length, bgColor, active }) => (
            <div
              key={name}
              className={`flex p-[12px] ${active ? "opacity-100" : "opacity-50"} cursor-pointer`}
              onClick={() => activeStrategiesHandler(name)}
            >
              <Counter color={bgColor} value={length.toString()} name={name} />
            </div>
          ))}
        </div>
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
                  tableData={filteredTableData}
                  setTableData={setFilteredTableData}
                />
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {!!filteredTableData.length ? (
              filteredTableData.map(
                ({ id, shortId, state, contractGithubId, color, bgColor }) => {
                  return (
                    <tr
                      onClick={() => toStrategy(shortId)}
                      className="h-[48px] hover:bg-accent-950 cursor-pointer"
                      key={shortId}
                    >
                      <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                        <ProtocolsChip
                          id={shortId as StrategyShortId}
                          bgColor={bgColor}
                          color={color}
                        />
                      </td>
                      <td className="px-4 py-3 text-[16px] font-semibold">
                        {id}
                      </td>
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
              )
            ) : (
              <tr>
                <td>
                  <p className="text-[18px]">No results found.</p>
                  <p className="min-w-[200px]">
                    Try clearing your filters or changing your search term.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Strategies };
