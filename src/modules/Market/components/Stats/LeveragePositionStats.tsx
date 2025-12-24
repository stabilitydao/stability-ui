import { QuestionIcon } from "@ui";

import { getTokenData } from "@utils";

import type { TMarketReserve, TAddress } from "@types";

type TProps = {
  asset: TMarketReserve | undefined;
};

const LeveragePositionStats: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex flex-col gap-4 w-full lg:w-2/3">
      <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 flex flex-col items-start justify-between gap-4 md:gap-6 font-medium">
        <div className="flex items-start justify-between flex-wrap md:flex-nowrap gap-0 md:gap-6 w-full">
          <div className="flex flex-col items-start w-1/2 md:w-1/4 mb-4 md:mb-0">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              Supply/Borrow
            </span>
            <span className="text-[24px] leading-8">S/{assetData?.symbol}</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4 mb-4 md:mb-0">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              Total supply S APR
            </span>
            <span className="text-[24px] leading-8">3.7%</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              Borrow {assetData?.symbol} APR
            </span>
            <span className="text-[24px] leading-8">2.0%</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              Max Net APR
            </span>
            <span className="text-[24px] leading-8">-42.2%</span>
          </div>
        </div>
        <div className="flex items-start justify-between flex-wrap md:flex-nowrap gap-0 md:gap-6 w-full">
          <div className="flex flex-col items-start w-1/2 md:w-1/4 mb-4 md:mb-0">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              Available to Borrow
            </span>
            <span className="text-[24px] leading-8">$26.9M</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4 mb-4 md:mb-0">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              mLTV/LT
            </span>
            <span className="text-[24px] leading-8">95.0%/97.0%</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              S oracle
            </span>
            <span className="text-[24px] leading-8">RedStone</span>
          </div>
          <div className="flex flex-col items-start w-1/2 md:w-1/4">
            <span className="text-[#7C7E81] text-[16px] leading-6">
              {assetData?.symbol} oracle
            </span>
            <span className="text-[24px] leading-8">RedStone</span>
          </div>
        </div>
      </div>
      <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col md:flex-row gap-3 md:gap-6 w-full font-medium">
        <div className="w-full md:w-1/2 flex flex-col items-start gap-3">
          <div className="flex items-start justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Sum supply</span>
              <QuestionIcon />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[16px] leading-6">
                <span className="text-[#7C7E81]">0</span>
                <img
                  src="/icons/arrow-right.png"
                  alt="arrow right"
                  className="w-4 h-4"
                />
                <span>100S</span>
              </div>
              <span className="text-[#7C7E81] text-[14px] leading-5">
                $32.84
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Borrowed</span>
              <QuestionIcon />
            </div>
            <span className="font-semibold text-[#7C7E81]">
              0 {assetData?.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Leverage Used</span>
              <QuestionIcon />
            </div>
            <span className="font-semibold">1x</span>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-start gap-3">
          <div className="flex items-start justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Net points</span>
              <QuestionIcon />
            </div>
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-2 text-[16px] leading-6">
                12x Sonic
              </span>

              <span className="text-[#7C7E81] text-[14px] leading-5">
                2x STBL
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Health Factor</span>
              <QuestionIcon />
            </div>
            <span className="font-semibold text-[#7C7E81]">--</span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Net APR</span>
              <QuestionIcon />
            </div>
            <span className="font-semibold">3.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LeveragePositionStats };
