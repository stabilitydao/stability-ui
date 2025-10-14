import { SupplyForm } from "../Forms/SupplyForm";
// import { SupplyStats } from "../Stats/SupplyStats";

import type { TMarketReserve, TMarket } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const SupplyTab: React.FC<TProps> = ({ network, market, asset, assets }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm
        network={network}
        market={market}
        asset={asset}
        assets={assets}
      />
      {/* <SupplyStats
        network={network}
        market={market}
        asset={asset}
        assets={assets}
      /> */}
    </div>
  );
};

export { SupplyTab };
