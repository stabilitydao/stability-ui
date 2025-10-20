// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketReserve, TMarket } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  isLoading: boolean;
};

const BorrowTab: React.FC<TProps> = ({ market, activeAsset, isLoading }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm
        market={market}
        activeAsset={activeAsset}
        isLoading={isLoading}
      />
      {/* <BasicPositionStats asset={asset} /> */}
    </div>
  );
};

export { BorrowTab };
