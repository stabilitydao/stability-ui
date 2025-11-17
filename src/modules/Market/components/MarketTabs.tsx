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
  activeAsset: TMarketReserve | undefined;
};

const MarketTabs: React.FC<TProps> = ({ marketData, section, activeAsset }) => {
  switch (section) {
    case MarketSectionTypes.Supply:
      return <SupplyTab market={marketData} activeAsset={activeAsset} />;
    case MarketSectionTypes.Withdraw:
      return <WithdrawTab market={marketData} activeAsset={activeAsset} />;
    case MarketSectionTypes.Borrow:
      return <BorrowTab market={marketData} activeAsset={activeAsset} />;
    case MarketSectionTypes.Repay:
      return <RepayTab market={marketData} activeAsset={activeAsset} />;
    // case MarketSectionTypes.Leverage:
    //   return <LeverageTab asset={asset} />;
    case MarketSectionTypes.Information:
      return <InformationTab market={marketData} activeAsset={activeAsset} />;
    case MarketSectionTypes.Users:
      return <UsersTab market={marketData} />;
    case MarketSectionTypes.Liquidations:
      return (
        <LiquidationsTab
          networkId={marketData?.network?.id as string}
          marketId={marketData?.marketId}
        />
      );
    default:
      return null;
  }
};

export { MarketTabs };
