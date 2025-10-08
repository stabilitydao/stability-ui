import { AssetsInfo } from "../../ui";

import type { TMarket, TMarketReserve } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
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
            <span className="font-semibold">{market?.marketId}</span>
          </div>
          {/* <AddressField
            symbol="Market"
            address="0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"
            explorer={market.network.explorer}
          /> */}

          <div className="w-full flex items-center justify-between">
            <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
              Deployed
            </span>
            <span className="font-semibold">{market?.deployed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InformationTab };
