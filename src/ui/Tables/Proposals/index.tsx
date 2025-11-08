import { EmptyTable } from "../EmptyTable";
import { Row } from "./Row";

import { DisplayTypes } from "@types";

interface IProps {
  proposals: any;
}

const ProposalsTable: React.FC<IProps> = ({ proposals }) => {
  if (!proposals?.length) {
    return (
      <EmptyTable
        display={DisplayTypes.Rows}
        text="No proposals yet"
        description=""
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {proposals.map((proposal: any, index: number) => {
        return <Row key={`row/${proposals.id + index}`} proposal={proposal} />;
      })}
    </div>
  );
};

export { ProposalsTable };
