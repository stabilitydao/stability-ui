import {HeadingText} from "@ui";

import {formatTimestampToDate} from "../functions";
import {YieldContest} from "@stabilitydao/stability";

interface IContestsProps {
  periodsData: YieldContest[],
}

const Contests = ({ periodsData }: IContestsProps): JSX.Element => {
  return (
    <>
      <HeadingText text="Contests" scale={2} styles="mb-0" />
      <div className="flex justify-center flex-wrap items-stretch w-full">
        {!!periodsData.length &&
          periodsData.map((contest, index: number) => (
            <div
              key={contest.start}
              className="w-4/12 p-8"
            >
              <div className="bg-accent-950 h-full rounded-2xl p-5 flex flex-col gap-3 items-scenter justify-start text-[18px]">
                <span className="text-[24px] font-bold">{contest.name}</span>
                <p className="flex items-center text-accent-300 mb-2">
                  <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                      stroke="#b2a5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {`${formatTimestampToDate(contest.start)} - ${formatTimestampToDate(contest.end)}`}</p>
                <div
                  className={"h-[25px] text-[12px] inline-flex w-[100px] justify-center items-center font-semibold px-[8px] rounded-[100px] mb-2 "
                    + (
                      !index ?
                        "bg-neutral-950 text-neutral-500"
                        : index === 1
                          ? "bg-success-950 border-[1px] border-success-400 text-success-400"
                          : "bg-accent-950 border-[1px] border-accent-400 text-accent-400"
                    )}
                >
                  {!index ? "Ended" : index === 1 ? "Ongoing" : "Future"}
                </div>

                {!!contest.rewards.length &&
                  <div className="flex flex-col">
                    {contest.rewards.map((reward, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="">
                          {reward.type === "Points" &&
                              <span className="flex items-center">
                                  <img src="/pSTBL.svg" className="w-[24px] h-[24px]" alt="pSTBL"/>
                                  <span className="ml-2  font-bold">pSTBL</span>
                              </span>
                          }
                          {reward.type === "ERC20 Token" &&
                              <span className="flex items-center">
                                  todo img
                                  <span className="ml-1 font-bold">todo symbol</span>
                              </span>
                          }
                          {reward.type === "NFTs" &&
                              <span className="flex items-center">
                                  todo nft img
                                  <span className="ml-1 font-bold">todo nft symbol</span>
                              </span>
                          }
                        </div>
                        <div>
                          {reward.winnerReward} x {reward.winners}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
export { Contests };
