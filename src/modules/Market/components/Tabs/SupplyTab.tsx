import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { SupplyForm } from "../Forms/SupplyForm";

import type { TMarketReserve } from "@types";

type TProps = {
  network: string;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const SupplyTab: React.FC<TProps> = ({ network, asset, assets }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm network={network} asset={asset} assets={assets} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { SupplyTab };
