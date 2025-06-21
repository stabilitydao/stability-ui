import { useState, useEffect } from "react";

import axios from "axios";

import { TableColumnSort, HeadingText, FullPageLoader } from "@ui";

import { sortTable, getShortAddress } from "@utils";

import { BC_POOL_TABLE, POOL_TABLE } from "@constants";

import { GRAPH_ENDPOINTS } from "src/constants/env";

import type { TAddress, TTableColumn, TPoolTable } from "@types";

const Swapper = (): JSX.Element => {
  const [poolTableStates, setPoolTableStates] = useState(POOL_TABLE);
  const [BCPoolTableStates, setBCPoolTableStates] = useState(BC_POOL_TABLE);

  const [poolTableData, setPoolTableData] = useState<TPoolTable[]>([]);
  const [BCPoolTableData, setBCPoolTableData] = useState<TPoolTable[]>([]);

  const initTablesData = async () => {
    try {
      const GRAPH_URL = GRAPH_ENDPOINTS[146];

      const GRAPH_QUERY = `{
              bcpoolEntities {
                  pool
                  id
                  ammAdapter
                  tokenIn
                  tokenOut
              }
              poolEntities {
                  ammAdapter
                  assetAdded
                  id
                  tokenIn
                  tokenOut
              }}`;

      const graphResponse = await axios.post(GRAPH_URL, {
        query: GRAPH_QUERY,
      });

      const data = graphResponse.data.data;

      setPoolTableData(data.poolEntities);
      setBCPoolTableData(data.bcpoolEntities);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initTablesData();
  }, []);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <HeadingText text="Swapper" scale={1} />

      {BCPoolTableData.length && poolTableData.length ? (
        <>
          <HeadingText text="Pools" scale={2} />
          <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
            <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] font-bold uppercase">
                  {poolTableStates.map((value: TTableColumn, index: number) => (
                    <TableColumnSort
                      key={value.name + index}
                      index={index}
                      value={value.name}
                      sort={sortTable}
                      table={poolTableStates}
                      setTable={setPoolTableStates}
                      tableData={poolTableData}
                      setTableData={setPoolTableData}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {poolTableData.map(({ id, ammAdapter, tokenIn, tokenOut }) => (
                  <tr
                    //onClick={() => toPool(name)}
                    className="h-[48px] hover:bg-accent-950" //cursor-pointer
                    key={id}
                  >
                    <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                      {getShortAddress(id, 6, 6)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getShortAddress(ammAdapter, 6, 6)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getShortAddress(tokenIn, 6, 6)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getShortAddress(tokenOut, 6, 6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Pools Link Here */}
          <a
            className="bg-accent-950 hover:bg-[#1B0D45] mt-6 px-3 py-3 rounded-xl flex items-center w-max font-bold text-sm"
            href="/add-pools"
            target="_blank"
            title="Go to add pools page"
          >
            Add Pools
          </a>

          <HeadingText text="Blue Chip Pools" scale={2} />
          <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
            <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] font-bold uppercase">
                  {BCPoolTableStates.map(
                    (value: TTableColumn, index: number) => (
                      <TableColumnSort
                        key={value.name + index * 10}
                        index={index}
                        value={value.name}
                        sort={sortTable}
                        table={BCPoolTableStates}
                        setTable={setBCPoolTableStates}
                        tableData={BCPoolTableData}
                        setTableData={setBCPoolTableData}
                      />
                    )
                  )}
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {BCPoolTableData.map(
                  ({ id, ammAdapter, pool, tokenIn, tokenOut }) => (
                    <tr
                      //   onClick={() => toPool(name)}
                      className="h-[48px] hover:bg-accent-950 cursor-pointer"
                      key={id}
                    >
                      <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                        {getShortAddress(id, 6, 6)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getShortAddress(ammAdapter, 6, 6)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getShortAddress(pool as TAddress, 6, 6)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {getShortAddress(tokenIn, 6, 6)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getShortAddress(tokenOut, 6, 6)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <FullPageLoader />
      )}
    </div>
  );
};

export { Swapper };
