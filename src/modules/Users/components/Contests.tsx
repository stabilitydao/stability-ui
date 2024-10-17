import { HeadingText } from "@ui";

import { formatTimestampToDate } from "../functions";

import { YieldContest } from "@stabilitydao/stability";

interface IContestsProps {
  periodsData: YieldContest[];
}

const Contests = ({ periodsData }: IContestsProps): JSX.Element => {
  return (
    <>
      <HeadingText text="Contests" scale={2} styles="mb-0" />
      <div className="flex justify-center flex-wrap items-stretch w-full">
        {!!periodsData.length &&
          periodsData.map((contest, index: number) => (
            <div key={contest.start} className="w-1/3 p-8">
              <div className="bg-accent-950 h-full rounded-2xl p-5 flex flex-col gap-3 items-scenter justify-start text-[18px]">
                <span className="text-[24px] font-bold">{contest.name}</span>
                <p className="flex items-center text-accent-300 mb-2">
                  <img src="/calendar.svg" alt="calendar" className="mr-2" />
                  {`${formatTimestampToDate(contest.start)} - ${formatTimestampToDate(contest.end)}`}
                </p>
                <div
                  className={
                    "h-[25px] text-[12px] inline-flex w-[100px] justify-center items-center font-semibold px-[8px] rounded-[100px] mb-2 " +
                    (!index
                      ? "bg-neutral-950 text-neutral-500"
                      : index === 1
                        ? "bg-success-950 border-[1px] border-success-400 text-success-400"
                        : "bg-accent-950 border-[1px] border-accent-400 text-accent-400")
                  }
                >
                  {!index ? "Ended" : index === 1 ? "Ongoing" : "Future"}
                </div>

                {!!contest.rewards.length && (
                  <div className="flex flex-col">
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
                              <span className="ml-2  font-bold">pSTBL</span>
                            </span>
                          )}

                          {reward.type === "ERC20 Token" && (
                            <span className="flex items-center">
                              todo img
                              <span className="ml-1 font-bold">
                                todo symbol
                              </span>
                            </span>
                          )}

                          {reward.type === "NFTs" && (
                            <span className="flex items-center">
                              todo nft img
                              <span className="ml-1 font-bold">
                                todo nft symbol
                              </span>
                            </span>
                          )}
                        </div>
                        <div>
                          {reward.winnerReward} x {reward.winners}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
export { Contests };
