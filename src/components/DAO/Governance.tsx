import React, { useState, useEffect } from "react";
import { SDIV, PROFIT, PM, TREASURY } from "@constants";

function Governance(props) {
  return (
    <div className="mt-5 bg-[#3d404b] border border-gray-600 rounded-md  overflow-hidden">
      <div className="p-3">
        <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">Governance</h1>
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm">
          <table className="text-sm text-[#8D8E96]">
            <thead>
              <tr>
                <td>
                  <h2 className="text-start text-2xl py-4">Treasury</h2>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="min-w-[85px]">Address:</td>
                <td>{TREASURY[0]}</td>
              </tr>
              <tr>
                <td>Total balance: </td>
                <td>{props.daoData?.treasuryBalance}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 w-7/8 bg-[#2c2f38] rounded-md mt-5 text-sm">
          <table className="text-sm text-[#8D8E96]">
            <thead>
              <tr>
                <td>
                  <h2 className="text-start text-2xl py-4">Governance</h2>
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
          <div className="flex mt-5">
            <a
              className="rounded-sm text-start p-2 me-3 text-[#8D8E96] bg-button"
              href="https://www.tally.xyz/governance/eip155:137:0x6214Ba4Ce85C0A6F6025b0d63be7d65214463226">
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
