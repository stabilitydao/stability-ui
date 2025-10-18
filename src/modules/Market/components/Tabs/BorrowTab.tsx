// import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketReserve, TMarket, TAddress } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: Record<TAddress, string>;
};

const BorrowTab: React.FC<TProps> = ({
  network,
  market,
  asset,
  assets,
  userData,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm
        network={network}
        market={market}
        asset={asset}
        userData={userData}
      />
      {/* <BasicPositionStats asset={asset} /> */}
    </div>
  );
};

export { BorrowTab };
