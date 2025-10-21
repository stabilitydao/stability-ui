import { useState } from "react";

import { WithdrawForm } from "../Forms/WithdrawForm";
import { BasicStats } from "../Stats/BasicStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
};

const WithdrawTab: React.FC<TProps> = ({ market, activeAsset }) => {
  const [value, setValue] = useState<string>("");
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <WithdrawForm
        market={market}
        activeAsset={activeAsset}
        value={value}
        setValue={setValue}
      />
      <BasicStats
        type={MarketSectionTypes.Withdraw}
        market={market}
        activeAsset={activeAsset}
        value={value}
      />
    </div>
  );
};

export { WithdrawTab };
