import { useState, useEffect } from "react";

import { FullPageLoader, TableColumnSort, Badge, Pagination } from "@ui";

import {
  sortTable,
  formatTimestampToDate,
  getTokenData,
  formatNumber,
  cn,
} from "@utils";

import { CONTESTS_TABLE, PAGINATION_VAULTS } from "@constants";

import { contests } from "@stabilitydao/stability";

import { DisplayTypes } from "@types";

import type { TTableColumn, IExtendedYieldContest } from "@types";

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contests = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(CONTESTS_TABLE);
  const [tableData, setTableData] = useState<IExtendedYieldContest[]>([]);

  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);
  const [currentTab, setCurrentTab] = useState<number>(1);

  const initTableData = async () => {
    if (contests) {
      const contestsData = Object.entries(contests).map((contest) => {
        let status = 0;

        if (CURRENT_TIMESTAMP_IN_SECONDS < contest[1].start) {
          status = 2;
        } else if (
          CURRENT_TIMESTAMP_IN_SECONDS >= contest[1].start &&
          CURRENT_TIMESTAMP_IN_SECONDS <= contest[1].end
        ) {
          status = 1;
        }

        const rewardsLength = Array.isArray(contest[1].rewards)
          ? contest[1].rewards.length
          : contest[1].rewards;

        const questsLength = contest[1].integration
          ? Object.keys(contest[1].integration).length
          : 0;

        return {
          id: contest[0],
          name: contest[1].name,
          status,
          start: contest[1].start,
          end: contest[1].end,
          minEarn: contest[1].minEarn,
          rewards: contest[1].rewards,
          rewardsLength,
          quests: contest[1].integration,
          questsLength,
        };
      });

      setTableData(contestsData);
    }
  };

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabData = tableData.slice(firstTabIndex, lastTabIndex);

  useEffect(() => {
    initTableData();
  }, [contests]);
  return (
    <div className="min-w-full flex flex-col gap-10 xl:min-w-[1000px]">
      <div className="flex flex-col gap-4">
        <h2 className="page-title__font text-start">Contests</h2>
        <h3 className="text-[#97979a] page-description__font">
          Join yield contests to earn sGEM rewards. Compete by <br /> depositing
          into vaults, track your rank, and maximize <br /> returns through
          strategic participation
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* <div className="flex items-center gap-4 text-[14px] leading-5 font-semibold">
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
                  "h-10 px-4 #97979A border border-[#2C2E33] rounded-lg text-[#97979A]",
                  hasContestData ? "cursor-pointer" : "opacity-50",
                  isActive && "text-[#FFF] bg-[#22242A]"
                )}
                onClick={() => hasContestData && handleActiveContest(type)}
              >
                {dateRange}
              </button>
            );
          })}
        </div> */}
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
                {currentTabData.map(
                  ({
                    id,
                    status,
                    name,
                    start,
                    end,
                    minEarn,
                    rewards,
                    quests,
                  }) => {
                    const badgeState = !status
                      ? "default"
                      : status === 1
                        ? "success"
                        : "accent";

                    const badgeText = !status
                      ? "Ended"
                      : status === 1
                        ? "Ongoing"
                        : "Future";

                    const isTargetedGems = Array.isArray(rewards)
                      ? rewards.every(
                          (reward) => reward.type === "Gems1 Targeted"
                        )
                      : false;

                    const totalReward = isTargetedGems
                      ? rewards?.reduce(
                          (acc, cur) => (acc += cur.totalReward),
                          0
                        )
                      : 0;

                    return (
                      <a
                        key={name}
                        href={`/contests/${id}`}
                        className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] relative flex items-center text-[16px] leading-5 font-medium"
                      >
                        <div className="px-4 w-[10%] text-start text-[#97979A]">
                          <Badge
                            state={badgeState}
                            text={badgeText}
                            greater={true}
                          />
                        </div>
                        <div
                          className={cn(
                            "px-4 text-start w-[20%]",
                            contests[id].hidden && "text-[#97979A]"
                          )}
                        >
                          {name}
                        </div>
                        <div className="px-4 w-[20%] text-start text-nowrap">
                          {`${formatTimestampToDate(start, true)} - ${formatTimestampToDate(end, true)}`}
                        </div>
                        <div className="px-4 w-[20%] flex items-center justify-end">
                          {minEarn === "TBA" ? (
                            <div className="flex items-center justify-center h-6 w-10 bg-[#252528] rounded-[4px] border border-[#58595D] text-[12px] leading-4">
                              TBA
                            </div>
                          ) : (
                            minEarn
                          )}
                        </div>
                        <div className="px-4 w-[20%] text-start">
                          {Array.isArray(rewards) ? (
                            <div className="flex items-center flex-wrap gap-2">
                              {isTargetedGems ? (
                                <div className="flex items-center">
                                  <div className="mr-1">
                                    <img
                                      src="/icons/sonic_gem_icon.svg"
                                      className="w-[24px] h-[24px]"
                                      alt="sGEM1"
                                    />
                                  </div>
                                  <div className="flex items-center">
                                    {formatNumber(
                                      totalReward,
                                      "abbreviate"
                                    ).slice(1)}
                                  </div>
                                </div>
                              ) : (
                                rewards?.map((reward, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    <div className="mr-1">
                                      {reward.type === "Points" && (
                                        <img
                                          src="/pSTBL.svg"
                                          className="w-[24px] h-[24px]"
                                          alt="pSTBL"
                                        />
                                      )}
                                      {reward.type === "Gems1" && (
                                        <img
                                          src="/icons/sonic_gem_icon.svg"
                                          className="w-[24px] h-[24px]"
                                          alt="sGEM1"
                                        />
                                      )}

                                      {reward.type === "ERC20 Token" && (
                                        <img
                                          className="w-[24px] h-[24px] rounded-full"
                                          src={
                                            (getTokenData(
                                              reward.contract?.address as string
                                            )?.logoURI as string) ||
                                            "/error.svg"
                                          }
                                          alt="token"
                                        />
                                      )}

                                      {reward.type === "NFTs" &&
                                        reward.contract && (
                                          <span className="inline-flex items-center justify-center text-[11px] font-bold w-[24px] border-[1px]">
                                            NFT
                                          </span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                      {reward.winnerReward && reward.winners
                                        ? String(
                                            formatNumber(
                                              reward.winnerReward *
                                                reward.winners,
                                              "abbreviateInteger"
                                            )
                                          ).slice(1)
                                        : ""}
                                      {reward.totalReward &&
                                        formatNumber(
                                          reward.totalReward,
                                          "abbreviateIntegerNotUsd"
                                        )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-6 w-10 bg-[#252528] rounded-[4px] border border-[#58595D] text-[12px] leading-4">
                              TBA
                            </div>
                          )}
                        </div>
                        <div className="px-4 w-[10%] flex items-center justify-end">
                          {!!quests?.intract && (
                            <img
                              className="w-6"
                              src="/intract.png"
                              alt="Intract"
                              title="Intract"
                            />
                          )}
                        </div>
                      </a>
                    );
                  }
                )}
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

export { Contests };
