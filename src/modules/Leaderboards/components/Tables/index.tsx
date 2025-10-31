import { UsersTable } from "./UsersTable";
import { HoldersTable } from "./HoldersTable";

type TProps = {
  activeTable: string;
};

const Tables = ({ activeTable }: TProps): JSX.Element => {
  if (activeTable === "Users") {
    return <UsersTable />;
  }

  return <HoldersTable />;
};

export { Tables };
