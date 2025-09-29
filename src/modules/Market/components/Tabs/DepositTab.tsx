import { BasicPositionStats } from "../BasicPositionStats";
import { DepositForm } from "../Forms/DepositForm";

import type { TMarketAsset } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const DepositTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start gap-6">
      <DepositForm asset={asset} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { DepositTab };
