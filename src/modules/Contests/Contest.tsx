import { useState, useEffect, useMemo } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { HeadingText, TableColumnSort, FullPageLoader, Pagination } from "@ui";

import {
  getShortAddress,
  sortTable,
  formatTimestampToDate,
  getNFTSymbol,
  getTokenData,
  formatNumber,
} from "@utils";

import { Timer } from "./components";

import { LEADERBOARD_TABLE, PAGINATION_LIMIT } from "@constants";

import { contests, seeds } from "@stabilitydao/stability";

import { account } from "@store";

import { DisplayTypes } from "@types";

import type { TTableColumn, TLeaderboard } from "@types";

interface IProps {
  contestId: string;
}

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contest: React.FC<IProps> = ({ contestId }) => {
  const $account = useStore(account);

  const [tableStates, setTableStates] = useState(LEADERBOARD_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);
  const [currentTab, setCurrentTab] = useState<number>(1);

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

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    if (isActiveContest) {
      initTableData();
    }
  }, [contestId, isActiveContest]);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      {!!contest?.img && (
        <img
          src={`https://raw.githubusercontent.com/stabilitydao/.github/main/covers/${contest.img}`}
          alt="Contest cover"
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-4">
          <h2 className="page-title__font text-start">{contest.name}</h2>
          <h3 className="text-[#97979a] page-description__font">
            {formatTimestampToDate(contest.start, true)} -
            {formatTimestampToDate(contest.end, true)}
          </h3>

          {Array.isArray(contest.rewards) && !!contest.rewards.length && (
            <div className="flex items-start gap-10">
              <div>
                <span className="text-[#97979A] text-[14px] leading-20 font-medium">
                  Task
                </span>
                <div className="text-[20px] leading-7 font-medium">
                  {contest.minEarn === "TBA" ? (
                    <span>TBA</span>
                  ) : (
                    <p>
                      Earn{" "}
                      <span className="text-[#48C05C]">
                        ${contest.minEarn}+
                      </span>{" "}
                      in vaults
                    </p>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[#97979A] text-[14px] leading-20 font-medium">
                  Rewards
                </span>
                <div className="flex items-start flex-col gap-2">
                  {/* {contest.rewards?.map((reward, index: number) => (
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

                        {reward.type.includes("Gems1") && (
                          <div className="flex items-center">
                            <img
                              src="/icons/sonic_gem_icon.svg"
                              className="w-[24px] h-[24px]"
                              alt="sGEM1"
                            />
                            <span className="ml-2 font-bold">
                              sGEM1{" "}
                              {reward.type === "Gems1 Targeted"
                                ? reward.targetVaults
                                : null}
                            </span>
                          </div>
                        )}

                        {reward.type === "ERC20 Token" && (
                          <span className="flex items-center">
                            <img
                              className="w-[24px] h-[24px] rounded-full"
                              src={
                                (getTokenData(
                                  reward.contract?.address as string
                                )?.logoURI as string) || "/error.svg"
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
                  ))} */}
                  {contest.rewards.map((reward, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center w-full"
                    >
                      <div>
                        {reward.type === "Points" && (
                          <span className="flex items-center">
                            <img
                              src="/pSTBL.svg"
                              className="w-[24px] h-[24px]"
                              alt="pSTBL"
                            />
                            <span className="ml-2 font-bold">pSTBL</span>
                          </span>
                        )}

                        {reward.type.includes("Gems1") && (
                          <div className="flex items-center gap-3">
                            <img
                              src="/icons/sonic_gem_icon.svg"
                              alt="sGEM1"
                              title="sGEM1"
                              className="w-6 h-6"
                            />
                            <p className="text-[20px] leading-6 md:text-[28px] md:leading-8 font-medium">
                              sGEM1{" "}
                              {reward.type === "Gems1 Targeted" && (
                                <span className="text-[18px] leading-5 mr-3">
                                  {reward.targetVault}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {reward.type === "ERC20 Token" && (
                          <span className="flex items-center">
                            <img
                              className="w-[24px] h-[24px] rounded-full"
                              src={
                                (getTokenData(
                                  reward.contract?.address as string
                                )?.logoURI as string) || "/error.svg"
                              }
                              alt=""
                            />
                            <span className="text-[28px] leading-[32px] font-medium">
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
                            <span className="text-[28px] leading-[32px] font-medium">
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
                      ) : null}
                      {reward.totalReward ? (
                        <span className="flex items-center justify-end text-[20px] leading-6 md:text-[28px] md:leading-8 font-semibold">
                          {formatNumber(
                            reward.totalReward,
                            "formatWithoutDecimalPart"
                          )}
                        </span>
                      ) : null}
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
        </div>
        <Timer start={contest.start} end={contest.end} />
      </div>

      {/* <div className="mt-5 w-full text-center">
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
      </div> */}

      <div className="flex flex-col gap-4 mt-10">
        <span className="text-[24px] leading-8 font-semibold">Leaderboard</span>

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

export { Contest };
