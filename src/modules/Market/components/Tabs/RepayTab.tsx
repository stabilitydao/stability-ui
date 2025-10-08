// import { BasicPositionStats } from "../Stats/BasicPositionStats";
// import { DepositForm } from "../Forms/DepositForm";

import type { TMarketReserve } from "@types";

type TProps = {
  asset: TMarketReserve | undefined;
};

const RepayTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      RepayTab {asset?.name}
    </div>
  );
};

export { RepayTab };
