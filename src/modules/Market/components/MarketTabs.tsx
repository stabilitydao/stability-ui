import { SupplyTab } from "./Tabs/SupplyTab";
import { WithdrawTab } from "./Tabs/WithdrawTab";
import { BorrowTab } from "./Tabs/BorrowTab";
import { RepayTab } from "./Tabs/RepayTab";
// import { LeverageTab } from "./Tabs/LeverageTab";
import { InformationTab } from "./Tabs/InformationTab";
import { UsersTab } from "./Tabs/UsersTab";

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
      return <SupplyTab asset={asset} />;
    case MarketSectionTypes.Withdraw:
      return <WithdrawTab asset={asset} />;
    case MarketSectionTypes.Borrow:
      return <BorrowTab asset={asset} />;
    case MarketSectionTypes.Repay:
      return <RepayTab asset={asset} />;
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
    default:
      return null;
  }
};

export { MarketTabs };
