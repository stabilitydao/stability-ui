import { useStore } from "@nanostores/react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

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
  const showChart = false;

  const $connected = useStore(connected);

  const { open } = useWeb3Modal();

  return (
    <div className="flex flex-col gap-[28px]">
      <div className="flex items-stretch gap-3 flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Pending APR
            </span>
            {isLoaded ? (
              <span className="text-[#48C05C] text-[32px] leading-10 font-semibold">
                +{formatNumber(data.APR, "formatAPR")}%
              </span>
            ) : (
              <TextSkeleton lineHeight={40} width={160} />
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Total xSTBL
            </span>
            {isLoaded ? (
              <div className="flex flex-col items-center">
                <span className="text-[32px] leading-10 font-semibold">
                  {formatNumber(data.totalStaked, "format")}
                </span>
                <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                  ~ ${formatNumber(data.totalStakedInUSD, "format")}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <TextSkeleton lineHeight={40} width={160} />
                <TextSkeleton lineHeight={24} width={80} />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[#97979A] text-[16px] leading-6 font-medium">
              Your stake
            </span>

            {isLoaded ? (
              <>
                {$connected ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] leading-10 font-semibold">
                      {formatNumber(data.userStaked, "format")}
                    </span>
                    <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                      ~ ${formatNumber(data.userStakedInUSD, "format")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-[16px] leading-6 font-semibold">
                      You haven't connected your wallet
                    </span>
                    <button
                      className="text-[14px] leading-5 font-semibold px-4 py-2 rounded-[10px] border border-[#9180F4] bg-[linear-gradient(340deg,_#5B63D3_17.51%,_#9180F4_100%)]"
                      onClick={() => open()}
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center">
                <TextSkeleton lineHeight={40} width={160} />
                <TextSkeleton lineHeight={24} width={80} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
          <h3 className="text-[32px] leading-40 font-semibold">
            Sonic Generator
          </h3>
          {isLoaded ? (
            <Timer end={data.timestamp} />
          ) : (
            <Skeleton height={48} width={130} />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              showChart ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Lending fees
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">25%</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>

                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(data.lendingFeesXSTBL, "format")} xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${data.lendingFeesUSD.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Agents
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">50%</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>
                  <span className="font-semibold">0 xSTBL</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  <span className="font-semibold">$0</span>
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                PWP Rewards
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">100%</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(data.pendingRebaseInSTBL, "format")} xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${data.pendingRebase.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-full p-4 bg-[#101012] border border-[#23252A] rounded-xl flex flex-col gap-2">
              <span className="text-[18px] leading-6 font-semibold">
                Vault fees
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Revenue share</span>
                  <span className="font-semibold">50%</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in xSTBL</span>

                  {isLoaded ? (
                    <span className="font-semibold">
                      {formatNumber(data.pendingRevenueInSTBL, "format")} xSTBL
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[16px] leading-6 font-medium">
                  <span className="text-[#97979A]">Earned in $</span>
                  {isLoaded ? (
                    <span className="font-semibold">
                      ${data.pendingRevenue.toFixed(3)}
                    </span>
                  ) : (
                    <TextSkeleton lineHeight={24} width={100} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {showChart && (
            <div className="bg-[#101012] rounded-lg p-4 flex items-center justify-center">
              <h3>Chart</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
