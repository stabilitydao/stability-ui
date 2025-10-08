// import { BasicPositionStats } from "../Stats/BasicPositionStats";
// import { DepositForm } from "../Forms/DepositForm";

import type { TMarketReserve } from "@types";

type TProps = {
  asset: TMarketReserve | undefined;
};

const WithdrawTab: React.FC<TProps> = ({ asset }) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      WithdrawTab {asset?.name}
    </div>
  );
};

export { WithdrawTab };
