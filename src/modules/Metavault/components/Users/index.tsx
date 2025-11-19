import { useState, useMemo } from "react";

import { UsersColumnSort, UsersTable } from "../../ui";

import { Pagination } from "@ui";

import { paginateData, dataSorter, getSortedTableStateFromUrl } from "@utils";

import { useMetaVaultUsers } from "../../hooks";

import { getInitialStateFromUrl } from "../../functions";

import { PAGINATION_LIMIT, METAVAULT_USERS_TABLE } from "@constants";

import { TAddress, TTableColumn, TMetaVaultUser } from "@types";

type TProps = {
  network: string;
  metavault: TAddress;
};

const Users: React.FC<TProps> = ({ network, metavault }) => {
  const { sortType } = getInitialStateFromUrl();

  const { data, isLoading } = useMetaVaultUsers(network, metavault);

  const initialTableState = getSortedTableStateFromUrl(
    METAVAULT_USERS_TABLE,
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
        String(a[key as keyof TMetaVaultUser]),
        String(b[key as keyof TMetaVaultUser]),
        dataType,
        sortType
      )
    );
  }, [data, tableStates]);

  const currentTabData = paginateData(sortedData, currentTab, pagination);

  return (
    <div className="pb-5 min-w-full">
      <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
        <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] md:w-full w-[450px]">
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

export { Users };
