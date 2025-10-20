import { useState } from "react";

import { WithdrawForm } from "../Forms/WithdrawForm";
import { CollateralStats } from "../Stats/CollateralStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  isLoading: boolean;
};

const WithdrawTab: React.FC<TProps> = ({ market, activeAsset, isLoading }) => {
  const [value, setValue] = useState<string>("");
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <WithdrawForm
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
        value={value}
        setValue={setValue}
      />
      <CollateralStats
        type={MarketSectionTypes.Withdraw}
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
        value={value}
      />
    </div>
  );
};

export { WithdrawTab };
