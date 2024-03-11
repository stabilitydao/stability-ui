import { memo } from "react";

import { formatNumber, formatFromBigInt } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const StatisticBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="flex flex-wrap justify-between gap-2 md:gap-0 items-center bg-button p-4 rounded-md md:h-[80px] mt-[-40px] md:mt-0">
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
  );
});

export { StatisticBar };
