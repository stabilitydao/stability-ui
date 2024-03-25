import { memo } from "react";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const YieldBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div>
      <div className="flex justify-between items-center h-[60px]">
        <h2 className="text-[28px] text-start ml-4">Yield rates</h2>
      </div>
      <div className="p-4">
        {!!vault?.earningData && (
          <table className="table table-auto w-full rounded-lg">
            <thead className="bg-[#0b0e11]">
              <tr className="text-[18px] md:text-[16px] lg:text-[20px] text-[#8f8f8f] uppercase">
                <th></th>
                <th>Latest</th>
                <th>24h</th>
                <th>Week</th>
              </tr>
            </thead>
            <tbody className="text-[14px] min-[450px]:text-[16px] md:text-[14px] lg:text-[20px]">
              <tr className="hover:bg-[#2B3139]">
                <td>Total APY</td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.latest}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.weekly}%
                </td>
              </tr>
              <tr className="hover:bg-[#2B3139]">
                <td>Total APR</td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.latest}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.weekly}%
                </td>
              </tr>
              {vault.strategyInfo.shortName != "CF" && (
                <tr className="hover:bg-[#2B3139]">
                  <td>Pool swap fees APR</td>

                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.latest}%
                  </td>
                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.daily}%
                  </td>
                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.weekly}%
                  </td>
                </tr>
              )}
              <tr className="hover:bg-[#2B3139]">
                {vault.strategyInfo.shortName === "CF" ? (
                  <td>Strategy APR</td>
                ) : (
                  <td>Farm APR</td>
                )}
                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.latest}%
                </td>

                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.weekly}%
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

export { YieldBar };
