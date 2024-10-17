import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";

import { Contests } from "./components";

import { FullPageLoader, HeadingText, TableColumnSort } from "@ui";

import { getShortAddress, sortTable } from "@utils";

import { findAllValidPeriods, formatTimestampToDate } from "./functions";

import { apiData } from "@store";

import { contests } from "@stabilitydao/stability";

import { USERS_TABLE } from "@constants";

import { TABLE_TYPES } from "./constants";

import type { TTableColumn, TLeaderboard } from "@types";

import type { ApiMainReply, YieldContest } from "@stabilitydao/stability";

const Users = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  // const activeContestInfo = contests?.[currentPeriod];
  // const pastContestInfo = contests?.[previousPeriod];

  const { currentPeriod, previousPeriod, nextPeriod } =
    findAllValidPeriods(contests);

  const periodsData = [
    contests[previousPeriod as keyof YieldContest],
    contests[currentPeriod as keyof YieldContest],
    contests[nextPeriod as keyof YieldContest],
  ];

  const [activeContest, setActiveContest] = useState(TABLE_TYPES[1]);

  const [tableStates, setTableStates] = useState(USERS_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const initTableData = async () => {
    if (!!allContests.ACTIVE?.length) {
      //@ts-ignore
      let contestData = allContests[activeContest].sort(
        (a: TLeaderboard, b: TLeaderboard) => b.earned - a.earned
      );

      contestData = contestData.map((data: TLeaderboard, index: number) => ({
        ...data,
        rank: index + 1,
      }));

      setTableStates(USERS_TABLE);
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
    <div className="flex flex-col xl:min-w-[1000px] gap-[36px]">
      <HeadingText text="Users" scale={1} styles="mb-0" />

      <Contests periodsData={periodsData} />

      <HeadingText text="Leaderboard" scale={2} styles="mb-0" />

      <div className="flex justify-center items-center font-semibold relative text-[14px]">
        {TABLE_TYPES.map((type: string) => {
          const isActive = activeContest === type;
          // @ts-ignore
          const hasContestData = !!allContests[type]?.length;

          let dateRange = type;

          switch (type) {
            case "PAST":
              dateRange = `${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].start)} - ${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].end)}`;
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
              className={`w-[150px] whitespace-nowrap z-20 text-center p-4 border-b-[1.5px] border-transparent ${hasContestData ? "cursor-pointer" : "cursor-default hover:border-transparent opacity-50"} ${isActive ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => hasContestData && setActiveContest(type)}
            >
              {dateRange}
            </p>
          );
        })}
      </div>

      {tableData.length ? (
        <table className="font-manrope">
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
                  key={user.deposit + user.rank}
                  className="h-[48px] hover:bg-accent-950"
                >
                  <td className="px-4 py-3 text-center">{user.rank}</td>
                  <td
                    className="px-4 py-3 text-center"
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
      ) : (
        <FullPageLoader />
      )}
    </div>
  );
};

export { Users };
