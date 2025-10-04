import { DepositTab } from "./Tabs/DepositTab";
import { BorrowTab } from "./Tabs/BorrowTab";
// import { LeverageTab } from "./Tabs/LeverageTab";
import { InformationTab } from "./Tabs/InformationTab";
import { UsersTab } from "./Tabs/UsersTab";

import { MarketSectionTypes, TMarketAsset, TMarket } from "@types";

type TProps = {
  network: string;
  market: string;
  marketData: TMarket;
  section: MarketSectionTypes;
  asset: TMarketAsset | undefined;
};

const MarketTabs: React.FC<TProps> = ({
  network,
  market,
  marketData,
  section,
  asset,
}) => {
  switch (section) {
    case MarketSectionTypes.Deposit:
      return <DepositTab asset={asset} />;
    case MarketSectionTypes.Borrow:
      return <BorrowTab asset={asset} />;
    // case MarketSectionTypes.Leverage:
    //   return <LeverageTab asset={asset} />;
    case MarketSectionTypes.Information:
      return (
        <InformationTab
          market={marketData}
          activeAsset={asset}
          assets={marketData?.assets}
        />
      );
    case MarketSectionTypes.Users:
      return <UsersTab network={network} market={market} />;
    default:
      return null;
  }
};

export { MarketTabs };
