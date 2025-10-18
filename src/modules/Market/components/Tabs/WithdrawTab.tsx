import { WithdrawForm } from "../Forms/WithdrawForm";

import type { TMarketReserve, TMarket, TAddress } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  userData: Record<TAddress, string>;
  isLoading: boolean;
};

const WithdrawTab: React.FC<TProps> = ({
  network,
  market,
  asset,
  assets,
  userData,
  isLoading,
}) => {
  return (
    <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-6">
      <WithdrawForm
        network={network}
        market={market}
        asset={asset}
        userData={userData}
        isLoading={isLoading}
      />
    </div>
  );
};

export { WithdrawTab };
