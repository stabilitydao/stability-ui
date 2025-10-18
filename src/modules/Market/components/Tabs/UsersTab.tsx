import { useState, useMemo } from "react";

import { Pagination } from "@ui";

import { UsersColumnSort, UsersTable } from "../../ui";

import { paginateData, dataSorter } from "@utils";

import {
  getInitialStateFromUrl,
  getSortedTableStateFromUrl,
} from "../../functions";

import { useMarketUsers } from "../../hooks";

import { MARKET_USERS_TABLE, PAGINATION_LIMIT } from "@constants";

import { TMarketUser, TTableColumn } from "@types";

type TProps = {
  network: string;
  market: string;
};

const UsersTab: React.FC<TProps> = ({ network, market }) => {
  const { sortType } = getInitialStateFromUrl();

  const { data, isLoading } = useMarketUsers(network, market);

  const initialTableState = getSortedTableStateFromUrl(
    MARKET_USERS_TABLE,
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

    const { keyName, dataType, sortType } = activeSortColumn;

    return [...data].sort((a, b) =>
      dataSorter(
        String(a[keyName as keyof TMarketUser]),
        String(b[keyName as keyof TMarketUser]),
        dataType,
        sortType
      )
    );
  }, [data, tableStates]);

  const currentTabData = paginateData(sortedData, currentTab, pagination);

  return (
    <div className="pb-5">
      <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
        {tableStates.map((value: TTableColumn, index: number) => (
          <UsersColumnSort
            key={value.name + index}
            index={index}
            value={value.name}
            table={tableStates}
            sort={tableHandler}
          />
        ))}
      </div>
      <UsersTable isLoading={isLoading} data={currentTabData} />
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
