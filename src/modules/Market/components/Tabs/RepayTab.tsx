// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { RepayForm } from "../Forms/RepayForm";

import type { TMarketReserve, TMarket } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  isLoading: boolean;
};

const RepayTab: React.FC<TProps> = ({ market, activeAsset, isLoading }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
      />
    </div>
  );
};

export { RepayTab };
