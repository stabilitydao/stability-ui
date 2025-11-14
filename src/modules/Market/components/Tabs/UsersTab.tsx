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

import { TMarketUser, TTableColumn, TMarket } from "@types";

type TProps = {
  market: TMarket;
};

const UsersTab: React.FC<TProps> = ({ market }) => {
  const { sortType } = getInitialStateFromUrl();

  const riskData = useMemo(() => {
    const reserve = market?.reserves?.find(
      (r) => Number(r.maxLtv) > 0 && Number(r.liquidationThreshold) > 0
    );

    if (!reserve) {
      return { maxLTV: 0, LT: 0 };
    }

    return {
      maxLTV: Number(reserve.maxLtv),
      LT: Number(reserve.liquidationThreshold),
    };
  }, [market]);

  const { data, isLoading } = useMarketUsers(
    market?.network?.id as string,
    market?.marketId,
    riskData
  );

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
