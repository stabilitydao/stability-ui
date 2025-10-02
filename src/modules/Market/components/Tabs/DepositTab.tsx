import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { DepositForm } from "../Forms/DepositForm";

import type { TMarketAsset } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const DepositTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <DepositForm asset={asset} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { DepositTab };
