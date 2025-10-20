// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { RepayForm } from "../Forms/RepayForm";

import type { TMarketReserve, TMarket, TReservesData } from "@types";

type TProps = {
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: TReservesData;
  isLoading: boolean;
};

const RepayTab: React.FC<TProps> = ({
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
      />
    </div>
  );
};

export { RepayTab };
