import type { ApiMainReply } from "@stabilitydao/stability";
import { useStore } from "@nanostores/react";
import { apiData } from "@store";
import { shortAddress } from "../Platform/Chains";

import type { TAddress } from "@types";

interface APILeaderboard {
  address: TAddress;
  deposit: number;
  earned: number;
}

const Users = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  return (
    <div className="flex flex-col xl:min-w-[1000px] gap-[36px]">
      <h1 className="mb-0 text-[40px] font-bold">Users</h1>

      {$apiData ? (
        <table className="font-manrope">
          <thead className="bg-accent-950 text-neutral-600 h-[36px]">
            <tr className="text-[12px] uppercase">
              <td className="px-4 py-2">Rank</td>
              <td className="text-left px-4 py-2">Address</td>
              <td className="text-right px-4 py-2">Earned</td>
              <td className="text-right px-4 py-2">Deposit</td>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {$apiData?.leaderboard.map((user: APILeaderboard, rank: number) => (
              <tr key={rank} className="h-[48px] hover:bg-accent-950">
                <td className="px-4 py-3">{rank + 1}</td>
                <td className="px-4 py-3" style={{ fontFamily: "monospace" }}>
                  {shortAddress(user.address, 6, 4)}
                </td>
                <td className="text-right px-4 py-3">
                  {user.earned.toFixed(2)}
                </td>
                <td className="text-right px-4 py-3">
                  {user.deposit
                    ? (Math.round(user.deposit * 100) / 100).toFixed(2)
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};

export { Users };
