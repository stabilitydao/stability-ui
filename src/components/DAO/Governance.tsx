import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { ShortAddress } from "./ShortAddress";

import { Loader } from "@components";
import { publicClient } from "@store";
import { ERC20ABI } from "@web3";
import { PROFIT, TREASURY } from "@constants";

import type { TAddress } from "@types";

const Governance = () => {
  const $publicClient = useStore(publicClient);

  const [treasuryBalance, setTreasuryBalance] = useState<number>();

  const fetchTreasury = async () => {
    const _treasuryBalance = (await $publicClient?.readContract({
      address: PROFIT[0],
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [TREASURY[0]],
    })) as bigint;
    setTreasuryBalance(
      Math.trunc(Number(formatUnits(_treasuryBalance, 18)) * 100) / 100
    );
  };

  useEffect(() => {
    fetchTreasury();
  }, []);

  return treasuryBalance ? (
    <div className="overflow-hidden mt-5 bg-[#3d404b] rounded-md border border-gray-600 relative">
      <h1 className="text-xxl me-auto flex text-[#9c9c9c] ps-4 my-auto h-[50px]">
        Governance
      </h1>

      <div className="rounded-md bg-[#3d404b] mt-2 grid md:grid-cols-2 p-2 gap-3 border border-gray-600">
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm border border-gray-700">
          <table className="text-sm font-medium text-[#9c9c9c]">
            <thead>
              <tr>
                <td className="w-[100px]">
                  <h2 className="text-start text-2xl">Treasury</h2>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="min-w-[85px]">Address:</td>
                <td>
                  <ShortAddress address={TREASURY[0]} />
                </td>
              </tr>
              <tr>
                <td>Total balance: </td>
                <td>{treasuryBalance} PROFIT</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#2c2f38] rounded-md text-sm border border-gray-700">
          <table className="text-sm font-medium text-[#9c9c9c]">
            <thead>
              <tr>
                <td>
                  <h2 className="text-start text-2xl">Governance</h2>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="min-w-[85px]">Address:</td>
                <td>
                  <span className="text-red-400 ">¿¿ADDRESS??</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex mt-3">
            <a
              className="rounded-sm p-2 ms-auto bg-button"
              href="https://www.tally.xyz/governance/eip155:137:0x6214Ba4Ce85C0A6F6025b0d63be7d65214463226"
              title="Tally governance app"
              target="blank"
            >
              {" "}
              Tally governance app
            </a>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex p-3 shadow-lg rounded-md justify-center md:h-[210px] m-auto mt-5 bg-[#3d404b] border-gray-600">
      <Loader height={100} width={100} />
    </div>
  );
};
export { Governance };
