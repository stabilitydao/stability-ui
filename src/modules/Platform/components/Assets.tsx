import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { assets } from "@stabilitydao/stability";

import { sortTable, formatNumber } from "@utils";

import { Breadcrumbs, TableColumnSort, HeadingText, Checkbox } from "@ui";

import { assetsPrices } from "@store";

import { ASSETS_TABLE } from "@constants";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

import type { TTableColumn, TAssetData } from "@types";

const Assets = (): JSX.Element => {
  const $assetsPrices = useStore(assetsPrices);

  const [tableStates, setTableStates] = useState(ASSETS_TABLE);
  const [tableData, setTableData] = useState<TAssetData[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<TAssetData[]>([]);

  const [isStablecoins, setIsStablecoins] = useState<boolean>(false);

  const tableHandler = () => {
    let data = tableData;

    if (isStablecoins) {
      data = filteredTableData.filter((asset) =>
        tokenlist.tokens
          .find((token) => token.symbol === asset.symbol)
          ?.tags?.includes("stablecoin")
      );
    }

    sortTable({
      table: tableStates,
      setTable: setTableStates,
      tableData: data,
      setTableData: setFilteredTableData,
    });
  };

  const initTableData = async () => {
    if (assets && $assetsPrices) {
      const allPrices = Object.values($assetsPrices).reduce((acc, cur) => {
        return { ...acc, ...cur };
      }, {});

      const assetsData = assets.map(({ symbol, website, addresses }) => {
        const assetAddress = tokenlist.tokens
          .find((token) => token.symbol === symbol)
          ?.address?.toLowerCase();

        const assetPrice = allPrices[assetAddress as string]?.price || "0";

        return {
          symbol,
          website,
          price: Number(assetPrice),
          addresses: Object.keys(addresses).length,
        };
      });
      setTableData(assetsData);
      setFilteredTableData(assetsData);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [isStablecoins]);

  useEffect(() => {
    initTableData();
  }, [$assetsPrices]);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Platform", "Assets"]} />

      <HeadingText text="Assets" scale={1} />

      <div className="flex items-center justify-start mb-3 select-none font-manrope text-[14px] font-semibold">
        <label className="inline-flex items-center cursor-pointer bg-accent-900 h-10 rounded-2xl">
          <div className="flex items-center gap-[10px] py-[10px] px-4">
            <Checkbox
              checked={isStablecoins}
              onChange={() => setIsStablecoins((prev) => !prev)}
            />
            <span className="text-neutral-50">Stablecoins</span>
          </div>
        </label>
      </div>

      <table className="font-manrope w-full">
        <thead className="bg-accent-950 text-neutral-600 h-[36px]">
          <tr className="text-[12px] uppercase">
            {tableStates.map((value: TTableColumn, index: number) => (
              <TableColumnSort
                key={value.name + index}
                index={index}
                value={value.name}
                sort={sortTable}
                table={tableStates}
                setTable={setTableStates}
                tableData={filteredTableData}
                setTableData={setFilteredTableData}
              />
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {!!filteredTableData.length &&
            filteredTableData.map(({ addresses, symbol, price, website }) => (
              <tr className="h-[48px] hover:bg-accent-950" key={symbol}>
                <td className="px-4 py-3">{symbol}</td>
                <td className="px-4 py-3 ">
                  <a
                    className="flex items-center justify-center"
                    href={website}
                    target="_blank"
                    title="Go to asset website"
                  >
                    <img
                      src="/icons/web.svg"
                      alt="Website"
                      className="w-[20px]"
                    />
                  </a>
                </td>
                <td className="px-4 py-3 text-end">
                  ${formatNumber(price, price < 1 ? "smallNumbers" : "format")}
                </td>
                <td className="px-4 py-3 text-end">{addresses}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export { Assets };
