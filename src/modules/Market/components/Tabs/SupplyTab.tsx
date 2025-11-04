import { useState } from "react";

import { SupplyForm } from "../Forms/SupplyForm";
import { BasicStats } from "../Stats/BasicStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
};

const SupplyTab: React.FC<TProps> = ({ market, activeAsset }) => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm
        market={market}
        activeAsset={activeAsset}
        value={value}
        setValue={setValue}
      />
      <BasicStats
        type={MarketSectionTypes.Supply}
        market={market}
        activeAsset={activeAsset}
        value={value}
      />
    </div>
  );
};

export { SupplyTab };
