import { useState } from "react";

import { BorrowForm } from "../Forms/BorrowForm";
import { BasicStats } from "../Stats/BasicStats";

import { TMarketReserve, TMarket, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
};

const BorrowTab: React.FC<TProps> = ({ market, activeAsset }) => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm
        market={market}
        activeAsset={activeAsset}
        value={value}
        setValue={setValue}
      />
      <BasicStats
        type={MarketSectionTypes.Borrow}
        market={market}
        activeAsset={activeAsset}
        value={value}
      />
    </div>
  );
};

export { BorrowTab };
