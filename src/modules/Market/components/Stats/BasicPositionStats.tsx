import { getTokenData } from "@utils";

import type { TMarketAsset, TAddress } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const BasicPositionStats: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex flex-col gap-4 w-full lg:w-2/3">
      <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 flex items-start justify-between flex-col md:flex-row gap-4 md:gap-6 font-medium">
        <div className="flex flex-col items-start w-full md:w-1/3">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Deposited
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">0</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>100 {assetData?.symbol}</span>
          </div>
          <span className="text-[#7C7E81] text-[14px] leading-5">$32.84</span>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/3">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Supply APR
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>4.7%</span>
          </div>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/3">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            APR state
          </span>
          <span className="text-[24px] leading-8">Stable rate</span>
        </div>
      </div>
      <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col md:flex-row gap-2 md:gap-6 w-full font-medium">
        <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Utilization</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">32%</span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>IRM</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">Dynamic IRM</span>
          </div>

          <div className="flex items-start justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>{assetData?.symbol} TVL</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="font-semibold">122.4m {assetData?.symbol}</span>
              <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                $39.8m
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Oracle</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">Red Stone</span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Max LTV</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">95%</span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Liquidation threshold</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">97%</span>
          </div>
          <div className="flex items-center justify-between text-[16px] leading-6 w-full">
            <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
              <span>Liquidation fee</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">2.5%</span>
          </div>
        </div>
      </div>
      <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 flex items-start justify-between gap-4 md:gap-6 font-medium">
        <div className="flex items-center justify-between gap-2 md:gap-0 text-[14px] leading-5 md:text-[16px] md:leading-6 md:w-1/2">
          <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
            <span className="whitespace-nowrap">Protocol fee</span>
            <img
              src="/icons/circle_question.png"
              alt="Question icon"
              className="w-4 h-4"
            />
          </div>
          <span className="font-semibold">15%</span>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-0 text-[14px] leading-5 md:text-[16px] md:leading-6 md:w-1/2">
          <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
            <span className="whitespace-nowrap">Deployer fee</span>
            <img
              src="/icons/circle_question.png"
              alt="Question icon"
              className="w-4 h-4"
            />
          </div>
          <span className="font-semibold">0%</span>
        </div>
      </div>
    </div>
  );
};

export { BasicPositionStats };
