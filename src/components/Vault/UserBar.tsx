import { memo } from "react";

import { formatFromBigInt, formatNumber } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const UserBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="flex justify-between flex-wrap items-center bg-button px-5 py-2 md:py-4 rounded-md md:h-[80px] mt-5">
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
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">Daily</p>
        <p>{vault.daily}%</p>
      </div>
    </div>
  );
});

export { UserBar };
