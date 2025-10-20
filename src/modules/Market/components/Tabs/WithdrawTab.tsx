import { useState } from "react";

import { WithdrawForm } from "../Forms/WithdrawForm";
import { CollateralStats } from "../Stats/CollateralStats";

import { TMarketReserve, TMarket, TAddress, MarketSectionTypes } from "@types";

type TProps = {
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: Record<TAddress, string>;
  isLoading: boolean;
};

const WithdrawTab: React.FC<TProps> = ({
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  const [value, setValue] = useState<string>("");
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <WithdrawForm
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
        value={value}
        setValue={setValue}
      />
      <CollateralStats
        type={MarketSectionTypes.Withdraw}
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

export { WithdrawTab };
