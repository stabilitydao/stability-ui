import { WithdrawForm } from "../Forms/WithdrawForm";

import type { TMarketReserve, TMarket, TAddress } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: Record<TAddress, string>;
};

const WithdrawTab: React.FC<TProps> = ({
  network,
  market,
  asset,
  assets,
  userData,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <WithdrawForm
        network={network}
        market={market}
        asset={asset}
        userData={userData}
      />
    </div>
  );
};

export { WithdrawTab };
