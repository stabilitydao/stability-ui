// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketReserve, TMarket } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const BorrowTab: React.FC<TProps> = ({ network, market, asset, assets }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm
        network={network}
        market={market}
        asset={asset}
        assets={assets}
      />
      {/* <BasicPositionStats asset={asset} /> */}
    </div>
  );
};

export { BorrowTab };
