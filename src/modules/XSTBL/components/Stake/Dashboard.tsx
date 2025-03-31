import { formatNumber } from "@utils";

import { Timer } from "../../ui";

import type { TStakeDashboardData } from "@types";

interface IProps {
  data: TStakeDashboardData;
}

const Dashboard: React.FC<IProps> = ({ data }) => {
  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex justify-center md:justify-between gap-5 flex-col md:flex-row md:h-[300px]">
      <div className="flex flex-col items-center justify-center STBL md:w-1/2 w-full">
        <h3 className="text-[30px] font-bold">Pending revenue</h3>
        <div className="flex items-center justify-between w-full px-3">
          <div className="flex items-center justify-between flex-col">
            <span className="text-[22px] lg:text-[26px] font-bold">
              xSTBL exit penalties (100%)
            </span>
            <span className="text-[40px]">
              ${data.pendingRebase.toFixed(3)}
            </span>
            <span className="text-[18px] opacity-50">
              {formatNumber(data.pendingRebaseInSTBL, "format")} xSTBL
            </span>
          </div>
          <div className="flex items-center justify-between flex-col">
            <span className="text-[22px] lg:text-[26px] font-bold">
              Vault fees (50%)
            </span>
            <span className="text-[40px]">
              ${data.pendingRevenue.toFixed(3)}
            </span>
            <span className="text-[18px] opacity-50">
              {formatNumber(data.pendingRevenueInSTBL, "format")} xSTBL
            </span>
          </div>
        </div>

        <span className="text-[22px]">
          distributed in <Timer end={data.timestamp} />
        </span>
      </div>
      <div className="flex flex-col md:w-1/2 w-full gap-5">
        <div className="flex justify-between items-center p-3 rounded-2xl bg-accent-900">
          <span>Total Staked</span>
          <span>
            {formatNumber(data.totalStaked, "format")} xSTBL | $
            {formatNumber(data.totalStakedInUSD, "format")}
          </span>
        </div>
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-accent-900 h-full">
          <div className="flex items-center justify-between w-full">
            <span>Your Stake</span>
            <span>
              {formatNumber(data.userStaked, "format")} xSTBL | $
              {formatNumber(data.userStakedInUSD, "format")}
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Total APR</span>
            <span>{formatNumber(data.APR, "formatAPR")}%</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Your estimated profit</span>
            <span>
              {formatNumber(data.estimatedProfit, "format")} xSTBL | $
              {formatNumber(data.estimatedProfitInUSD, "format")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
