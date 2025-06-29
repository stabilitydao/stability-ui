import { useState, useEffect } from "react";

import { TableColumnSort, Pagination, ContestsTable } from "@ui";

import { sortTable, cn } from "@utils";

import { CONTESTS_TABLE, PAGINATION_LIMIT } from "@constants";

import { contests } from "@stabilitydao/stability";

import { DisplayTypes } from "@types";

import type { TTableColumn, IExtendedYieldContest } from "@types";

const CONTESTS_FILTERS = ["All", "Ongoing", "Future", "Ended"];

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contests = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(CONTESTS_TABLE);
  const [tableData, setTableData] = useState<IExtendedYieldContest[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<
    IExtendedYieldContest[]
  >([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const [activeFilter, setActiveFilter] = useState(CONTESTS_FILTERS[0]);

  const tableFilter = (filter: string) => {
    if (filter === activeFilter) return;

    let data = tableData;

    switch (filter) {
      case "Ongoing":
        data = data.filter(({ status }) => status === 1);
        break;
      case "Future":
        data = data.filter(({ status }) => status === 2);
        break;
      case "Ended":
        data = data.filter(({ status }) => !status);
        break;
      default:
        break;
    }

    setActiveFilter(filter);
    setFilteredTableData(data);
  };

  const initTableData = async () => {
    if (contests) {
      const contestsData = Object.entries(contests).map((contest) => {
        let status = 0;

        if (CURRENT_TIMESTAMP_IN_SECONDS < contest[1].start) {
          status = 2;
        } else if (
          CURRENT_TIMESTAMP_IN_SECONDS >= contest[1].start &&
          CURRENT_TIMESTAMP_IN_SECONDS <= contest[1].end
        ) {
          status = 1;
        }

        const rewardsLength = Array.isArray(contest[1].rewards)
          ? contest[1].rewards.length
          : contest[1].rewards;

        const questsLength = contest[1].integration
          ? Object.keys(contest[1].integration).length
          : 0;

        return {
          id: contest[0],
          name: contest[1].name,
          status,
          start: contest[1].start,
          end: contest[1].end,
          minEarn: contest[1].minEarn,
          rewards: contest[1].rewards,
          rewardsLength,
          quests: contest[1].integration,
          questsLength,
        };
      });

      setFilteredTableData(contestsData);
      setTableData(contestsData);
    }
  };

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = filteredTableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    initTableData();
  }, [contests]);

  return (
    <div className="min-w-full flex flex-col gap-10 lg:min-w-[900px] xl:min-w-[1000px]">
      <div className="flex flex-col gap-4">
        <h2 className="page-title__font text-start">Contests</h2>
        <h3 className="text-[#97979a] page-description__font">
          Join yield contests to earn sGEM rewards. Compete by{" "}
          <br className="md:block hidden" /> depositing into vaults, track your
          rank, and maximize <br className="md:block hidden" /> returns through
          strategic participation
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {CONTESTS_FILTERS.map((filter) => (
            <span
              key={filter}
              className={cn(
                "h-10 px-4 cursor-pointer border border-[#23252A] rounded-lg flex items-center justify-center font-medium text-[14px] leading-5 text-[#97979A] duration-200 ease-in-out",
                activeFilter === filter && "text-white bg-[#22242A]"
              )}
              onClick={() => tableFilter(filter)}
            >
              {filter}
            </span>
          ))}
        </div>
        <div className="pb-5">
          <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
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
          </div>
          <ContestsTable contests={currentTabData} />

          <Pagination
            pagination={pagination}
            data={filteredTableData}
            tab={currentTab}
            display={DisplayTypes.Rows}
            setTab={setCurrentTab}
            setPagination={setPagination}
          />
        </div>
      </div>
    </div>
  );
};

export { Contests };
