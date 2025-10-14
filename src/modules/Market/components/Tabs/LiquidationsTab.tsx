import { useState, useEffect } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { FullPageLoader, TableColumnSort, Pagination } from "@ui";

import { getShortAddress, sortTable, formatNumber, copyAddress } from "@utils";

import { MARKET_USERS_TABLE, PAGINATION_LIMIT } from "@constants";

import { account } from "@store";

import { TMarketUser, TTableColumn } from "@types";

type TProps = {
  network: string;
  market: string;
};

const LiquidationsTab: React.FC<TProps> = ({ network, market }) => {
  const $account = useStore(account);

  const [tableStates, setTableStates] = useState(MARKET_USERS_TABLE);

  const [tableData, setTableData] = useState<TMarketUser[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const getMarketUsers = async () => {
    try {
      const req = await axios.get(
        `https://api.stabilitydao.org/lending/${network}/${market}/users`
      );

      if (req.data) {
        const _users = Object.entries(req?.data).map(([address, data]) => ({
          address,
          collateral: data?.aTokenBalanceUsd ?? 0,
          debt: data?.debtTokenBalanceUsd ?? 0,
          LTV: data?.ltv ?? 0,
        }));

        setTableData(_users as TMarketUser[]);
      }
    } catch (error) {
      console.error("Get market users error:", error);
    }
  };

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    getMarketUsers();
  }, []);

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
      <div>
        {false ? ( //currentTabData.length
          <div>
            {currentTabData.map((user: TMarketUser) => (
              <div
                key={user?.address}
                className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
              >
                <div
                  className={`group px-2 md:px-4 w-1/4 text-start flex items-center gap-1 cursor-pointer ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
                  style={{ fontFamily: "monospace" }}
                  title={user?.address}
                  onClick={() => copyAddress(user?.address)}
                >
                  {getShortAddress(user?.address, 6, 4)}
                  <img
                    className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    src="/icons/copy.png"
                    alt="Copy icon"
                  />
                </div>
                <div className="px-2 md:px-4 w-1/4 text-end">
                  {user?.collateral
                    ? formatNumber(user?.collateral, "abbreviate")?.slice(1)
                    : ""}
                </div>
                <div className="px-2 md:px-4 w-1/4 text-end">
                  {user?.debt
                    ? formatNumber(user?.debt, "abbreviate")?.slice(1)
                    : ""}
                </div>
                <div className="px-2 md:px-4 w-1/4 text-end">
                  {user?.LTV ? `${(user?.LTV * 100).toFixed(2)}%` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
            <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
              <FullPageLoader />
            </div>
          </div>
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

export { LiquidationsTab };
