import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { SupplyForm } from "../Forms/SupplyForm";

import type { TMarketReserve } from "@types";

type TProps = {
  asset: TMarketReserve | undefined;
};

const SupplyTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <SupplyForm asset={asset} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { SupplyTab };
