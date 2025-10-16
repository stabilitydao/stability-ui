import { useState, useEffect } from "react";

import { TableColumnSort, Pagination } from "@ui";

import { UsersTable } from "../../ui";

import { sortTable, paginateData } from "@utils";

import { useMarketUsers } from "../../hooks";

import { MARKET_USERS_TABLE, PAGINATION_LIMIT } from "@constants";

import { TMarketUser, TTableColumn } from "@types";

type TProps = {
  network: string;
  market: string;
};

const UsersTab: React.FC<TProps> = ({ network, market }) => {
  const { data } = useMarketUsers(network, market);

  const [isLoading, setIsLoading] = useState(true);

  const [tableStates, setTableStates] = useState(MARKET_USERS_TABLE);
  const [tableData, setTableData] = useState<TMarketUser[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  useEffect(() => {
    if (data && tableData.length === 0) {
      setTableData(data);
      setIsLoading(false);
    }
  }, [data]);

  const currentTabData = paginateData(tableData, currentTab, pagination);

  return (
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
            tableData={tableData}
            setTableData={setTableData}
          />
        ))}
      </div>
      <UsersTable isLoading={isLoading} data={currentTabData} />
      <Pagination
        pagination={pagination}
        data={tableData}
        tab={currentTab}
        setTab={setCurrentTab}
        setPagination={setPagination}
      />
    </div>
  );
};

export { UsersTab };
