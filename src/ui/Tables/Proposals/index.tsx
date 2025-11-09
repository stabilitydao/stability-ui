import { EmptyTable } from "../EmptyTable";
import { Row } from "./Row";

import { DisplayTypes, TProposal } from "@types";

interface IProps {
  proposals: TProposal[];
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
    <div className="flex flex-col">
      {proposals.map((proposal: TProposal, index: number) => {
        return (
          <Row
            key={`row/${proposal.id + index}`}
            proposal={proposal}
            isLast={proposals.length === index + 1}
          />
        );
      })}
    </div>
  );
};

export { ProposalsTable };
