import { useStore } from "@nanostores/react";

import { formatNumber } from "@utils";

import { connected } from "@store";

import { Skeleton } from "@ui";

import { Timer } from "../../ui";

import type { TStakeDashboardData } from "@types";

interface IProps {
  data: TStakeDashboardData;
}

const Dashboard: React.FC<IProps> = ({ data }) => {
  const $connected = useStore(connected);

  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex justify-center md:justify-between gap-5 flex-col md:flex-row md:h-[300px]">
      <div className="flex flex-col items-center justify-center STBL md:w-1/2 w-full">
        <h3 className="text-[30px] font-bold">Pending revenue</h3>
        <div className="flex items-center justify-between flex-col md:flex-row w-full px-3">
          <div className="flex items-center justify-between flex-col">
            <span className="text-[18px] lg:text-[20px] font-bold text-center">
              xSTBL exit penalties (100%)
            </span>
            {data.isDataLoaded ? (
              <span className="text-[28px] lg:text-[40px]">
                ${data.pendingRebase.toFixed(3)}
              </span>
            ) : (
              <div className="mb-2">
                <Skeleton height={64} width={100} />
              </div>
            )}

            {data.isDataLoaded ? (
              <span className="text-[18px] opacity-50">
                {formatNumber(data.pendingRebaseInSTBL, "format")} xSTBL
              </span>
            ) : (
              <Skeleton height={28} width={100} />
            )}
          </div>
          <div className="flex items-center justify-between flex-col">
            <span className="text-[18px] lg:text-[20px] font-bold text-center">
              Vault fees (50%)
            </span>
            {data.isDataLoaded ? (
              <span className="text-[28px] lg:text-[40px]">
                ${data.pendingRevenue.toFixed(3)}
              </span>
            ) : (
              <div className="mb-2">
                <Skeleton height={64} width={100} />
              </div>
            )}

            {data.isDataLoaded ? (
              <span className="text-[18px] opacity-50">
                {formatNumber(data.pendingRevenueInSTBL, "format")} xSTBL
              </span>
            ) : (
              <Skeleton height={28} width={100} />
            )}
          </div>
        </div>

        {data.isDataLoaded ? (
          <span className="text-[22px]">
            distributed in <Timer end={data.timestamp} />
          </span>
        ) : (
          <Skeleton height={32} width={130} />
        )}
      </div>
      <div className="flex flex-col md:w-1/2 w-full gap-5">
        <div className="flex justify-between items-center p-3 rounded-2xl bg-accent-900 flex-wrap">
          <span>Total Staked</span>
          {data.isDataLoaded ? (
            <span className="text-[18px] lg:text-[20px]">
              {formatNumber(data.totalStaked, "format")} xSTBL | $
              {formatNumber(data.totalStakedInUSD, "format")}
            </span>
          ) : (
            <Skeleton height={32} width={130} />
          )}
        </div>
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-accent-900 h-full">
          <div className="flex items-center justify-between w-full flex-wrap">
            <span>Your Stake</span>
            {$connected ? (
              <>
                {data.isDataLoaded ? (
                  <span className="text-[18px] lg:text-[20px]">
                    {formatNumber(data.userStaked, "format")} xSTBL | $
                    {formatNumber(data.userStakedInUSD, "format")}
                  </span>
                ) : (
                  <Skeleton height={32} width={130} />
                )}
              </>
            ) : (
              <span>-</span>
            )}
          </div>
          <div className="flex items-center justify-between w-full flex-wrap">
            <span>Total APR</span>
            {data.isDataLoaded ? (
              <span className="text-[18px] lg:text-[20px]">
                {formatNumber(data.APR, "formatAPR")}%
              </span>
            ) : (
              <Skeleton height={32} width={130} />
            )}
          </div>
          <div className="flex items-center justify-between w-full flex-wrap">
            <span>Your estimated profit</span>

            {$connected ? (
              <>
                {" "}
                {data.isDataLoaded ? (
                  <span className="text-[18px] lg:text-[20px]">
                    {formatNumber(data.estimatedProfit, "format")} xSTBL | $
                    {formatNumber(data.estimatedProfitInUSD, "format")}
                  </span>
                ) : (
                  <Skeleton height={32} width={130} />
                )}
              </>
            ) : (
              <span>-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
