import { useState } from "react";

import { ArrowIcon, ArrowRightIcon, Badge } from "@ui";

import { formatNumber, cn, formatTimestampToDate, getTokenData } from "@utils";

import { contests } from "@stabilitydao/stability";

import { IExtendedYieldContest } from "@types";

interface IProps {
  contest: IExtendedYieldContest;
}

const Row: React.FC<IProps> = ({ contest }) => {
  const [expandedData, setExpandedData] = useState(false);

  const { id, status, name, start, end, minEarn, rewards, quests } = contest;

  const badgeState = !status ? "default" : status === 1 ? "success" : "accent";

  const badgeText = !status ? "Ended" : status === 1 ? "Ongoing" : "Future";

  const isTargetedGems = Array.isArray(rewards)
    ? rewards.every((reward) => reward.type === "Gems1 Targeted")
    : false;

  const totalReward = isTargetedGems
    ? rewards?.reduce((acc, cur) => (acc += cur.totalReward), 0)
    : 0;

  return (
    <div className="border border-[#23252A] border-b-0">
      <a
        key={name}
        href={`/contests/${id}`}
        className="text-center bg-[#101012] h-[56px] relative flex items-center text-[16px] leading-5 font-medium"
        onClick={(e) => {
          if (window.innerWidth <= 1024) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div className="px-4 w-[10%] text-start text-[#97979A] lg:flex hidden">
          <Badge state={badgeState} text={badgeText} greater={true} />
        </div>
        <div
          className={cn(
            "px-4 text-start w-1/2 lg:w-[20%] text-[14px] xl:text-[16px]",
            contests[id]?.hidden && "text-[#97979A]"
          )}
        >
          {name}
        </div>
        <div className="px-4 w-[20%] text-start text-nowrap text-[14px] xl:text-[16px] hidden lg:flex">
          {`${formatTimestampToDate(start, true)} - ${formatTimestampToDate(end, true)}`}
        </div>
        <div className="px-4 w-[20%] lg:flex items-center justify-end hidden text-[14px] xl:text-[16px]">
          {minEarn === "TBA" ? (
            <div className="flex items-center justify-center h-6 w-10 bg-[#252528] rounded-[4px] border border-[#58595D] text-[12px] leading-4">
              TBA
            </div>
          ) : (
            minEarn
          )}
        </div>
        <div className="px-4 w-1/2 lg:w-[20%] text-start flex items-center justify-end lg:justify-start">
          {Array.isArray(rewards) ? (
            <div className="flex items-center gap-2 text-[12px] leading-4 font-medium">
              {isTargetedGems ? (
                <div className="flex items-center gap-[6px] bg-[#2E221D] border border-[#CE5511] px-2 py-1 rounded">
                  <img
                    src="/icons/orange_sonic_gem_icon.svg"
                    className="w-4 h-4 flex-shrink-0"
                    alt="sGEM1"
                  />

                  <div className="flex items-center">
                    {formatNumber(totalReward, "abbreviate").slice(1)}
                  </div>
                </div>
              ) : (
                rewards?.map((reward, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-[6px] px-2 py-1 rounded",
                      reward.type === "Points" &&
                        "bg-[#22212F] border border-[#5E4EBA]",
                      reward.type === "Gems1" &&
                        "bg-[#2E221D] border border-[#CE5511]",
                      reward.type === "ERC20 Token" &&
                        "bg-[#212A23] border border-[#008B46]"
                    )}
                  >
                    <div>
                      {reward.type === "Points" && (
                        <img
                          src="/short_logo.png"
                          className="w-4 h-4 flex-shrink-0"
                          alt="pSTBL"
                        />
                      )}
                      {reward.type === "Gems1" && (
                        <img
                          src="/icons/orange_sonic_gem_icon.svg"
                          className="w-4 h-4 flex-shrink-0"
                          alt="sGEM1"
                        />
                      )}

                      {reward.type === "ERC20 Token" && (
                        <img
                          className="w-4 h-4 rounded-full flex-shrink-0"
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
                      {reward.winnerReward && reward.winners
                        ? String(
                            formatNumber(
                              reward.winnerReward * reward.winners,
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
        <div className="px-4 w-[10%] lg:flex items-center justify-end hidden">
          {!!quests?.intract && (
            <img
              className="w-6"
              src="/intract.png"
              alt="Intract"
              title="Intract"
            />
          )}
        </div>

        <div className="block lg:hidden mr-4">
          <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
        </div>
      </a>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-2 px-4 py-2 bg-[#18191c] border-t border-[#23252A] xl:hidden">
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Status
            </span>
            <Badge state={badgeState} text={badgeText} greater={true} />
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Dates
            </span>
            <span className="text-[14px] leading-5">
              {`${formatTimestampToDate(start, true)} - ${formatTimestampToDate(end, true)}`}
            </span>
          </div>
          <div className="flex items-center justify-between w-full  text-[14px] leading-5 font-medium">
            <span className="text-[#909193]">Task</span>
            {minEarn === "TBA" ? (
              <div className="flex items-center justify-center h-6 w-10 bg-[#252528] rounded-[4px] border border-[#58595D] text-[12px] leading-4">
                TBA
              </div>
            ) : (
              minEarn
            )}
          </div>

          <a
            href={`/contests/${id}`}
            className="text-[#816FEA] text-[14px] leading-4 font-medium flex items-center justify-end gap-1 w-full mt-1"
          >
            <span>View Contest</span>
            <ArrowRightIcon />
          </a>
        </div>
      ) : null}
    </div>
  );
};

export { Row };
