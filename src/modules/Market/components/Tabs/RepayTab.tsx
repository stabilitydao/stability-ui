// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { RepayForm } from "../Forms/RepayForm";

import type { TMarketReserve, TMarket } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const RepayTab: React.FC<TProps> = ({ network, market, asset, assets }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        network={network}
        market={market}
        asset={asset}
        assets={assets}
      />
    </div>
  );
};

export { RepayTab };
