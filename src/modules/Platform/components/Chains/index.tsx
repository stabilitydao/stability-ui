import { useState, useEffect, useRef, useMemo } from "react";

import { chains, getChainBridges } from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import {
  Breadcrumbs,
  HeadingText,
  TableColumnSort,
  Counter,
  FullPageLoader,
} from "@ui";

import { BridgesList, ChainStatus, ProtocolsList, RangeSlider } from "../../ui";

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
  const [filtredTableData, setFiltredTableData] = useState<IChainData[]>([]);
  const [activeChains, setActiveChains] = useState(CHAINS_INFO);

  const [TVLRange, setTVLRange] = useState({
    min: 0,
    max: 1_000_000_000_000_000,
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const search: React.RefObject<HTMLInputElement> = useRef(null);

  const initTableData = async () => {
    if (chains) {
      const chainsData = Object.entries(chains).map((chain) => {
        const allChainProtocols = getChainProtocols(chain[0]);

        const protocols = allChainProtocols.map(({ organization }) => ({
          name: integrations[organization as string].name,
          img: integrations[organization as string].img,
          website: integrations[organization as string].website,
        }));

        const uniqueProtocols = protocols.filter(
          (protocol, index, self) =>
            index === self.findIndex((p) => p.name === protocol.name)
        );

        return {
          ...chain[1],
          chainId: Number(chain[1].chainId),
          bridgesCount: getChainBridges(chain[1].name).length,
          protocols: uniqueProtocols,
          protocolsCount: protocols.length,
          tvl: $apiData?.total.chainTvl[chain[0]] || 0,
        };
      });

      setTableData(chainsData);
      setFiltredTableData(chainsData);
      setIsLoaded(true);
    }
  };

  const activeChainsHandler = (category: string) => {
    if (
      activeChains.filter((chain) => chain.active).length ===
        activeChains.length &&
      category === "Total"
    ) {
      return;
    }

    let updatedChains = activeChains.map((chain) =>
      category === chain.name ? { ...chain, active: !chain.active } : chain
    );

    if (updatedChains.some((chain) => chain.name === "Total" && chain.active)) {
      updatedChains = activeChains.map((chain) => ({ ...chain, active: true }));
    }

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

    setActiveChains(updatedChains);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    const searchValue: string = String(search?.current?.value.toLowerCase());
    const chainsToFilter = activeChains.filter((chain) => chain.active);

    let data: IChainData[] = [];
    //filter
    if (chainsToFilter.some((chain) => chain.name === "Total")) {
      data = tableData;
    } else {
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
    }

    data = data.filter(({ tvl }) => tvl <= TVLRange.max && tvl >= TVLRange.min);

    //sort
    sortTable({
      table,
      setTable: setTableStates,
      tableData: data,
      setTableData: setFiltredTableData,
    });
    //search
    data = data.filter(
      ({ name, chainId }) =>
        name.toLowerCase().includes(searchValue) ||
        String(chainId).includes(searchValue)
    );

    setFiltredTableData(data);
    setTableStates(table);
  };

  useEffect(() => {
    tableHandler();
  }, [activeChains, TVLRange]);

  useEffect(() => {
    initTableData();
  }, [$apiData]);

  const range = useMemo(() => {
    if (!!tableData.length) {
      const TVLs = tableData.map(({ tvl }) => tvl);
      return { min: Math.min(...TVLs), max: Math.max(...TVLs) };
    } else {
      return { min: 0, max: 1 };
    }
  }, [tableData]);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Platform", "Chains"]} />

      <HeadingText text="Chains" scale={1} styles="mt-3" />

      <div className="bg-accent-950 p-[26px] rounded-[44px] mb-6 flex flex-col select-none">
        <div className="flex md:flex-nowrap flex-wrap relative justify-center">
          {activeChains.map(({ name, length, bgColor, active }) => (
            <div
              key={name}
              className={`flex p-[12px] w-full ${active ? "opacity-100" : "opacity-50"} ${name === "Total" && active ? "" : "cursor-pointer"}`}
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
        <RangeSlider range={range} setRange={setTVLRange} />
      </div>
      <div className="overflow-x-auto lg:overflow-x-visible lg:min-w-[1000px]">
        <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[1000px] lg:min-w-full">
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
                  tableData={filtredTableData}
                  setTableData={setFiltredTableData}
                />
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {isLoaded ? (
              <>
                {!!filtredTableData.length ? (
                  filtredTableData.map(
                    ({
                      chainId,
                      name,
                      status,
                      img,
                      // chainLibGithubId,
                      // multisig,
                      tvl,
                      protocols,
                    }) => (
                      <tr
                        onClick={() => toChain(chainId)}
                        key={chainId}
                        className="h-[48px] hover:bg-accent-950 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-center sticky lg:relative left-0 lg:table-cell bg-accent-950 lg:bg-transparent z-10">
                          <div className="flex font-bold whitespace-nowrap items-center">
                            {img && (
                              <img
                                src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${img}`}
                                alt={name}
                                className="w-[24px] h-[24px] mr-2 rounded-full"
                              />
                            )}
                            {name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {chainId}
                        </td>
                        <td className="px-4 py-3 text-left whitespace-nowrap">
                          {formatNumber(tvl, "abbreviate")}
                        </td>
                        {/* <td className="px-4 py-3 text-[12px]">
                    <div className="flex">
                      {multisig && <span>{getShortAddress(multisig)}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {chainLibGithubId && (
                        <a
                          className="inline-flex"
                          href={`https://github.com/stabilitydao/stability-contracts/issues/${chainLibGithubId}`}
                          target="_blank"
                          title="Go to chain library issue page on Github"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <img
                            src="/icons/github.svg"
                            alt="Github"
                            className="w-[20px]"
                          />
                        </a>
                      )}
                    </div>
                  </td> */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <ChainStatus status={status} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex lg:justify-center items-center">
                            <BridgesList chainId={chainId} chainName={name} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex lg:justify-center items-center">
                            <ProtocolsList protocols={protocols} />
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td>
                      <p className="text-[18px]">No results found.</p>
                      <p className="min-w-[200px]">
                        Try clearing your filters or changing your search term.
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr className="relative h-[80px]">
                <td className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
                  <FullPageLoader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Chains };
