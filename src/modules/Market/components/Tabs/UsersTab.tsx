import { useState, useMemo } from "react";

import { Pagination } from "@ui";

import { UsersColumnSort, UsersTable } from "../../ui";

import { paginateData, dataSorter, cn } from "@utils";

import {
  getInitialStateFromUrl,
  getSortedTableStateFromUrl,
  getTableColumns,
} from "../../functions";

import { useMarketUsers } from "../../hooks";

import { PAGINATION_LIMIT } from "@constants";

import { USERS_TABLE_WIDTH } from "../../constants";

import { TMarketUser, TTableColumn, TMarket } from "@types";

type TProps = {
  market: TMarket;
};

const UsersTab: React.FC<TProps> = ({ market }) => {
  const { sortType } = getInitialStateFromUrl();

  const columnsByMarketTypes = getTableColumns(market.type);

  const { data, isLoading } = useMarketUsers(market);

  const initialTableState = getSortedTableStateFromUrl(
    columnsByMarketTypes,
    sortType
  );

  const [tableStates, setTableStates] = useState(initialTableState);
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    setTableStates(table);
  };

  const sortedData = useMemo(() => {
    if (!data) return [];

    const activeSortColumn = tableStates.find((col) => col.sortType !== "none");

    if (!activeSortColumn) return data;

    const { key, dataType, sortType } = activeSortColumn;

    return [...data].sort((a, b) =>
      dataSorter(
        String(a[key as keyof TMarketUser]),
        String(b[key as keyof TMarketUser]),
        dataType,
        sortType
      )
    );
  }, [data, tableStates]);

  const currentTabData = paginateData(sortedData, currentTab, pagination);

  return (
    <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
      <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
        <div
          className={cn(
            "flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] md:w-full",
            USERS_TABLE_WIDTH[market.type]
          )}
        >
          {tableStates.map((value: TTableColumn, index: number) => (
            <UsersColumnSort
              key={value.name + index}
              index={index}
              value={value.name}
              table={tableStates}
              sort={tableHandler}
              marketType={market.type}
            />
          ))}
        </div>
        <UsersTable
          isLoading={isLoading}
          data={currentTabData}
          marketType={market.type}
          columns={columnsByMarketTypes}
        />
      </div>
      <Pagination
        pagination={pagination}
        data={data ?? []}
        tab={currentTab}
        setTab={setCurrentTab}
        setPagination={setPagination}
      />
    </div>
  );
};

export { UsersTab };
