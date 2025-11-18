import { useStore } from "@nanostores/react";

import { AddressCell } from "./AddressCell";

import { LoadTable, EmptyTable } from "@ui";

import { account } from "@store";

import { TMetaVaultUser } from "@types";
import { formatNumber } from "@utils";

type TProps = {
  isLoading: boolean;
  data: TMetaVaultUser[];
};

const UsersTable: React.FC<TProps> = ({ isLoading, data }) => {
  const $account = useStore(account);

  if (isLoading) {
    return <LoadTable />;
  }

  return (
    <div className="w-[450px] md:w-full">
      {data.length ? (
        <div>
          {data.map((user, index) => (
            <div
              key={`${user?.address}-${index}`}
              className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
            >
              <AddressCell
                address={user?.address}
                title={user?.address}
                highlighted={
                  $account?.toLowerCase() === user?.address?.toLowerCase()
                }
                isSticky
              />
              <div className="px-2 md:px-4 w-[100px] md:w-1/4 text-end">
                {user?.deposit ? formatNumber(user?.deposit, "format") : ""}
              </div>
              <div className="px-2 md:px-4 w-[100px] md:w-1/4 text-end">
                {user?.earned ? formatNumber(user?.earned, "format") : ""}
              </div>
              <div className="px-2 md:px-4 w-[100px] md:w-1/4 text-end">
                {user?.points
                  ? formatNumber(user?.points, "abbreviate")?.slice(1)
                  : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyTable text="No users yet" description="" isSticky={true} />
      )}
    </div>
  );
};

export { UsersTable };
