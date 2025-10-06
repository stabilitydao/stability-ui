import { CustomTooltip } from "@ui";

import { AssetsInfo } from "../../ui";

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
            <span className="font-semibold">{market.name}</span>
          </div>
          {/* <AddressField
            symbol="Market"
            address="0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"
            explorer={market.network.explorer}
          /> */}

          <div className="w-full flex items-center justify-between">
            <CustomTooltip
              name="Deployed"
              description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus necessitatibus cumque sit obcaecati mollitia voluptas nostrum fugit, dignissimos rem ut veritatis assumenda hic? Ratione odio, numquam nihil incidunt suscipit rerum.
                              Soluta sit repudiandae aut corporis vel obcaecati aperiam necessitatibus dicta, dolore recusandae, eligendi iure quidem nisi ex quis accusamus sunt. Eligendi atque laborum enim dolore totam voluptatum ipsam ab minima?"
            />
            <span className="font-semibold">{market.deployed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InformationTab };
