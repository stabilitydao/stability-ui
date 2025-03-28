import { formatNumber } from "@utils";

import type { TStakeDashboardData } from "@types";

interface IProps {
  data: TStakeDashboardData;
}

const Dashboard: React.FC<IProps> = ({ data }) => {
  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex justify-center md:justify-between gap-5 flex-col md:flex-row md:h-[300px]">
      <div className="flex flex-col items-center justify-center STBL md:w-1/2 w-full">
        <span className="text-[22px] lg:text-[32px] font-bold">
          Outstanding Pending Rebase
        </span>
        <span className="text-[60px]">${data.pendingRebase.toFixed(3)}</span>
        <span className="text-[22px]">distributed in 01:14:17:47</span>
        <span className="text-[18px] opacity-50">
          {formatNumber(data.pendingRebaseInSTBL, "format")} xSTBL
        </span>
      </div>
      <div className="flex flex-col md:w-1/2 w-full gap-5">
        <div className="flex justify-between items-center p-3 rounded-2xl bg-accent-900">
          <span>Total Staked</span>
          <span>{formatNumber(data.totalStaked, "format")} xSTBL</span>
        </div>
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-accent-900 h-full">
          <div className="flex items-center justify-between w-full">
            <span>Your Stake</span>
            <span>{formatNumber(data.userStaked, "format")} xSTBL</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Rebase APR</span>
            <span>-%</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Your estimated rebase</span>
            <span>0 xSTBL</span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span>Pending revenue</span>
            <span>${data.pendingRevenue.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
