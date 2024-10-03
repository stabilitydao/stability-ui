import type {ApiMainReply} from "@stabilitydao/stability";
import {useStore} from "@nanostores/react";
import {apiData} from "@store";
import {shortAddress} from "../Platform/Chains.tsx";

const Users = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  return (
    <div className="flex flex-col min-[1440px]:min-w-[1000px] gap-[36px]">
      <h1 className="mb-0 text-[40px] font-bold">Users</h1>

      {$apiData ? (
        <table>
          <thead>
          <tr>
            <td>Rank</td>
            <td>Address</td>
            <td className="text-right">Earned</td>
            <td className="text-right">Deposit</td>
          </tr>
          </thead>
          <tbody>
          {$apiData.leaderboard.map((user, rank) => (
            <tr>
              <td>{rank+1}</td>
              <td style={{fontFamily: 'monospace',}}>{shortAddress(user.address, 6, 4)}</td>
              <td className="text-right">{user.earned.toFixed(2)}</td>
              <td className="text-right">{user.deposit ? (Math.round(user.deposit * 100) / 100).toFixed(2) : ''}</td>
            </tr>
          ))}
          </tbody>
        </table>
        ) : (
        <span>Loading</span>
      )}
    </div>
  )
}

export {Users}
