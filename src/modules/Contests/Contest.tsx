import { useState, useEffect, useMemo } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { Breadcrumbs, HeadingText, TableColumnSort, FullPageLoader } from "@ui";

import {
  getShortAddress,
  sortTable,
  formatTimestampToDate,
  getNFTSymbol,
  getTokenData,
  formatNumber,
} from "@utils";

import { Timer } from "./components";

import { LEADERBOARD_TABLE } from "@constants";

import { contests, seeds } from "@stabilitydao/stability";

import { account } from "@store";

import type { TTableColumn, TLeaderboard } from "@types";

interface IProps {
  contestId: string;
}

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contest: React.FC<IProps> = ({ contestId }) => {
  const $account = useStore(account);

  const [tableStates, setTableStates] = useState(LEADERBOARD_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const initTableData = async () => {
    try {
      const response = await axios.get(`${seeds[0]}/contests/${contestId}`);

      if (response.data.leaderboard.length) {
        const data = response.data.leaderboard.map(
          (user: TLeaderboard, index: number) => ({
            ...user,
            rank: index + 1,
          })
        );

        setTableData(data);
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
      {!!contest?.img && (
        <img
          src={`https://raw.githubusercontent.com/stabilitydao/.github/main/covers/${contest.img}`}
          alt="Contest cover"
        />
      )}
      <HeadingText
        text={contest.name}
        scale={1}
        styles={`${contest.hidden ? "text-neutral-500" : ""} my-[10px]`}
      />

      <HeadingText
        text={`${formatTimestampToDate(contest.start, true)} - ${formatTimestampToDate(contest.end, true)}`}
        scale={2}
        styles="mb-6"
      />

      <Timer start={contest.start} end={contest.end} />

      {Array.isArray(contest.rewards) && !!contest.rewards.length && (
        <div className="flex flex-col md:flex-row items-center mt-5 gap-5 justify-center">
          <div className="min-w-[200px]">
            <HeadingText text="Task" scale={2} />
            <p className="font-semibold text-[20px]">
              {contest.minEarn === "TBA"
                ? "TBA"
                : `Earn \$${contest.minEarn}+ in vaults`}
            </p>
          </div>
          <div className="min-w-[200px]">
            <HeadingText text="Rewards" scale={2} />
            <div className="flex items-start flex-col gap-2">
              {contest.rewards?.map((reward, index: number) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="">
                    {reward.type === "Points" && (
                      <span className="flex items-center">
                        <img
                          src="/pSTBL.svg"
                          className="w-[24px] h-[24px]"
                          alt="pSTBL"
                        />
                        <span className="ml-2  font-bold">pSTBL</span>
                      </span>
                    )}

                    {reward.type === "Gems1" && (
                      <span className="flex items-center">
                        <img
                          src="https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/sGEM1.png"
                          className="w-[24px] h-[24px]"
                          alt="sGEM1"
                        />
                        <span className="ml-2  font-bold">sGEM1</span>
                      </span>
                    )}

                    {reward.type === "ERC20 Token" && (
                      <span className="flex items-center">
                        <img
                          className="w-[24px] h-[24px] rounded-full"
                          src={
                            (getTokenData(reward.contract?.address as string)
                              ?.logoURI as string) || "/error.svg"
                          }
                          alt=""
                        />
                        <span className="ml-2 font-bold">
                          {(getTokenData(reward.contract?.address as string)
                            ?.symbol as string) || "UNKNOWN"}
                        </span>
                      </span>
                    )}

                    {reward.type === "NFTs" && reward.contract && (
                      <span className="flex items-center">
                        <span className="inline-flex items-center justify-center text-[11px] font-bold w-[24px] border-[1px]">
                          NFT
                        </span>
                        <span className="ml-2 font-bold">
                          {getNFTSymbol(
                            reward.contract?.chain,
                            reward.contract?.address
                          )}
                        </span>
                      </span>
                    )}
                  </div>
                  {reward.winnerReward && reward.winners ? (
                    <div className="flex items-center">
                      {reward.winnerReward} x
                      <svg
                        className="ml-[6px] mr-[2px]"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                          stroke="#dddddd"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {reward.winners}
                    </div>
                  ) : (
                    ""
                  )}
                  {reward.totalReward ? (
                    <div className="flex items-center">
                      {formatNumber(
                        reward.totalReward,
                        "formatWithoutDecimalPart"
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </div>
          </div>
          {!!contest?.integration?.intract && (
            <div className="flex flex-col items-center min-w-[200px]">
              <HeadingText text="Quest" scale={2} />
              <a
                className="flex items-center gap-1"
                href={`https://intract.io/quest/${contest.integration.intract}`}
                target="_blank"
              >
                <img
                  className="w-6"
                  src="/intract.png"
                  alt="Intract"
                  title="Intract"
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-external-link ms-1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                  <path d="M11 13l9 -9"></path>
                  <path d="M15 4h5v5"></path>
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
      <div className="mt-5 w-full text-center">
        <HeadingText text="Leaderboard" scale={2} styles="mb-5" />
        {isActiveContest ? (
          <div>
            {tableData.length ? (
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
                      tableData.map(({ rank, address, deposit, earned }) => (
                        <tr
                          key={address}
                          className="h-[48px] hover:bg-accent-950"
                        >
                          <td
                            className={`px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10 ${$account?.toLowerCase() === address ? "underline" : ""}`}
                          >
                            {rank}
                          </td>

                          <td
                            className="px-4 py-3 text-center"
                            style={{ fontFamily: "monospace" }}
                          >
                            {getShortAddress(address, 6, 4)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {earned <= 0.01
                              ? earned.toFixed(4)
                              : earned.toFixed(2)}
                          </td>
                          <td className="text-center px-4 py-3">
                            {deposit <= 0.01
                              ? deposit.toFixed(4)
                              : deposit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <FullPageLoader />
            )}
          </div>
        ) : (
          <HeadingText
            text="The leaderboard table will appear after the contest has started."
            scale={3}
          />
        )}
      </div>
    </div>
  );
};

export { Contest };
