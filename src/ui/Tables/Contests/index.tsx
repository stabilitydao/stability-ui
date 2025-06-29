import { FullPageLoader } from "@ui";

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
        <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
          <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
            <FullPageLoader />
          </div>
        </div>
      )}
    </div>
  );
};

export { ContestsTable };
