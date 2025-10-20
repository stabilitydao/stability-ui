import { SupplyTab } from "./Tabs/SupplyTab";
import { WithdrawTab } from "./Tabs/WithdrawTab";
import { BorrowTab } from "./Tabs/BorrowTab";
import { RepayTab } from "./Tabs/RepayTab";
// import { LeverageTab } from "./Tabs/LeverageTab";
import { InformationTab } from "./Tabs/InformationTab";
import { UsersTab } from "./Tabs/UsersTab";
import { LiquidationsTab } from "./Tabs/LiquidationsTab";

import { MarketSectionTypes, TMarketReserve, TMarket } from "@types";

type TProps = {
  marketData: TMarket;
  section: MarketSectionTypes;
  asset: TMarketReserve | undefined;
  isLoading: boolean;
};

const MarketTabs: React.FC<TProps> = ({
  marketData,
  section,
  asset,
  isLoading,
}) => {
  switch (section) {
    case MarketSectionTypes.Supply:
      return (
        <SupplyTab
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.supply}
          isLoading={isLoading}
        />
      );
    case MarketSectionTypes.Withdraw:
      return (
        <WithdrawTab
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.withdraw}
          isLoading={isLoading}
        />
      );
    case MarketSectionTypes.Borrow:
      return (
        <BorrowTab
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.borrow}
          isLoading={isLoading}
        />
      );
    case MarketSectionTypes.Repay:
      return (
        <RepayTab
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
          userData={userReserves.repay}
          isLoading={isLoading}
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
      return (
        <UsersTab
          network={marketData?.network?.id as string}
          market={marketData?.marketId}
        />
      );
    case MarketSectionTypes.Liquidations:
      return (
        <LiquidationsTab
          network={marketData?.network?.id as string}
          market={marketData?.marketId}
        />
      );
    default:
      return null;
  }
};

export { MarketTabs };
