import { formatNumber } from "@utils";

import type { TMarketReserve } from "@types";

interface IProps {
  asset: TMarketReserve;
}

const UtilizationTooltip: React.FC<IProps> = ({ asset }) => {
  return (
    <div className="flex flex-col gap-2 items-start w-full text-[16px] leading-5">
      <div className="flex items-center justify-between gap-5 w-full">
        <span className="text-[#97979A]">Supplied</span>
        <span className="font-semibold">
          {formatNumber(asset?.supplyTVLInUSD, "abbreviate")}
        </span>
      </div>
      <div className="flex items-center justify-between gap-5 w-full">
        <span className="text-[#97979A]">Borrowed</span>
        <span className="font-semibold">
          {formatNumber(asset?.borrowTVLInUSD, "abbreviate")}
        </span>
      </div>
      <div className="flex items-center justify-between gap-5 w-full">
        <span className="text-[#97979A]">Available to borrow</span>
        <span className="font-semibold">
          {formatNumber(asset?.availableToBorrowInUSD, "abbreviate")}
        </span>
      </div>
    </div>
  );
};

export { UtilizationTooltip };
