// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketReserve, TMarket, TAddress } from "@types";

type TProps = {
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: Record<TAddress, string>;
  isLoading: boolean;
};

const BorrowTab: React.FC<TProps> = ({
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
      />
      {/* <BasicPositionStats asset={asset} /> */}
    </div>
  );
};

export { BorrowTab };
