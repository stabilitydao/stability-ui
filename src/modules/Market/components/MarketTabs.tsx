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
  network: string;
  market: string;
  marketData: TMarket;
  section: MarketSectionTypes;
  asset: TMarketReserve | undefined;
};

const MarketTabs: React.FC<TProps> = ({
  network,
  market,
  marketData,
  section,
  asset,
}) => {
  switch (section) {
    case MarketSectionTypes.Supply:
      return (
        <SupplyTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
        />
      );
    case MarketSectionTypes.Withdraw:
      return (
        <WithdrawTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
        />
      );
    case MarketSectionTypes.Borrow:
      return (
        <BorrowTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
        />
      );
    case MarketSectionTypes.Repay:
      return (
        <RepayTab
          network={network}
          market={marketData}
          asset={asset}
          assets={marketData?.reserves}
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
