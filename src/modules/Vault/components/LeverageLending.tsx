import { memo } from "react";

import { HeadingText } from "@ui";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const LeverageLending: React.FC<IProps> = memo(({ vault }) => {
  const supplyAPRComponent = (
    <div className="w-1/2">
      <p className="font-medium leading-5 text-[#97979A] text-[14px]">
        SUPPLY APR
      </p>
      <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
        {vault?.leverageLending?.supplyApr?.toFixed(3)}%
      </p>
    </div>
  );

  const borrowAPRComponent = (
    <div className="w-1/2">
      <p className="font-medium leading-5 text-[#97979A] text-[14px]">
        BORROW APR
      </p>
      <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
        {vault?.leverageLending?.borrowApr?.toFixed(3)}%
      </p>
    </div>
  );

  return (
    <div className="w-full md:w-1/2">
      <HeadingText text="Leverage Lending" scale={2} styles="text-left mb-4" />
      <div className="flex flex-col items-start gap-4 p-6 bg-[#101012] rounded-lg border border-[#23252A]">
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              LEVERAGE
            </p>
            <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
              x{vault?.leverageLending?.leverage?.toFixed(3)}
            </p>
          </div>
          {!!vault?.assetAPR ? (
            <div className="w-1/2">
              <p className="font-medium leading-5 text-[#97979A] text-[14px]">
                {vault?.assets?.[0]?.symbol} APR
              </p>
              <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
                {vault?.assetAPR?.toFixed(3)}%
              </p>
            </div>
          ) : (
            supplyAPRComponent
          )}
        </div>
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div className="flex flex-col">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              LTV
            </p>
            <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
              {vault?.leverageLending?.ltv?.toFixed(3)}%
            </p>
          </div>
          {!!vault?.assetAPR ? supplyAPRComponent : borrowAPRComponent}
        </div>
        <div className="flex gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              MAX LTV
            </p>
            <p className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
              {vault?.leverageLending?.maxLtv?.toFixed(3)}%
            </p>
          </div>
          {!!vault?.assetAPR && borrowAPRComponent}
        </div>
      </div>
    </div>
  );
});

export { LeverageLending };
