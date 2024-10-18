import { useState, useEffect } from "react";

import { assets } from "@stabilitydao/stability";

import { sortTable } from "@utils";

import { Breadcrumbs, TableColumnSort, HeadingText } from "@ui";

import { ASSETS_TABLE } from "@constants";

import type { TTableColumn, TAssetData } from "@types";

const Assets = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(ASSETS_TABLE);
  const [tableData, setTableData] = useState<TAssetData[]>([]);

  const initTableData = async () => {
    if (assets) {
      const assetsData = assets.map(({ symbol, website, addresses }) => ({
        symbol,
        website,
        addresses: Object.keys(addresses).length,
      }));
      setTableData(assetsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, []);
  return (
    <div className="max-w-[1200px] w-full">
      <Breadcrumbs links={["Platform", "Assets"]} />

      <HeadingText text="Assets" scale={1} />

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
                tableData={tableData}
                setTableData={setTableData}
              />
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {!!tableData.length &&
            tableData.map(({ addresses, symbol, website }) => (
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
                <td className="px-4 py-3 text-end">{addresses}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export { Assets };
