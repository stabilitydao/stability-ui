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
    <div>
      {type === "vestedExit" ? (
        <div className="relative w-full my-8">
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap font-semibold text-[12px] md:text-[14px] leading-3 md:leading-4 mb-2"
            style={{ left: "7.77778%" }}
          >
            Cancel Ends
          </div>
          <div className="absolute right-0 bottom-full -translate-y-0.5 whitespace-nowrap font-semibold text-[12px] md:text-[14px] leading-3 md:leading-4 mb-2">
            {Number(value) > 0.0001 ? formatNumber(value, "format") : "0.00"}{" "}
            xSTBL
          </div>
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap font-semibold text-[12px] md:text-[14px] leading-3 md:leading-4 mb-2"
            style={{ left: "33.3333%" }}
          >
            {Number(value) > 0.0001
              ? formatNumber(value / 1.5, "format")
              : "0.00"}{" "}
            xSTBL
          </div>
          <div
            className="rounded-full relative h-2 overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, #FFF -12.56%, #5E6AD2 22.03%, #1B1D21 57.89%)",
            }}
          ></div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium"
            style={{ left: "7.77778%" }}
          >
            <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
            <span>14 days</span>
          </div>
          <div className="absolute right-0 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium">
            <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
            <span>180 days</span>
          </div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium"
            style={{ left: "33.3333%" }}
          >
            <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
            <span>60 days</span>
          </div>
        </div>
      ) : type === "exitVest" ? (
        <div className="relative w-full mt-8 mb-12">
          <div
            className="absolute -translate-x-1/2 bottom-full -translate-y-0.5 whitespace-nowrap font-semibold text-[14px] leading-4 mb-2"
            style={{ left: "7.77778%" }}
          >
            Cancel Ends
          </div>
          <div className="absolute right-0 bottom-full -translate-y-0.5 whitespace-nowrap font-semibold text-[14px] leading-4 mb-2">
            {Number(activeVest.amount) > 0.0001
              ? formatNumber(activeVest.amount, "format")
              : "0.00"}
            xSTBL
          </div>
          <div
            className="rounded-full relative h-2 overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, #FFF -12.56%, #5E6AD2 22.03%, #1B1D21 57.89%)",
            }}
          ></div>
          <div
            className="absolute -translate-x-1/2 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium"
            style={{ left: "7.77778%" }}
          >
            <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
            <span>14 days</span>
          </div>
          <div className="absolute right-0 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium">
            <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
            <span>180 days</span>
          </div>
          {!activeVest.isFullyExited && (
            <div
              className="absolute right-0 top-full translate-y-1 whitespace-nowrap text-[#97979A] text-[14px] leading-4 font-medium"
              style={{ left: `${progress.bar}%` }}
            >
              <span className="block h-4 w-[1px] bg-[#23252A] mb-1"></span>
              <span> {progress.time} days</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export { VestingTimeline };
