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
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between items-start w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              LEVERAGE
            </p>
            <p className="text-[16px] mt-1">{data?.leverage}%</p>
          </div>
          <div className="sm:w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              SUPPLY APR
            </p>
            <p className="text-[16px] mt-1">{data?.supplyApr}%</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 items-start justify-between w-full">
          <div className="flex flex-col">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              LTV
            </p>
            <p className="text-[16px] mt-1">{data?.ltv}%</p>
          </div>
          <div className="sm:w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              BORROW APR
            </p>
            <p className="text-[16px] mt-1">{data?.borrowApr}%</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              MAX LTV
            </p>
            <p className="text-[16px] mt-1">{data?.maxLtv}%</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export { LeverageLending };
