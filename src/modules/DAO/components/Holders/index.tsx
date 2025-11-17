import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { account, apiData } from "@store";

import { Pagination, LoadTable } from "@ui";

import { ColumnSort } from "./ColumnSort";

import { getShortAddress, sortTable, formatNumber, copyAddress } from "@utils";

import { PAGINATION_LIMIT, HOLDERS_TABLE } from "@constants";

import type { TTableColumn, TLeaderboard } from "@types";

import type { ApiMainReply } from "@stabilitydao/stability";

const Holders = (): JSX.Element => {
  const $account = useStore(account);

  const $apiData: ApiMainReply | undefined = useStore(apiData);

  const [tableStates, setTableStates] = useState(HOLDERS_TABLE);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const initTableData = async () => {
    if (!!$apiData?.daoTokenHolders?.[146]) {
      //@ts-ignore
      let holdersData = Object.values($apiData?.daoTokenHolders?.[146]);

      holdersData = holdersData
        .sort((a, b) => Number(b?.percentage) - Number(a?.percentage))
        .map((data: any, index: number) => ({
          ...data,
          rank: index + 1,
        }));

      setTableData(holdersData);
    }
  };

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    initTableData();
  }, [$apiData]);

  return (
    <div className="pb-5 w-full">
      <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
        {tableStates.map((value: TTableColumn, index: number) => (
          <ColumnSort
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
      <div>
        {currentTabData.length ? (
          <div>
            {currentTabData.map((user: TLeaderboard) => (
              <div
                key={user.address}
                className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
              >
                <div className="px-2 md:px-4 w-[10%] text-start text-[#97979A] hidden md:block">
                  {user.rank}
                </div>
                <div
                  className={`group px-2 md:px-4 w-1/3 md:w-[30%] text-start flex items-center gap-1 cursor-pointer ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
                  style={{ fontFamily: "monospace" }}
                  title={user.address}
                  onClick={() => copyAddress(user.address)}
                >
                  {getShortAddress(user.address, 6, 4)}
                  <img
                    className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    src="/icons/copy.png"
                    alt="Copy icon"
                  />
                </div>
                <div className="px-2 md:px-4 w-1/3 md:w-[30%] text-end">
                  {user?.balance
                    ? formatNumber(user?.balance, "abbreviate")?.slice(1)
                    : ""}
                </div>
                <div className="px-2 md:px-4 w-1/3 md:w-[30%] text-end">
                  {user?.percentage}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LoadTable />
        )}
      </div>
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

export { Holders };
