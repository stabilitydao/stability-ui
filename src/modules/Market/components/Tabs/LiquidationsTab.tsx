import { useState, useEffect, memo } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { FullPageLoader, Pagination } from "@ui";

import { ColumnSort } from "../../ui/ColumnSort";

import {
  getShortAddress,
  formatNumber,
  copyAddress,
  formatTimestampToDate,
  dataSorter,
} from "@utils";

import { MARKET_LIQUIDATIONS_TABLE, PAGINATION_LIMIT } from "@constants";

import { account } from "@store";

import { seeds } from "@stabilitydao/stability";

import { TMarketUser, TTableColumn } from "@types";

type TProps = {
  network: string;
  market: string;
};

const LiquidationsTab: React.FC<TProps> = memo(({ network, market }) => {
  const $account = useStore(account);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [tableStates, setTableStates] = useState(MARKET_LIQUIDATIONS_TABLE);

  const [tableData, setTableData] = useState<TMarketUser[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    //sort
    let sortedData = [];

    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        sortedData = [...tableData].sort((a, b) =>
          dataSorter(
            String(a[state.keyName]),
            String(b[state.keyName]),
            state.dataType,
            state.sortType
          )
        );
      }
    });

    setTableData(sortedData);
    setTableStates(table);
  };

  const getMarketLiquidations = async () => {
    try {
      const req = await axios.get(
        `${seeds[0]}/lending/${network}/${market}/liquidations`
      );

      if (req.data) {
        const liquidations = req.data.map((liquidation) => {
          return {
            user: liquidation.user,
            liquidator: liquidation.liquidator,
            liquidated: Number(liquidation?.liquidatedCollateralAmountInUSD),
            debt: Number(liquidation?.debtToCoverInUSD),
            timestamp: Number(liquidation.blockTimestamp),
            date: formatTimestampToDate(liquidation?.blockTimestamp, true),
          };
        });

        setTableData(liquidations);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Get market liquidations error:", error);
    }
  };

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    getMarketLiquidations();
  }, []);

  return (
    <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
      <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
        <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] w-[750px] md:w-full">
          {tableStates.map((value: TTableColumn, index: number) => (
            <ColumnSort
              key={value.name + index}
              index={index}
              value={value.name}
              table={tableStates}
              sort={tableHandler}
            />
          ))}
        </div>
        <div>
          {isLoading ? (
            <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
              <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                <FullPageLoader />
              </div>
            </div>
          ) : (
            <div className="w-[750px] md:w-full">
              {currentTabData.length ? (
                <div>
                  {currentTabData.map((liquidation, index) => (
                    <div
                      key={`${liquidation?.user}-${index}`}
                      className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
                    >
                      <div
                        className={`sticky bg-[#101012] lg:bg-transparent top-0 left-0 group px-2 md:px-4 w-[150px] md:w-1/5 text-start flex items-center gap-1 cursor-pointer z-10 border-r border-b md:border-r-0 md:border-b-0 border-[#23252A] h-[56px] ${$account?.toLowerCase() === liquidation?.user?.toLowerCase() ? "underline" : ""}`}
                        style={{ fontFamily: "monospace" }}
                        title={liquidation?.user}
                        onClick={() => copyAddress(liquidation?.user)}
                      >
                        {getShortAddress(liquidation?.user, 6, 4)}
                        <img
                          className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          src="/icons/copy.png"
                          alt="Copy icon"
                        />
                      </div>
                      <div
                        className="group px-2 md:px-4 w-[150px] md:w-1/5 text-start flex items-center gap-1 cursor-pointer"
                        style={{ fontFamily: "monospace" }}
                        title={liquidation?.liquidator}
                        onClick={() => copyAddress(liquidation?.liquidator)}
                      >
                        {getShortAddress(liquidation?.liquidator, 6, 4)}
                        <img
                          className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          src="/icons/copy.png"
                          alt="Copy icon"
                        />
                      </div>
                      <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end">
                        {liquidation?.liquidated
                          ? formatNumber(liquidation?.liquidated, "abbreviate")
                          : ""}
                      </div>
                      <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end">
                        {liquidation?.debt
                          ? formatNumber(liquidation?.debt, "abbreviate")
                          : ""}
                      </div>
                      <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end">
                        {liquidation?.date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <img src="/icons/file-search.svg" alt="Not found" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[16px] leading-6 font-semibold">
                        No liquidations yet
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
});

export { LiquidationsTab };
