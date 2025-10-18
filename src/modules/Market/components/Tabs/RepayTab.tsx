// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { RepayForm } from "../Forms/RepayForm";

import type { TMarketReserve, TMarket, TReservesData } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: TReservesData;
};

const RepayTab: React.FC<TProps> = ({
  network,
  market,
  asset,
  assets,
  userData,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <RepayForm
        network={network}
        market={market}
        asset={asset}
        userData={userData}
      />
    </div>
  );
};

export { RepayTab };
