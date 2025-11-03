import { UsersTable } from "./UsersTable";
import { HoldersTable } from "./HoldersTable";

import { cn } from "@utils";

import { LeaderboardTableTypes } from "@types";

type TProps = {
  activeTable: LeaderboardTableTypes;
};

const Tables = ({ activeTable }: TProps): JSX.Element => {
  return (
    <div>
      <div
        className={cn(
          activeTable === LeaderboardTableTypes.Users ? "block" : "hidden"
        )}
      >
        <UsersTable />
      </div>
      <div
        className={cn(
          activeTable === LeaderboardTableTypes.Holders ? "block" : "hidden"
        )}
      >
        <HoldersTable />
      </div>
    </div>
  );
};

export { Tables };
