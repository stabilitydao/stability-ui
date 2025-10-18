import { SupplyTab } from "./Tabs/SupplyTab";
import { WithdrawTab } from "./Tabs/WithdrawTab";
import { BorrowTab } from "./Tabs/BorrowTab";
import { RepayTab } from "./Tabs/RepayTab";
// import { LeverageTab } from "./Tabs/LeverageTab";
import { InformationTab } from "./Tabs/InformationTab";
import { UsersTab } from "./Tabs/UsersTab";
import { LiquidationsTab } from "./Tabs/LiquidationsTab";

import {
  MarketSectionTypes,
  TMarketReserve,
  TMarket,
  TUserReserveStates,
} from "@types";

type TProps = {
  network: string;
  market: string;
  marketData: TMarket;
  section: MarketSectionTypes;
  asset: TMarketReserve | undefined;
  userReserves: TUserReserveStates;
};

const MarketTabs: React.FC<TProps> = ({
  network,
  market,
  marketData,
  section,
  asset,
  userReserves,
}) => {
  switch (section) {
    case MarketSectionTypes.Supply:
      return (
        <SupplyTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.supply}
        />
      );
    case MarketSectionTypes.Withdraw:
      return (
        <WithdrawTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.withdraw}
        />
      );
    case MarketSectionTypes.Borrow:
      return (
        <BorrowTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.borrow}
        />
      );
    case MarketSectionTypes.Repay:
      return (
        <RepayTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.repay}
        />
      );
    // case MarketSectionTypes.Leverage:
    //   return <LeverageTab asset={asset} />;
    case MarketSectionTypes.Information:
      return (
        <InformationTab
          market={marketData}
          activeAsset={asset}
          assets={marketData?.reserves}
        />
      );
    case MarketSectionTypes.Users:
      return <UsersTab network={network} market={market} />;
    case MarketSectionTypes.Liquidations:
      return <LiquidationsTab network={network} market={market} />;
    default:
      return null;
  }
};

export { MarketTabs };
