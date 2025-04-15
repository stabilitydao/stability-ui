import { useState, useEffect } from "react";

import { formatNumber } from "@utils";

import { getTimeProgress } from "../functions";

import type { TVestPeriod } from "@types";

interface IProps {
  type: string;
  value: number;
  activeVest: TVestPeriod;
}

const VestingTimeline: React.FC<IProps> = ({ type, value, activeVest }) => {
  const [progress, setProgress] = useState({ time: 0, bar: 0 });

  useEffect(() => {
    if (activeVest) {
      const timeProgress = getTimeProgress(
        activeVest.start * 1000,
        activeVest.end * 1000
      );

      const barProgress = (100 / 180) * timeProgress;

      setProgress({ time: timeProgress, bar: barProgress });
    }
  }, [activeVest]);

  return (
    <div className="my-12">
      {type === "vestedExit" ? (
        <div className="relative h-16 w-full">
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap text-base font-bold undefined"
            style={{ left: "7.77778%" }}
          >
            Cancel Ends
          </div>
          <div className="absolute right-0 bottom-full -translate-y-0.5 whitespace-nowrap text-base font-bold undefined">
            {Number(value) > 0.0001 ? formatNumber(value, "format") : "0.00"}{" "}
            xSTBL
          </div>
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap text-base font-bold undefined"
            style={{ left: "33.3333%" }}
          >
            {Number(value) > 0.0001
              ? formatNumber(value / 1.5, "format")
              : "0.00"}{" "}
            xSTBL
          </div>
          <div className="bg-accent-900 rounded-2xl relative h-full overflow-hidden">
            <div
              className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
              style={{ left: "7.77778%" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
            </div>
            <div
              className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
              style={{ left: "100%" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
            </div>
            <div
              className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
              style={{ left: "33.3333%" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
            </div>
          </div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark"
            style={{ left: "7.77778%" }}
          >
            14 days
          </div>
          <div className="absolute right-0 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark">
            180 days
          </div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark"
            style={{ left: "33.3333%" }}
          >
            60 days
          </div>
        </div>
      ) : type === "exitVest" ? (
        <div className="relative h-16 w-full">
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap text-base font-bold undefined"
            style={{ left: "7.77778%" }}
          >
            Cancel Ends
          </div>
          <div className="absolute right-0 bottom-full -translate-y-0.5 whitespace-nowrap text-base font-bold undefined">
            {Number(activeVest.amount) > 0.0001
              ? formatNumber(activeVest.amount, "format")
              : "0.00"}
            xSTBL
          </div>
          <div className="bg-accent-900 rounded-2xl relative h-full overflow-hidden">
            <div
              className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
              style={{ left: "7.77778%" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
            </div>
            <div
              className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
              style={{ left: "100%" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
            </div>
            {!activeVest.isFullyExited && (
              <div
                className="absolute h-full w-[4px] -translate-x-1/2 bg-accent-500"
                style={{ left: `${progress.bar}%` }}
              >
                <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent"></div>
              </div>
            )}
          </div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark"
            style={{ left: "7.77778%" }}
          >
            14 days
          </div>
          <div className="absolute right-0 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark">
            180 days
          </div>
          {!activeVest.isFullyExited && (
            <div
              className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-base font-bold text-dark"
              style={{ left: `${progress.bar}%` }}
            >
              {progress.time} days
            </div>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export { VestingTimeline };
