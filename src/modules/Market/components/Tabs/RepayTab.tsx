// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { RepayForm } from "../Forms/RepayForm";

import type { TMarketReserve, TMarket, TReservesData } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: TReservesData;
  isLoading: boolean;
};

const RepayTab: React.FC<TProps> = ({
  network,
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        network={network}
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
      />
    </div>
  );
};

export { RepayTab };
