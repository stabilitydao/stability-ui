import { BasicPositionStats } from "../BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketAsset } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const BorrowTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start gap-6">
      <BorrowForm asset={asset} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { BorrowTab };
