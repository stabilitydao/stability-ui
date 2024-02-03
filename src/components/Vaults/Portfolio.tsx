import { memo } from "react";

import { useStore } from "@nanostores/react";
import { visible, platformVersion } from "@store";

import { formatNumber } from "@utils";

import type { TPortfolio } from "@types";

interface IProps {
  data: TPortfolio;
}

const Portfolio: React.FC<IProps> = memo(({ data }) => {
  const $visible = useStore(visible);
  const $platformVersion = useStore(platformVersion);

  return (
    <div className="my-2 rounded-sm">
      <div className="p-2">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[1.5rem] font-medium">Portfolio</h3>
            <div className="cursor-pointer">
              {!$visible && (
                <svg
                  onClick={() => visible.set(true)}
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.1284 10.9464C19.7566 9.30323 20.75 7.75 20.75 7.75C20.75 7.75 16.2728 0.75 10.75 0.75C9.92433 0.75 9.12203 0.906455 8.35456 1.17258M3.81066 0.75L18.3063 15.2457M0.75 7.75C0.75 7.75 2.68788 4.72014 5.58647 2.64713L15.8426 12.9033C14.351 13.9562 12.6098 14.75 10.75 14.75C5.22715 14.75 0.75 7.75 0.75 7.75ZM10.75 11.75C8.54086 11.75 6.75 9.95909 6.75 7.74995C6.75 6.7355 7.12764 5.80926 7.75 5.10413L13.6104 10.5461C12.8841 11.2889 11.8709 11.75 10.75 11.75Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {$visible && (
                <svg
                  onClick={() => visible.set(false)}
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 8C21 8 16.5228 15 11 15C5.47715 15 1 8 1 8C1 8 5.47715 1 11 1C16.5228 1 21 8 21 8Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <p className="text-end w-full text-[1rem] lg:block hidden font-bold">
            Stability Platform {$platformVersion}
          </p>
        </div>
        <div className="flex items-center justify-between flex-wrap lg:flex-nowrap gap-3 mt-[6px]">
          <div className="flex items-center justify-center md:justify-start gap-5 flex-wrap whitespace-nowrap w-full">
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                DEPOSITED
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible
                  ? `$${formatNumber(data.deposited, "format")}`
                  : "****"}
              </p>
            </div>
            <div className="w-[120px] md:w-[180px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                DAILY YIELD
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible
                  ? `$${formatNumber(data.dailySum, "format")} / ${formatNumber(
                      data.dailyPercent,
                      "format"
                    )}%`
                  : "****"}
              </p>
            </div>
            <div className="max-w-[130px] w-full md:max-w-[150px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                MONTHLY YIELD
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible
                  ? `$${formatNumber(data.monthly, "format")} / ${formatNumber(
                      data.monthPercent,
                      "format"
                    )}%`
                  : "****"}
              </p>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                AVG. APR
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? `${formatNumber(data.apr, "format")}%` : "****"}
              </p>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                AVG. APY
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? `${formatNumber(data.apy, "format")}%` : "****"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[1rem] text-end font-bold lg:hidden block">
              Stability Platform {$platformVersion}
            </p>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start lg:items-end">
              <h2 className="text-[14px] md:text-[1rem] md:font-medium select-none leading-3 text-[#8D8E96]">
                TVL
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">{data.tvl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { Portfolio };
