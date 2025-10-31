import { useState, useEffect, useRef } from "react";

import {
  chains,
  assets,
  getChainBridges,
  getChainStrategies,
} from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import { HeadingText, TableColumnSort, Counter, LoadTable } from "@ui";

import { ChainStatus } from "../../ui";

import { formatNumber, sortTable } from "@utils";

import { CHAINS_TABLE } from "@constants";

import { CHAINS_INFO, CHAIN_STATUSES } from "../../constants";

import type { TTableColumn, IChainData } from "@types";

import { getChainProtocols, integrations } from "@stabilitydao/stability";

import type { ApiMainReply } from "@stabilitydao/stability";

const toChain = (chainId: number): void => {
  window.location.href = `/chains/${chainId}`;
};

const Chains = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  const [tableStates, setTableStates] = useState(CHAINS_TABLE);
  const [tableData, setTableData] = useState<IChainData[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<IChainData[]>([]);
  const [activeChains, setActiveChains] = useState(CHAINS_INFO);

  // const [TVLRange, setTVLRange] = useState({
  //   min: 0,
  //   max: 1_000_000_000_000_000,
  // });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const search: React.RefObject<HTMLInputElement> = useRef(null);

  const initTableData = async () => {
    const searchParams = new URLSearchParams(window.location.search);

    const chainStatuses = searchParams
      .getAll("status")
      .map((status) =>
        status === "awaiting_issue" ? "awaiting_issue_creation" : status
      );

    if (chains) {
      console.log("chains1");
      const chainsData = Object.entries(chains).map((chain) => {
        const allChainProtocols = getChainProtocols(chain[0]);

        const protocols = allChainProtocols.map(({ organization }) => ({
          name: integrations[organization as string].name,
          img: integrations[organization as string].img,
          website: integrations[organization as string].website,
        }));

        const chainAssets = assets.filter((asset) =>
          Object.keys(asset.addresses).includes(chain[0].toString())
        );

        return {
          ...chain[1],
          chainId: Number(chain[1].chainId),
          bridges: getChainBridges(chain[1].name).length,
          protocols: protocols.length,
          assets: chainAssets.length,
          strategies: getChainStrategies(chain[1].name).length,
          tvl: $apiData?.total.chainTvl[chain[0]] || 0,
        };
      });
      console.log("chains2");

      const filteredChainsData = chainStatuses.length
        ? chainsData.filter((chain) =>
            chainStatuses.includes(chain.status.toLowerCase())
          )
        : chainsData;

      const filteredChains = chainStatuses.length
        ? activeChains.map((chain) =>
            chainStatuses.includes(
              chain.name === "Awaiting issue"
                ? "awaiting_issue_creation"
                : chain.name.toLowerCase().split(" ").join("_")
            )
              ? { ...chain, active: !chain.active }
              : chain
          )
        : activeChains.map((chain) => ({ ...chain, active: true }));
      setTableData(chainsData);
      setActiveChains(filteredChains);
      setFilteredTableData(filteredChainsData);
      setIsLoaded(true);
    }
  };

  const activeChainsHandler = (category: string) => {
    let updatedChains = activeChains.map((chain) =>
      category === chain.name ? { ...chain, active: !chain.active } : chain
    );

    ///// For chains URL filters
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);
    /////

    const allActive = activeChains.every((chain) => chain.active);
    const allInactive = updatedChains.every((chain) => !chain.active);

    if (allInactive) {
      updatedChains = activeChains.map((chain) => ({
        ...chain,
        active: true,
      }));
    } else if (allActive) {
      updatedChains = activeChains.map((chain) => ({
        ...chain,
        active: chain.name === category,
      }));
    }

    /// URL set
    const activeChainsLength = updatedChains.filter(
      (chain) => chain.active
    )?.length;

    if (activeChainsLength === updatedChains.length) {
      params.delete("status");
    } else {
      params.delete("status");

      updatedChains.forEach((chain) => {
        const type = chain.name.toLowerCase().split(" ").join("_");

        if (chain.active) {
          params.append("status", type);
        }
      });
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());

    setActiveChains(updatedChains);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    const searchValue: string = String(
      search?.current?.value.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase()
    );
    const chainsToFilter = activeChains.filter((chain) => chain.active);

    let data: IChainData[] = [];
    //filter
    chainsToFilter.forEach((chain) => {
      if (chain.active) {
        data.push(
          ...tableData.filter(
            (row) =>
              row.status ===
              CHAIN_STATUSES[chain.name as keyof typeof CHAIN_STATUSES]
          )
        );
      }
    });
    // data = data.filter(({ tvl }) => tvl <= TVLRange.max && tvl >= TVLRange.min);

    //search
    if (!!searchValue) {
      data = data.filter(
        ({ name, chainId }) =>
          name
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .toLowerCase()
            .includes(searchValue) || String(chainId).includes(searchValue)
      );
    }

    //sort
    sortTable({
      table,
      setTable: setTableStates,
      tableData: data,
      setTableData: setFilteredTableData,
    });
  };

  useEffect(() => {
    tableHandler();
  }, [activeChains]);

  useEffect(() => {
    if ($apiData) {
      initTableData();
    }
  }, [$apiData]);

  // const range = useMemo(() => {
  //   if (!!tableData.length) {
  //     const TVLs = tableData.map(({ tvl }) => tvl);
  //     return { min: Math.min(...TVLs), max: Math.max(...TVLs) };
  //   } else {
  //     return { min: 0, max: 1 };
  //   }
  // }, [tableData]);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <HeadingText text="Chains" scale={1} styles="mt-3" />

      <div className="bg-accent-950 p-[26px] rounded-[44px] mb-6 flex flex-col select-none">
        <div className="flex flex-wrap relative justify-evenly gap-5">
          {activeChains.map(({ name, length, bgColor, active }) => (
            <div
              key={name}
              className={`flex p-[12px] ${active ? "opacity-100" : "opacity-50"} cursor-pointer`}
              onClick={() => activeChainsHandler(name)}
            >
              <Counter color={bgColor} value={length.toString()} name={name} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5 flex-col lg:flex-row font-semibold text-[14px] mb-6">
        <label className="relative block w-full">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <img
              src="/search.svg"
              alt="Search"
              className="w-4 h-4 text-neutral-500"
            />
          </span>
          <input
            type="text"
            className="mt-1 lg:mt-0 w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-10 pl-10"
            placeholder="Search"
            ref={search}
            onChange={() => tableHandler()}
          />
        </label>
        {/* <RangeSlider range={range} setRange={setTVLRange} /> */}
      </div>
      <div className="pb-5">
        <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
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
        </div>

        <div>
          {isLoaded ? (
            <>
              {!!filteredTableData.length ? (
                filteredTableData.map(
                  ({
                    chainId,
                    name,
                    status,
                    img,
                    // chainLibGithubId,
                    // multisig,
                    tvl,
                    protocols,
                    bridges,
                    assets,
                    strategies,
                  }) => (
                    <div
                      key={chainId}
                      onClick={() => toChain(chainId)}
                      className="border border-[#23252A] border-b-0 bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5 cursor-pointer"
                    >
                      <div className="px-2 md:px-4 w-[10%] text-start font-bold text-[#97979A] hidden lg:block">
                        {chainId}
                      </div>
                      <div className="px-2 md:px-4 w-[30%] md:w-[25%] text-start flex items-center font-bold whitespace-nowrap">
                        {img && (
                          <img
                            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${img}`}
                            alt={name}
                            className="w-[24px] h-[24px] mr-2 rounded-full"
                          />
                        )}
                        {name}
                      </div>
                      <div className="px-2 md:px-4 w-[15%] text-start">
                        {tvl ? formatNumber(tvl, "abbreviate") : ""}
                      </div>
                      <div className="px-2 md:px-4 w-[15%] flex justify-center">
                        <ChainStatus status={status} />
                      </div>
                      <div className="px-2 md:px-4 w-[10%] text-center font-bold">
                        {!!strategies && strategies}
                      </div>
                      <div className="px-2 md:px-4 w-[10%] text-center font-bold">
                        {!!bridges && bridges}
                      </div>
                      <div className="px-2 md:px-4 w-[10%] text-center font-bold">
                        {!!protocols && protocols}
                      </div>
                      <div className="px-2 md:px-4 w-[10%] text-center font-bold">
                        {!!assets && assets}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div>
                  <p className="text-[18px]">No results found.</p>
                  <p className="min-w-[200px]">
                    Try clearing your filters or changing your search term.
                  </p>
                </div>
              )}
            </>
          ) : (
            <LoadTable />
          )}
        </div>
      </div>
    </div>
  );
};

export { Chains };
