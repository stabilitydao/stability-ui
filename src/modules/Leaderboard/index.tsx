import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import axios from "axios";

import { ClaimSiloPoints } from "./components";

import { ArrowRightIcon, TableColumnSort, Pagination, LoadTable } from "@ui";

import { getShortAddress, sortTable, formatNumber, copyAddress } from "@utils";

import { account, apiData } from "@store";

import { seeds } from "@stabilitydao/stability";

import { USERS_TABLE, PAGINATION_LIMIT } from "@constants";

import type { TTableColumn, TLeaderboard } from "@types";

import type { ApiMainReply } from "@stabilitydao/stability";

const Leaderboard = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  const $account = useStore(account);

  const [tableStates, setTableStates] = useState(USERS_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const [points, setPoints] = useState({});

  const initTableData = async () => {
    if (!!$apiData?.leaderboards.absolute.length) {
      //@ts-ignore
      let contestData = $apiData?.leaderboards.absolute;

      contestData = contestData.map((data: TLeaderboard, index: number) => ({
        ...data,
        rank: index + 1,
        points: points?.[data?.address as keyof typeof points] ?? 0,
      }));

      setTableData(contestData);
    }
  };

  const getPoints = async () => {
    try {
      const req = await axios.get(`${seeds[0]}/rewards/points`);

      if (req.data) {
        const response = req.data;

        setPoints(response);
      }
    } catch (error) {
      console.log("Get points error:", error);
    }
  };

  const totalPoints: number = useMemo(
    () =>
      Object.values(points).reduce(
        (acc: number, cur) => (acc += cur as number),
        0
      ) as number,
    [points]
  );

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    initTableData();
  }, [points]);

  useEffect(() => {
    getPoints();
  }, []);

  return (
    <div className="flex flex-col flex-wrap min-w-[full] md:min-w-[90vw] xl:min-w-[1200px] max-w-[1200px] w-full">
      <div className="flex items-center justify-between gap-[28px]">
        <div className="flex flex-col items-start gap-4">
          <h2 className="page-title__font text-start">Top Users</h2>
          <h3 className="text-[#97979a] page-description__font">
            Track user performance across yield vaults.{" "}
            <br className="hidden lg:block" /> Earn points by participating,
            ranking on the leaderboard, <br className="hidden lg:block" /> and
            unlocking exclusive airdrop benefits{" "}
            <br className="hidden lg:block" /> through smart yield farming
            strategies
          </h3>
          <ClaimSiloPoints />
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-10">
        <span className="text-[#97979A] text-[14px] leading-5 font-semibold text-end">
          Total points: {formatNumber(totalPoints, "abbreviate")?.slice(1)}
        </span>

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
                      className={`group px-2 md:px-4 w-1/4 md:w-[22.5%] text-start flex items-center gap-1 cursor-pointer ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
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
                    <div className="px-2 md:px-4 w-1/4 md:w-[22.5%] text-end">
                      {user.earned <= 0.01
                        ? user.earned.toFixed(4)
                        : formatNumber(user.earned.toFixed(), "format")}
                    </div>
                    <div className="px-2 md:px-4 w-1/4 md:w-[22.5%] text-end">
                      {user.points
                        ? formatNumber(user.points, "abbreviate")?.slice(1)
                        : ""}
                    </div>
                    <div className="px-2 md:px-4 w-1/4 md:w-[22.5%] text-end">
                      {user.deposit
                        ? formatNumber(
                            Math.round(user.deposit * 100) / 100,
                            "format"
                          )
                        : ""}
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
          <a
            className="text-[#5E6AD2] text-[16px] leading-6 font-semibold flex items-center justify-end gap-2 mt-5"
            href="/leaderboard/season-1"
          >
            Season 1
            <ArrowRightIcon color={"#5E6AD2"} />
          </a>
        </div>
      </div>
    </div>
  );
};

export { Leaderboard };
