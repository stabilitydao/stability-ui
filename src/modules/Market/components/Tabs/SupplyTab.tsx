import { useState } from "react";

import { SupplyForm } from "../Forms/SupplyForm";
import { CollateralStats } from "../Stats/CollateralStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  isLoading: boolean;
};

const SupplyTab: React.FC<TProps> = ({ market, activeAsset, isLoading }) => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
        value={value}
        setValue={setValue}
      />
      <CollateralStats
        type={MarketSectionTypes.Supply}
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
        value={value}
      />
    </div>
  );
};

export { SupplyTab };
