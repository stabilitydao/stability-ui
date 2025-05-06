import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import {assets, getAsset} from "@stabilitydao/stability";

import { sortTable, formatNumber } from "@utils";

import { Breadcrumbs, TableColumnSort, HeadingText, Checkbox } from "@ui";

import {assetsPrices, tokens} from "@store";

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

      // sonic tokenlist
      // todo get chainId from web3 state

      const tokenlistItems = tokenlist.tokens
        .filter(token => token.chainId.toString() == '146')

      const assetsData: TAssetData[] = tokenlistItems.map(item => {
        const assetPrice = allPrices[item.address.toLowerCase() as string]?.price || "0";
        const asset = getAsset(item.chainId.toString(), item.address as `0x${string}`)
        return {
          symbol: item.symbol,
          website: asset?.website || '',
          price: Number(assetPrice),
          // @ts-ignore
          tags: (item.tags as string[])?.map(tag => tokenlist.tags[tag]?.name),
          img: item.logoURI,
        };
      })

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

      <HeadingText text="Sonic Assets" scale={1} styles="mb-0" />

      <div className="mb-4 flex justify-center">
        {tokenlist.name} {`${tokenlist.version.major}.${tokenlist.version.minor}.${tokenlist.version.patch}`} from {(new Date(Date.parse(tokenlist.timestamp)).toLocaleDateString())}
      </div>

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
            filteredTableData.map(({ symbol, price, website, tags, img }) => (
              <tr className="h-[48px] hover:bg-accent-950" key={symbol}>
                <td className="pl-4 py-3 w-[260px]">
                  <div className="flex">
                    <img src={img} className="w-[24px] h-[24px] rounded-full mr-2" alt={symbol} />
                    <span className="font-bold">{symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-end min-w-[60px]" style={price == 0 ? {
                  color: 'red',
                } : {}}>
                  <span className="mr-[10px]">${formatNumber(price, price < 1 ? "smallNumbers" : "format")}</span>
                </td>
                <td className="px-4 py-3">{tags?.map(tag => (
                  <div
                    className="inline-flex text-[12px] text-[#eeeeee] font-bold px-3 py-[1px] bg-[#26005f] rounded-2xl mx-2">{tag}</div>
                ))}</td>
                <td className="px-4 py-3 ">
                  <a
                    className="flex items-center justify-start"
                    href={website}
                    target="_blank"
                    title="Go to asset website"
                  >
                    <img
                      src="/icons/web.svg"
                      alt="Website"
                      className="w-[20px] mr-1"
                    />
                    {website
                        .replace(/^https:\/\//, '')
                        .replace(/\/$/, '')
                      || ''}
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export {Assets};
