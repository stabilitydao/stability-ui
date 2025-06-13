import { useStore } from "@nanostores/react";

import { formatNumber } from "@utils";

import { connected } from "@store";

import { TextSkeleton, Skeleton } from "@ui";

import { Timer } from "../../ui";

import type { TStakeDashboardData } from "@types";

interface IProps {
  data: TStakeDashboardData;
  isLoaded: boolean;
}

const Dashboard: React.FC<IProps> = ({ data, isLoaded }) => {
  const $connected = useStore(connected);

  return (
    <div className="bg-[#101012] border border-[#23252A] rounded-lg items-center justify-between hidden lg:flex">
      <div className="flex flex-col md:w-1/3 w-full gap-3 p-6 pr-12">
        <div className="flex justify-between items-start py-1 px-2 rounded-lg bg-[#21202d] border border-[#5e4eba]">
          <span className="text-[#E3E4E7] text-[18px] leading-6">
            Total Staked
          </span>

          {isLoaded ? (
            <div className="flex flex-col items-end font-semibold">
              <span className="text-[18px] leading-6">
                {formatNumber(data.totalStaked, "format")} xSTBL
              </span>
              <span className="text-[14px] leading-5">
                ${formatNumber(data.totalStakedInUSD, "format")}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <TextSkeleton lineHeight={24} width={160} />
              <TextSkeleton lineHeight={20} width={80} />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between gap-2 h-full">
          <div className="flex items-center justify-between w-full flex-wrap">
            <span className="text-[18px] leading-6 font-medium text-[#E3E4E7]">
              Your Stake
            </span>
            {$connected ? (
              <>
                {isLoaded ? (
                  <span className="text-[18px] leading-6 font-semibold">
                    {formatNumber(data.userStaked, "format")} xSTBL
                  </span>
                ) : (
                  <div className="hidden md:block">
                    <TextSkeleton lineHeight={24} width={120} />
                  </div>
                )}
              </>
            ) : (
              <span>-</span>
            )}
          </div>
          <div className="flex items-center justify-between w-full flex-wrap">
            <span className="text-[18px] leading-6 font-medium text-[#E3E4E7]">
              Total APR
            </span>
            {isLoaded ? (
              <span className="text-[18px] leading-6 font-semibold">
                {formatNumber(data.APR, "formatAPR")}%
              </span>
            ) : (
              <TextSkeleton lineHeight={24} width={130} />
            )}
          </div>
          <div className="flex items-center justify-between w-full flex-wrap">
            <span className="text-[18px] leading-6 font-medium text-[#E3E4E7]">
              Your estimated profit
            </span>

            {$connected ? (
              <>
                {isLoaded ? (
                  <span className="text-[18px] leading-6 font-semibold">
                    {formatNumber(data.estimatedProfit, "format")} xSTBL
                  </span>
                ) : (
                  <TextSkeleton lineHeight={24} width={130} />
                )}
              </>
            ) : (
              <span>-</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 md:w-2/3 w-full p-6 border-l border-l-[#23252A]">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[24px] leading-8 font-semibold">
            Pending revenue
          </h3>
          {isLoaded ? (
            <Timer end={data.timestamp} />
          ) : (
            <Skeleton height={48} width={130} />
          )}
        </div>

        <div className="flex items-center justify-between flex-col md:flex-row gap-6 w-full">
          <div className="flex items-center justify-between flex-col md:w-1/2 bg-[#1D1E23] border border-[#35363B] rounded-lg py-2 px-3">
            <span className="text-center text-[#97979A] text-[16px] leading-6">
              xSTBL exit penalties (100%)
            </span>
            {isLoaded ? (
              <span className="text-[24px] leading-8 font-semibold">
                ${data.pendingRebase.toFixed(3)}
              </span>
            ) : (
              <TextSkeleton lineHeight={32} width={100} />
            )}

            {isLoaded ? (
              <span className="text-center text-[#97979A] text-[16px] leading-6">
                {formatNumber(data.pendingRebaseInSTBL, "format")} xSTBL
              </span>
            ) : (
              <TextSkeleton lineHeight={24} width={100} />
            )}
          </div>
          <div className="flex items-center justify-between flex-col md:w-1/2 bg-[#1D1E23] border border-[#35363B] rounded-lg py-2 px-3">
            <span className="text-center text-[#97979A] text-[16px] leading-6">
              Vault fees (50%)
            </span>
            {isLoaded ? (
              <span className="text-[24px] leading-8 font-semibold">
                ${data.pendingRevenue.toFixed(3)}
              </span>
            ) : (
              <TextSkeleton lineHeight={32} width={100} />
            )}

            {isLoaded ? (
              <span className="text-center text-[#97979A] text-[16px] leading-6">
                {formatNumber(data.pendingRevenueInSTBL, "format")} xSTBL
              </span>
            ) : (
              <TextSkeleton lineHeight={24} width={100} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
