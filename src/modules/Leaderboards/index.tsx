import { useState } from "react";

import { ClaimSiloPoints, Tables } from "./components";

import { Skeleton } from "@ui";

import { formatNumber, cn } from "@utils";

import { usePoints } from "./hooks";

import { LEADERBOARDS } from "./constants";

import { LeaderboardTableTypes } from "@types";

const Leaderboards = (): JSX.Element => {
  const [activeTable, setActiveTable] = useState(LEADERBOARDS[0]);

  const { totalPoints, isLoading } = usePoints();

  return (
    <div className="flex flex-col flex-wrap min-w-[full] md:min-w-[90vw] xl:min-w-[1200px] max-w-[1200px] w-full">
      <div className="flex items-center justify-between gap-[28px]">
        <div className="flex flex-col items-start gap-4">
          <h2 className="page-title__font text-start">Leaderboards</h2>
          <h3 className="text-[#97979a] page-description__font">
            Track user performance across yield vaults.{" "}
            <br className="hidden lg:block" /> Earn points by participating,
            ranking on the leaderboard, <br className="hidden lg:block" /> and
            unlocking exclusive airdrop benefits{" "}
            <br className="hidden lg:block" /> through smart yield farming
            strategies
          </h3>
          <ClaimSiloPoints />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-10">
        <div className="flex items-start md:items-center justify-between md:flex-row flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4 text-[14px] leading-5 font-semibold">
            {LEADERBOARDS.map((type: LeaderboardTableTypes) => {
              const isActive = type === activeTable;

              return (
                <button
                  key={type}
                  className={cn(
                    "h-10 px-4 border border-[#2C2E33] rounded-lg text-[#97979A] text-[14px]",
                    isActive && "text-[#FFF] bg-[#22242A]"
                  )}
                  onClick={() => setActiveTable(type)}
                >
                  {type}
                </button>
              );
            })}
          </div>
          {activeTable === LeaderboardTableTypes.Users ? (
            <>
              {isLoading ? (
                <Skeleton width={120} height={20} />
              ) : (
                <span className="text-[#97979A] text-[14px] leading-5 font-semibold text-end">
                  Total points:{" "}
                  {formatNumber(totalPoints, "abbreviate")?.slice(1)}
                </span>
              )}
            </>
          ) : null}
        </div>

        <Tables activeTable={activeTable} />
      </div>
    </div>
  );
};

export { Leaderboards };
