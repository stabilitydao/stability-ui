import { useState, useEffect, useMemo } from "react";

import axios from "axios";

import { Breadcrumbs, HeadingText, TableColumnSort, FullPageLoader } from "@ui";

import {
  getShortAddress,
  sortTable,
  formatTimestampToDate,
  formatNumber,
  getTokenData,
} from "@utils";

import { Timer } from "./components";

import { LEADERBOARD_TABLE } from "@constants";

import { contests, seeds } from "@stabilitydao/stability";

import type { TTableColumn, TLeaderboard } from "@types";

interface IProps {
  contestId: string;
}

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contest: React.FC<IProps> = ({ contestId }) => {
  const [tableStates, setTableStates] = useState(LEADERBOARD_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const initTableData = async () => {
    try {
      const response = await axios.get(`${seeds[0]}/contests/${contestId}`);

      if (response.data.leaderboard.length) {
        setTableData(response.data.leaderboard);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const contest = contests[contestId];

  const isActiveContest = useMemo(
    () => contest.start < CURRENT_TIMESTAMP_IN_SECONDS,
    [contest]
  );

  useEffect(() => {
    if (isActiveContest) {
      initTableData();
    }
  }, [contestId, isActiveContest]);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Users", "Contests", contest.name]} />
      <HeadingText
        text={contest.name}
        scale={1}
        styles={`${contest.hidden ? "text-neutral-500" : ""} mb-[10px]`}
      />

      <HeadingText
        text={`${formatTimestampToDate(contest.start, true)} - ${formatTimestampToDate(contest.end, true)}`}
        scale={2}
        styles="mb-6"
      />

      <Timer start={contest.start} end={contest.end} />

      {Array.isArray(contest.rewards) && !!contest.rewards.length && (
        <div className="flex flex-col items-start">
          <h3>Rewards</h3>

          <div className="flex items-center flex-wrap gap-2">
            {contest.rewards?.map((reward, index: number) => (
              <div key={index} className="flex items-center">
                <div className="mr-1">
                  {reward.type === "Points" && (
                    <img
                      src="/pSTBL.svg"
                      className="w-[24px] h-[24px]"
                      alt="pSTBL"
                    />
                  )}

                  {reward.type === "ERC20 Token" && (
                    <img
                      className="w-[24px] h-[24px] rounded-full"
                      src={
                        (getTokenData(reward.contract?.address as string)
                          ?.logoURI as string) || "/error.svg"
                      }
                      alt="token"
                    />
                  )}

                  {reward.type === "NFTs" && reward.contract && (
                    <span className="inline-flex items-center justify-center text-[11px] font-bold w-[24px] border-[1px]">
                      NFT
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {String(
                    formatNumber(
                      reward.winnerReward * reward.winners,
                      "abbreviateInteger"
                    )
                  ).slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isActiveContest && (
        <div className="mt-5 w-full">
          <HeadingText text="Leaderboard" scale={2} styles="mb-5" />
          {tableData.length ? (
            <table className="font-manrope w-full">
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
                  tableData.map(({ address, deposit, earned }) => (
                    <tr key={address} className="h-[48px] hover:bg-accent-950">
                      <td
                        className="px-4 py-3 text-center"
                        style={{ fontFamily: "monospace" }}
                      >
                        {getShortAddress(address, 6, 4)}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ fontFamily: "monospace" }}
                      >
                        {deposit <= 0.01
                          ? deposit.toFixed(4)
                          : deposit.toFixed(2)}
                      </td>
                      <td className="text-center px-4 py-3">
                        {earned <= 0.01 ? earned.toFixed(4) : earned.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <FullPageLoader />
          )}
        </div>
      )}
    </div>
  );
};

export { Contest };
