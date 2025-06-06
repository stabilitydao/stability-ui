import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";

import { ContestsOverview, Rewards } from "./components";

import {
  ArrowRightIcon,
  FullPageLoader,
  TableColumnSort,
  Pagination,
} from "@ui";

import { getShortAddress, sortTable, formatTimestampToDate, cn } from "@utils";

import { findAllValidPeriods } from "./functions";

import { account, apiData } from "@store";

import { contests } from "@stabilitydao/stability";

import { USERS_TABLE, PAGINATION_VAULTS } from "@constants";

import { TABLE_TYPES } from "./constants";

import { DisplayTypes } from "@types";

import type { TTableColumn, TLeaderboard } from "@types";

import type { ApiMainReply, YieldContest } from "@stabilitydao/stability";

const Users = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  const $account = useStore(account);

  // const activeContestInfo = contests?.[currentPeriod];
  // const pastContestInfo = contests?.[previousPeriod];

  const { currentPeriod, previousPeriod, nextPeriod } =
    findAllValidPeriods(contests);

  const periodsData = [
    {
      id: previousPeriod || "",
      ...contests[previousPeriod as keyof YieldContest],
    },
    {
      id: currentPeriod || "",
      ...contests[currentPeriod as keyof YieldContest],
    },
    { id: nextPeriod || "", ...contests[nextPeriod as keyof YieldContest] },
  ];

  const [activeContest, setActiveContest] = useState(TABLE_TYPES[1]);

  const [activeContestID, setActiveContestID] = useState(currentPeriod);

  const [tableStates, setTableStates] = useState(USERS_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const handleActiveContest = (type: string) => {
    setActiveContest(type);

    if (type === "ACTIVE") {
      setActiveContestID(currentPeriod);
    }

    if (type === "PAST") {
      setActiveContestID(previousPeriod);
    }
  };

  const initTableData = async () => {
    if (!!allContests.ACTIVE?.length) {
      //@ts-ignore
      let contestData = allContests[activeContest];
      contestData = contestData.map((data: TLeaderboard, index: number) => ({
        ...data,
        rank: index + 1,
      }));
      setTableData(contestData);
    }
  };

  const allContests = useMemo(
    () => ({
      PAST: $apiData?.leaderboards?.[previousPeriod as keyof YieldContest],
      ACTIVE: $apiData?.leaderboards?.[currentPeriod as keyof YieldContest],
      ABSOLUTE: $apiData?.leaderboards.absolute,
    }),
    [$apiData?.leaderboards]
  );

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    initTableData();
  }, [activeContest, allContests]);

  return (
    <div className="flex flex-col flex-wrap min-w-full xl:min-w-[1200px] max-w-[1200px] w-full">
      <div className="flex items-center justify-between gap-[28px] flex-col xl:flex-row">
        <div className="flex flex-col items-start gap-4">
          <h2 className="page-title__font text-start">
            Top Users <br /> & sGEM1 Rewards
          </h2>
          <h3 className="text-[#97979a] page-description__font">
            Track user performance across yield vaults, contests, and{" "}
            <br className="hidden lg:block" /> sGEM1 rewards. Earn points by
            participating, ranking on the <br className="hidden lg:block" />{" "}
            leaderboard, and unlocking exclusive airdrop benefits{" "}
            <br className="hidden lg:block" /> through smart yield farming
            strategies
          </h3>
        </div>

        <Rewards />
      </div>

      <div className="mt-10 mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[24px] leading-8 font-semibold">Contests</span>
          <a
            className="text-[#5E6AD2] text-[16px] leading-6 font-semibold flex items-center justify-center gap-2"
            href="/contests"
          >
            View all contests
            <ArrowRightIcon color={"#5E6AD2"} />
          </a>
        </div>
        <ContestsOverview periodsData={periodsData} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[24px] leading-8 font-semibold">
            Leaderboards
          </span>
          {activeContest != "ABSOLUTE" && (
            <a
              className="text-[#5E6AD2] text-[16px] leading-6 font-semibold flex items-center justify-center gap-2"
              href={`/contests/${activeContestID}`}
            >
              View all leaders
              <ArrowRightIcon color={"#5E6AD2"} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-4 text-[14px] leading-5 font-semibold">
          {TABLE_TYPES.map((type: string) => {
            const isActive = activeContest === type;
            // @ts-ignore
            const hasContestData = !!allContests[type]?.length;

            let dateRange = type;

            switch (type) {
              case "PAST":
                if (previousPeriod) {
                  dateRange = `${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].start)} - ${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].end)}`;
                }

                break;
              case "ACTIVE":
                dateRange = `${formatTimestampToDate(contests[currentPeriod as keyof YieldContest].start)} - ${formatTimestampToDate(contests[currentPeriod as keyof YieldContest].end)}`;
                break;

              case "ABSOLUTE":
                dateRange = "Absolute";

              default:
                break;
            }
            return (
              <button
                key={type}
                className={cn(
                  "h-10 px-4 border border-[#2C2E33] rounded-lg text-[#97979A] text-[10px] md:text-[14px]",
                  hasContestData ? "cursor-pointer" : "opacity-50",
                  isActive && "text-[#FFF] bg-[#22242A]"
                )}
                onClick={() => hasContestData && handleActiveContest(type)}
              >
                {dateRange}
              </button>
            );
          })}
        </div>
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
                    <div className="px-4 w-[10%] text-start text-[#97979A]">
                      {user.rank}
                    </div>
                    <div
                      className={`px-4 w-[30%] text-start ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
                      style={{ fontFamily: "monospace" }}
                    >
                      {getShortAddress(user.address, 6, 4)}
                    </div>
                    <div className="px-4 w-[30%] text-end">
                      {user.earned <= 0.01
                        ? user.earned.toFixed(4)
                        : user.earned.toFixed(2)}
                    </div>
                    <div className="px-4 w-[30%] text-end">
                      {user.deposit
                        ? (Math.round(user.deposit * 100) / 100).toFixed(2)
                        : ""}
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
            display={DisplayTypes.Rows}
            setTab={setCurrentTab}
            setPagination={setPagination}
          />
        </div>
      </div>
    </div>
  );
};

export { Users };
