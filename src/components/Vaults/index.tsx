import { useState, useEffect, useRef } from "react";

import { ColumnFilter } from "./ColumnFilter";

import { useStore } from "@nanostores/react";
import { vaultData, vaults, vaultAssets } from "@store";

import { getTokenData } from "src/utils";
import type { TLocalVault } from "../../types";

function Vaults() {
  const $vaults = useStore(vaults);
  const $vaultData = useStore(vaultData);
  const $vaultAssets: any = useStore(vaultAssets);

  const [localVaults, setLocalVaults] = useState<TLocalVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TLocalVault[]>([]);

  const [tableStates, setTableStates] = useState([
    { name: "Name", keyName: "name", sortType: "none", dataType: "string" },
    { name: "Type", keyName: "type", sortType: "none", dataType: "string" },
    {
      name: "Strategy",
      keyName: "strategy",
      sortType: "none",
      dataType: "string",
    },
    {
      name: "Balance",
      keyName: "balance",
      sortType: "none",
      dataType: "number",
    },
    {
      name: "Share Price",
      keyName: "shareprice",
      sortType: "none",
      dataType: "number",
    },
    { name: "TVL", keyName: "tvl", sortType: "none", dataType: "number" },
    { name: "APR", keyName: "apr", sortType: "none", dataType: "number" },
  ]);

  const search: React.RefObject<HTMLInputElement> = useRef(null);

  const compareHandler = (
    a: any,
    b: any,
    dataType: string,
    sortOrder: string
  ) => {
    if (dataType === "number") {
      return sortOrder === "ascendentic" ? a - b : b - a;
    }
    if (dataType === "string") {
      return sortOrder === "ascendentic"
        ? a.localeCompare(b)
        : b.localeCompare(a);
    }
    return 0;
  };

  const tableFilter = (table: any) => {
    const searchValue: any = search?.current?.value.toLowerCase();
    let sortedVaults: any = localVaults;

    sortedVaults = localVaults.filter((vault) =>
      vault.symbol.toLowerCase().includes(searchValue)
    );
    table.forEach((state: any) => {
      if (state.sortType !== "none") {
        sortedVaults = [...sortedVaults].sort((a, b) =>
          compareHandler(
            a[state.keyName],
            b[state.keyName],
            state.dataType,
            state.sortType
          )
        );
      }
    });

    setFilteredVaults(sortedVaults);
    setTableStates(table);
  };

  useEffect(() => {
    if ($vaults?.length && $vaultData) {
      const balances = Object.values($vaultData).map(({ vaultUserBalance }) =>
        String(vaultUserBalance)
      );

      const vaults = $vaults[0].map((_: any, index: number) => {
        let assets;
        if ($vaultAssets.length) {
          const token1 = getTokenData($vaultAssets[index][0]);
          const token2 = getTokenData($vaultAssets[index][1]);
          assets = [
            { logo: token1?.logoURI, symbol: token1?.symbol },
            { logo: token2?.logoURI, symbol: token2?.symbol },
          ];
        }

        return {
          name: $vaults[1][index],
          assets: assets,
          symbol: $vaults[2][index],
          type: $vaults[3][index],
          strategy: $vaults[4][index],
          balance: balances[index],
          shareprice: String($vaults[5][index]),
          tvl: String($vaults[6][index]),
          apr: String($vaults[7][index]),
        };
      });
      setLocalVaults(vaults);
      setFilteredVaults(vaults);
    }
  }, [$vaults, $vaultData, $vaultAssets]);

  if (localVaults?.length) {
    return (
      <>
        <input
          type="text"
          className="w-full bg-[#2c2f38] outline-none pl-3 py-3 rounded-[4px] border-[2px] border-[#3d404b]  focus:border-[#9baab4] transition-all duration-300"
          placeholder="Search"
          ref={search}
          onChange={() => tableFilter(tableStates)}
        />
        <table className="table-auto w-full rounded-lg bg-[#2c2f38] mt-5">
          <thead className="select-none">
            <tr className="text-[18px]">
              {tableStates.map((value: any, index: number) => (
                <ColumnFilter
                  key={value.name}
                  index={index}
                  value={value.name}
                  table={tableStates}
                  filter={tableFilter}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredVaults.map((vault: TLocalVault) => (
              <tr
                className="border-t border-[#4f5158] text-center text-[18px]"
                key={vault.name}
              >
                <td className="px-4 py-2 flex items-center justify-center gap-1">
                  <div className="flex max-w-[300px]">
                    <img
                      className="w-8 h-8 rounded-full"
                      src={vault.assets[0].logo}
                      alt={vault.assets[0].symbol}
                    />
                    <img
                      className="w-8 h-8 rounded-full ml-[-12px]"
                      src={vault.assets[1].logo}
                      alt={vault.assets[1].symbol}
                    />
                  </div>
                  <div className="max-w-[250px]">
                    <p>{vault.name}</p>
                    <p>{vault.symbol}</p>
                  </div>
                </td>

                <td className=" px-4 py-2">{vault.type}</td>
                <td className=" max-w-[150px] px-4 py-2">{vault.strategy}</td>
                <td className=" px-4 py-2">{vault.balance}</td>
                <td className=" px-4 py-2">{vault.shareprice}</td>
                <td className=" px-4 py-2">{vault.tvl}</td>
                <td className=" px-4 py-2">{vault.apr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
  return <h1>Loading Vaults..</h1>;
}

export { Vaults };
