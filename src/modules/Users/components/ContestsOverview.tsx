import { Badge } from "@ui";

import { formatTimestampToDate, getTokenData, getNFTSymbol } from "@utils";

import { YieldContest } from "@stabilitydao/stability";

interface YieldContestWithId extends YieldContest {
  id: string;
}

interface IContestsProps {
  periodsData: YieldContestWithId[];
}

const toContest = (contestId: string): void => {
  window.location.href = `/contests/${contestId}`;
};

const ContestsOverview = ({ periodsData }: IContestsProps): JSX.Element => {
  return (
    <div className="flex justify-center gap-10 flex-wrap items-stretch w-full">
      {!!periodsData.length &&
        periodsData.map(
          (contest, index: number) =>
            contest.id && (
              <div
                onClick={() => toContest(contest.id)}
                key={contest.start}
                className="cursor-pointer"
              >
                <div className="bg-accent-950 h-full w-[300px] rounded-2xl p-5 flex flex-col gap-3 items-scenter justify-start text-[18px]">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[24px] font-bold ${contest.hidden ? "text-neutral-500" : ""}`}
                    >
                      {contest.name}
                    </span>
                    {!!contest?.integration?.intract && (
                      <img
                        className="w-6"
                        src="/intract.png"
                        alt="Intract"
                        title="Intract"
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center text-accent-300 mb-1">
                      <img
                        src="/calendar.svg"
                        alt="calendar"
                        className="mr-2"
                      />
                      <span>
                        {formatTimestampToDate(contest.start)} -
                        {formatTimestampToDate(contest.end)}
                      </span>
                    </div>
                    <Badge
                      state={
                        !index ? "default" : index === 1 ? "success" : "accent"
                      }
                      text={
                        !index ? "Ended" : index === 1 ? "Ongoing" : "Future"
                      }
                      greater={true}
                    />
                  </div>
                  <div className="flex mb-1">
                    {contest.minEarn === "TBA"
                      ? "TBA"
                      : `Earn \$${contest.minEarn}+ in vaults`}
                  </div>

                  {!!contest.rewards.length && (
                    <div className="flex flex-col mt-2 gap-1">
                      {Array.isArray(contest.rewards) ? (
                        <>
                          {contest.rewards.map((reward, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <div className="">
                                {reward.type === "Points" && (
                                  <span className="flex items-center">
                                    <img
                                      src="/pSTBL.svg"
                                      className="w-[24px] h-[24px]"
                                      alt="pSTBL"
                                    />
                                    <span className="ml-2  font-bold">
                                      pSTBL
                                    </span>
                                  </span>
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
                                      {(getTokenData(
                                        reward.contract?.address as string
                                      )?.symbol as string) || "UNKNOWN"}
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
                            </div>
                          ))}
                        </>
                      ) : (
                        <div>TBA</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
        )}
    </div>
  );
};
export { ContestsOverview };
