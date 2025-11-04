import { LeverageForm } from "../Forms/LeverageForm";
import { LeveragePositionStats } from "../Stats/LeveragePositionStats";

import { getTokenData } from "@utils";

import type { TMarketReserve, TAddress } from "@types";

type TProps = {
  asset: TMarketReserve | undefined;
};

const LeverageTab: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
        <LeverageForm asset={asset} />
        <LeveragePositionStats asset={asset} />
      </div>

      <div className="flex items-start justify-between gap-6 flex-col lg:flex-row">
        <div className="flex flex-col items-start gap-4 w-full lg:w-1/3">
          <span className="text-[24px] leading-8 font-medium">S details</span>
          <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">S address</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Interest rate model</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Stability</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Max. liquidation fee</span>
              <span className="font-semibold">3%</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 w-full lg:w-1/3">
          <span className="text-[24px] leading-8 font-medium">
            {assetData?.symbol} details
          </span>
          <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">S address</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Interest rate model</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Stability</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Max. liquidation fee</span>
              <span className="font-semibold">3%</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 w-full lg:w-1/3">
          <span className="text-[24px] leading-8 font-medium">
            Market info & risk report
          </span>
          <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Market ID</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Market address</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Deployed at</span>
              <span className="font-semibold">09 Jan, 2025</span>
            </div>
            <div className="w-full flex items-center justify-between">
              <span className="text-[#7C7E81]">Deployer</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">0xE5DA...3955</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <img
                    src="/icons/copy.png"
                    alt="copy link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="text-[#7C7E81] flex items-center gap-2">
                <span>Leverage fee</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">0.0%</span>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="text-[#7C7E81] flex items-center gap-2">
                <span>Protocol fee</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">15.0%</span>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="text-[#7C7E81] flex items-center gap-2">
                <span>Deployer fee</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">0.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LeverageTab };
