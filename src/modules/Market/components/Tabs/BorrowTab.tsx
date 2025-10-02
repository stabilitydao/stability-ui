import { BasicPositionStats } from "../Stats/BasicPositionStats";
import { BorrowForm } from "../Forms/BorrowForm";

import type { TMarketAsset } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const BorrowTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <BorrowForm asset={asset} />
      <BasicPositionStats asset={asset} />
    </div>
  );
};

export { BorrowTab };
