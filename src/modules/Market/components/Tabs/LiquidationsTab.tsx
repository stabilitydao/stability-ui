import { useState, memo, useMemo } from "react";

import { Pagination } from "@ui";

import { LiquidationsColumnSort, LiquidationTable } from "../../ui";

import { dataSorter, paginateData } from "@utils";

import {
  getInitialStateFromUrl,
  getSortedTableStateFromUrl,
} from "../../functions";

import { useMarketLiquidations } from "../../hooks";

import { MARKET_LIQUIDATIONS_TABLE, PAGINATION_LIMIT } from "@constants";

import { TTableColumn, TLiquidation } from "@types";

type TProps = {
  networkId: string;
  marketId: string;
};

const LiquidationsTab: React.FC<TProps> = memo(({ networkId, marketId }) => {
  const { sortType } = getInitialStateFromUrl();

  const { data, isLoading } = useMarketLiquidations(networkId, marketId);

  const initialTableState = getSortedTableStateFromUrl(
    MARKET_LIQUIDATIONS_TABLE,
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
        String(a[keyName as keyof TLiquidation]),
        String(b[keyName as keyof TLiquidation]),
        dataType,
        sortType
      )
    );
  }, [data, tableStates]);

  const currentTabData = paginateData(sortedData, currentTab, pagination);

  return (
    <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
      <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
        <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] w-[650px] md:w-full">
          {tableStates.map((value: TTableColumn, index: number) => (
            <LiquidationsColumnSort
              key={value.name + index}
              index={index}
              value={value.name}
              table={tableStates}
              sort={tableHandler}
            />
          ))}
        </div>
        <LiquidationTable isLoading={isLoading} data={currentTabData} />
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
});

export { LiquidationsTab };
