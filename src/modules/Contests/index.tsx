import { useState, useEffect } from "react";

import {
  Breadcrumbs,
  HeadingText,
  FullPageLoader,
  TableColumnSort,
  Badge,
} from "@ui";

import {
  sortTable,
  formatTimestampToDate,
  getTokenData,
  formatNumber,
} from "@utils";

import { CONTESTS_TABLE } from "@constants";

import { contests } from "@stabilitydao/stability";

import type { TTableColumn, IExtendedYieldContest } from "@types";

const toContest = (contestId: string): void => {
  window.location.href = `/contests/${contestId}`;
};

const CURRENT_TIMESTAMP_IN_SECONDS = Math.floor(Date.now() / 1000);

const Contests = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(CONTESTS_TABLE);
  const [tableData, setTableData] = useState<IExtendedYieldContest[]>([]);

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

        return {
          id: contest[0],
          name: contest[1].name,
          status,
          start: contest[1].start,
          end: contest[1].end,
          minEarn: contest[1].minEarn,
          rewards: contest[1].rewards,
          rewardsLength: contest[1].rewards.length,
        };
      });

      setTableData(contestsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, [contests]);

  return (
    <div className="xl:w-[1200px]  w-full max-w-[1200px]">
      <Breadcrumbs links={["Users", "Contests"]} />
      <HeadingText text="Contests" scale={1} />
      <div className="flex flex-col items-center w-full">
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
                tableData.map(
                  ({ id, status, name, start, end, minEarn, rewards }) => {
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

                    return (
                      <tr
                        key={name}
                        className="h-[48px] hover:bg-accent-950 cursor-pointer"
                        onClick={() => toContest(id)}
                      >
                        <td className="px-4 py-3">
                          <Badge
                            state={badgeState}
                            text={badgeText}
                            greater={true}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">{name}</td>
                        <td className="text-center px-4 py-3">
                          {`${formatTimestampToDate(start, true)} - ${formatTimestampToDate(end, true)}`}
                        </td>
                        <td className="text-center px-4 py-3">{minEarn}</td>
                        <td className="text-left px-4 py-3">
                          {rewards != "TBA" && rewards.length ? (
                            <div className="flex items-center flex-wrap gap-2">
                              {rewards?.map((reward, index: number) => (
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
                                          (getTokenData(
                                            reward.contract?.address as string
                                          )?.logoURI as string) || "/error.svg"
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
                          ) : (
                            <div>TBA</div>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        ) : (
          <FullPageLoader />
        )}
      </div>
    </div>
  );
};

export { Contests };
