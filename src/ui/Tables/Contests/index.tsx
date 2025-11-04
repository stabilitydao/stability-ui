import { LoadTable } from "@ui";

import { Row } from "./Row";

import { IExtendedYieldContest } from "@types";

interface IProps {
  contests: IExtendedYieldContest[];
}

const ContestsTable: React.FC<IProps> = ({ contests }) => {
  return (
    <div>
      {contests.length ? (
        <div>
          {contests.map((contest) => (
            <Row key={contest.id} contest={contest} />
          ))}
        </div>
      ) : (
        <LoadTable />
      )}
    </div>
  );
};

export { ContestsTable };
