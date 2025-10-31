import { useState } from "react";

import { RepayForm } from "../Forms/RepayForm";
import { BasicStats } from "../Stats/BasicStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
};

const RepayTab: React.FC<TProps> = ({ market, activeAsset }) => {
  const [value, setValue] = useState<string>("");
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        market={market}
        activeAsset={activeAsset}
        value={value}
        setValue={setValue}
      />
      <BasicStats
        type={MarketSectionTypes.Repay}
        market={market}
        activeAsset={activeAsset}
        value={value}
      />
    </div>
  );
};

export { RepayTab };
