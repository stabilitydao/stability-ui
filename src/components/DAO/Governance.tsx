import React, { useState, useEffect } from "react";
import { SDIV, PROFIT, PM, TREASURY } from "@constants";
import ShortAddress from "./ShortAddress";

function Governance(props) {
  return (
    <div className="overflow-hidden mt-5 bg-[#3d404b] rounded-md border border-gray-600">
      <h1 className="text-xxl text-left text-[#8D8E96] ps-4 my-auto">
        Governance
      </h1>

      <div className="rounded-md bg-[#3d404b] mt-2 grid md:grid-cols-2 p-3 gap-3 border border-gray-600">
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm border border-gray-700">
          <table className="text-sm text-[#8D8E96]">
            <thead>
              <tr>
                <td>
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
                <td>{props.daoData?.treasuryBalance} PROFIT</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#2c2f38] rounded-md text-sm border border-gray-700">
          <table className="text-sm text-[#8D8E96]">
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
                  <span className="text-red-600 ">¿¿ADDRESS??</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex mt-3">
            <a
              className="rounded-sm p-2 ms-auto bg-button"
              href="https://www.tally.xyz/governance/eip155:137:0x6214Ba4Ce85C0A6F6025b0d63be7d65214463226"
              title="Tally governance app">
              {" "}
              Tally governance app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Governance;
