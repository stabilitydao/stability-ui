import { useState, useEffect, useRef } from "react";

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

  const search: React.RefObject<HTMLInputElement> = useRef(null);

  const tabFilter = () => {
    const value: any = search?.current?.value.toLowerCase();

    const filtred = localVaults.filter((vault) =>
      vault.symbol.toLowerCase().includes(value)
    );
    setFilteredVaults(filtred);
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
          sharePrice: String($vaults[5][index]),
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
          onChange={tabFilter}
        />
        <table className="table-auto w-full rounded-lg bg-[#2c2f38] mt-5">
          <thead>
            <tr className="text-[18px]">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2 text-center">
                <p className="inline-block">Strategy</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="7"
                  viewBox="0 0 12 7"
                  fill="none"
                  className="inline-block ml-[10px] cursor-pointer"
                >
                  <path
                    d="M6 7L11.1962 0.25H0.803848L6 7Z"
                    fill="white"
                    fillOpacity="0.6"
                  />
                </svg>
              </th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Share Price</th>
              <th className="px-4 py-2">TVL</th>
              <th className="px-4 py-2">APR</th>
            </tr>
          </thead>
          <tbody>
            {filteredVaults.map((vault: TLocalVault, index: number) => (
              <tr
                className="border-t border-[#4f5158] text-center text-[18px]"
                key={vault.name}
              >
                <td className="px-4 py-2 flex items-center justify-center gap-1">
                  <div className="flex">
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
                  <div>
                    <p>{vault.name}</p>
                    <p>{vault.symbol}</p>
                  </div>
                </td>

                <td className=" px-4 py-2">{vault.type}</td>
                <td className=" px-4 py-2">{vault.strategy}</td>
                <td className=" px-4 py-2">{vault.balance}</td>
                <td className=" px-4 py-2">{vault.sharePrice}</td>
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
