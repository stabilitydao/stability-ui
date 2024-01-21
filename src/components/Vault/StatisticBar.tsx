import { memo } from "react";

import { VaultType } from "@components";

import { formatNumber, formatFromBigInt } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const StatisticBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="flex flex-wrap justify-between items-center bg-button p-4 rounded-md md:h-[80px] mt-[-40px] md:mt-0">
      <VaultType type={vault.type} />
      <div>
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">TVL</p>
        <p>
          {formatNumber(
            formatFromBigInt(vault.tvl, 18, "withFloor"),
            "abbreviate"
          )}
        </p>
      </div>
      <div>
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
          APR / APY
        </p>
        <p>
          {vault.apr} / {vault.apy}%
        </p>
      </div>
      <div className="hidden lg:block">
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">Daily</p>
        <p>{vault.daily}%</p>
      </div>
      <div>
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
          SHARE PRICE
        </p>
        <p>${formatFromBigInt(vault.shareprice, 18, "withDecimals")}</p>
      </div>
    </div>
  );
});

export { StatisticBar };
