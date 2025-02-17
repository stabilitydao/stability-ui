import { memo } from "react";

import { HeadingText } from "@ui";

import type { TLeverageLendingData } from "@types";

interface IProps {
  data: TLeverageLendingData | undefined;
}

const LeverageLending: React.FC<IProps> = memo(({ data }) => {
  return (
    <div className="lg:w-[580px]">
      <HeadingText
        text="Leverage Lending"
        scale={2}
        styles="text-left md:ml-4 md:mb-0 mb-2"
      />
      <div className="md:p-4 flex flex-col gap-5">
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              LEVERAGE
            </p>
            <p className="text-[16px] mt-1">x{data?.leverage?.toFixed(3)}</p>
          </div>
          <div className="w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              SUPPLY APR
            </p>
            <p className="text-[16px] mt-1">{data?.supplyApr?.toFixed(3)}%</p>
          </div>
        </div>
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div className="flex flex-col">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              LTV
            </p>
            <p className="text-[16px] mt-1">{data?.ltv?.toFixed(3)}%</p>
          </div>
          <div className="w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              BORROW APR
            </p>
            <p className="text-[16px] mt-1">{data?.borrowApr?.toFixed(3)}%</p>
          </div>
        </div>
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              MAX LTV
            </p>
            <p className="text-[16px] mt-1">{data?.maxLtv?.toFixed(3)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export { LeverageLending };
