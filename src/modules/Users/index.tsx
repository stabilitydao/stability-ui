import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";

import { ContestsOverview, Rewards } from "./components";

import { FullPageLoader, HeadingText, TableColumnSort } from "@ui";

import { getShortAddress, sortTable, formatTimestampToDate } from "@utils";

import { findAllValidPeriods } from "./functions";

import { account, apiData } from "@store";

import { contests } from "@stabilitydao/stability";

import { USERS_TABLE } from "@constants";

import { TABLE_TYPES } from "./constants";

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

  useEffect(() => {
    initTableData();
  }, [activeContest, allContests]);

  return (
    <div className="flex flex-col xl:min-w-[1200px] max-w-[1200px] w-full gap-[20px]">
      <HeadingText text="Users" scale={1} styles="mb-0" />

      <Rewards />

      <HeadingText text="Contests" scale={2} styles="mb-0" />
      <ContestsOverview periodsData={periodsData} />

      <div className="flex flex-col items-center mb-4 mt-2">
        <a
          className="bg-accent-900 max-w-[250px] min-w-[100px] text-[14px] font-semibold h-8 md:h-10 sm:py-1 md:px-3 rounded-xl sm:gap-1 flex items-center justify-center w-8 md:w-full"
          href="/contests"
        >
          All Contests
        </a>
      </div>

      <HeadingText text="Leaderboard" scale={2} styles="mb-0" />

      <div className="flex flex-wrap justify-center items-center font-semibold relative text-[14px]">
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

            default:
              break;
          }
          return (
            <p
              key={type}
              className={`w-[150px] md:w-1/3 whitespace-nowrap z-20 text-center p-4 border-b-[1.5px] border-transparent ${hasContestData ? "cursor-pointer" : "cursor-default hover:border-transparent opacity-50"} ${isActive ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => hasContestData && handleActiveContest(type)}
            >
              {dateRange}
            </p>
          );
        })}
      </div>
      {tableData.length ? (
        <>
          <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
            <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] uppercase">
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
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {!!tableData.length &&
                  tableData.map((user: TLeaderboard) => (
                    <tr
                      key={user.address}
                      className="h-[48px] hover:bg-accent-950"
                    >
                      <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                        {user.rank}
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
                        style={{ fontFamily: "monospace" }}
                      >
                        {getShortAddress(user.address, 6, 4)}
                      </td>
                      <td className="text-center px-4 py-3">
                        {user.earned <= 0.01
                          ? user.earned.toFixed(4)
                          : user.earned.toFixed(2)}
                      </td>
                      <td className="text-center px-4 py-3">
                        {user.deposit
                          ? (Math.round(user.deposit * 100) / 100).toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {activeContest != "ABSOLUTE" && (
            <div className="w-full flex items-center justify-center">
              <a
                className="bg-accent-900 max-w-[250px] min-w-[100px] text-[14px] font-semibold h-8 md:h-10 sm:py-1 md:px-3 rounded-xl sm:gap-1 flex items-center justify-center w-8 md:w-full"
                href={`/contests/${activeContestID}`}
              >
                All Users
              </a>
            </div>
          )}
        </>
      ) : (
        <FullPageLoader />
      )}
    </div>
  );
};

export { Users };
