import { EmptyTable } from "../EmptyTable";
import { Row } from "./Row";

import { DisplayTypes, TMarket } from "@types";

interface IProps {
  markets: TMarket[];
}

const MarketsTable: React.FC<IProps> = ({ markets }) => {
  if (!markets?.length) {
    return <EmptyTable isUserVaults={false} display={DisplayTypes.Rows} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {markets.map((market: TMarket, index: number) => {
        return <Row key={`row/${market.name + index}`} market={market} />;
      })}
    </div>
  );
};

export { MarketsTable };
