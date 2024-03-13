import { memo } from "react";

import { formatFromBigInt, formatNumber } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="bg-button rounded-md">
      <div className="flex flex-wrap justify-between gap-2 md:gap-0 items-center p-4 md:h-[80px] mt-[-40px] md:mt-0">
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            TVL
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            {formatNumber(
              formatFromBigInt(vault.tvl, 18, "withFloor"),
              "abbreviate"
            )}
          </p>
        </div>
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            SHARE PRICE
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
          </p>
        </div>
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            APR / APY
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            {vault?.earningData?.apr?.withFees?.latest}% /{" "}
            {vault?.earningData?.apy?.withFees?.latest}%
          </p>
        </div>
      </div>
      <div className="flex justify-between flex-wrap items-center px-5 py-2 md:py-4 md:h-[80px] mt-3">
        <div className="flex items-center gap-5">
          <div className="flex flex-col my-2 md:my-0">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
              Your Balance
            </p>
            <div className="text-[20px] h-8 flex">
              <p className="mr-1">
                {formatNumber(
                  formatFromBigInt(vault.balance, 18).toFixed(5),
                  "format"
                )}
              </p>
              <p className="whitespace-nowrap md:hidden lg:block">
                / $
                {formatNumber(
                  (
                    formatFromBigInt(vault.shareprice, 18, "withDecimals") *
                    Number(formatFromBigInt(vault.balance, 18, "withDecimals"))
                  ).toFixed(2),
                  "format"
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col my-2 md:my-0">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
              Daily
            </p>
            <p>{vault.daily}%</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export { InfoBar };
