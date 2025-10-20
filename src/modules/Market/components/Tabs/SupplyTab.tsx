import { useState } from "react";

import { SupplyForm } from "../Forms/SupplyForm";
import { CollateralStats } from "../Stats/CollateralStats";

import {
  TMarketReserve,
  TMarket,
  TReservesData,
  MarketSectionTypes,
} from "@types";

type TProps = {
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: TReservesData;
  isLoading: boolean;
};

const SupplyTab: React.FC<TProps> = ({
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
        value={value}
        setValue={setValue}
      />
      <CollateralStats
        type={MarketSectionTypes.Supply}
        market={market}
        asset={asset}
        assets={assets}
        userData={userData}
        isLoading={isLoading}
        value={value}
      />
    </div>
  );
};

export { SupplyTab };
