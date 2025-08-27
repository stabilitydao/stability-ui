import { EmptyTable } from "../EmptyTable";
import { Grid } from "./Grid";
import { Row } from "./Row";

import { cn } from "@utils";

import { DisplayTypes, TMarket } from "@types";

interface IProps {
  markets: TMarket[];
  display: DisplayTypes;
}

const MarketsTable: React.FC<IProps> = ({ markets, display }) => {
  if (!markets?.length) {
    return <EmptyTable isUserVaults={false} display={display} />;
  }

  return (
    <div
      key={display}
      className={cn(
        display === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
          : "flex flex-col gap-2"
      )}
    >
      {markets.map((market: TMarket, index: number) => {
        if (display === "grid") {
          return <Grid key={`grid/${market.name + index}`} market={market} />;
        }

        return <Row key={`row/${market.name + index}`} market={market} />;
      })}
    </div>
  );
};

export { MarketsTable };
