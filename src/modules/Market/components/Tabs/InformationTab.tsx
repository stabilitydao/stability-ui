import { AssetsInfo, AddressField } from "../../ui";

import type { TMarket, TMarketAsset } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketAsset | undefined;
  assets: TMarketAsset[] | undefined;
};

const InformationTab: React.FC<TProps> = ({ market, activeAsset, assets }) => {
  return (
    <div className="flex flex-col gap-6">
      <AssetsInfo
        activeAsset={activeAsset}
        assets={assets}
        network={market.network}
      />
      <div className="flex flex-col gap-3">
        <span className="text-[24px] leading-8 font-medium">
          Overall details
        </span>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-[#7C7E81]">Market ID</span>
            <span className="font-semibold">3</span>
          </div>
          <AddressField
            symbol="Market"
            address="0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"
            explorer={market.network.explorer}
          />
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Reviewed</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">Yes</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Deployed</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">January 9, 2025</span>
          </div>
          <AddressField
            symbol="Deployer"
            address="0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"
            explorer={market.network.explorer}
          />
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Protocol fee</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">15%</span>
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
            <span className="font-semibold">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InformationTab };
