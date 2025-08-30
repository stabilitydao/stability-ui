import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";
import { Filters } from "./components/Filters";

import { FullPageLoader, ErrorMessage, MarketsTable } from "@ui";

import { error, markets, isMarketsLoaded } from "@store";

import { initFilters } from "./functions";

import { dataSorter } from "@utils";

import { CHAINS, MARKET_TABLE, MARKET_TABLE_FILTERS } from "@constants";

import { TTableColumn, TMarket, TMarketAsset } from "@types";

const Lending = (): JSX.Element => {
  const $isMarketsLoaded = useStore(isMarketsLoaded);
  const $markets = useStore(markets);

  const $error = useStore(error);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  if (params.get("sort")) {
    const [paramName, paramType] = params.get("sort")?.split("-") as string[];

    const indexOfState = MARKET_TABLE.findIndex(
      ({ name }) => name.toUpperCase() === paramName.toUpperCase()
    );

    const URLParamType = paramType === "desc" ? "descendentic" : "ascendentic";

    if (indexOfState != -1) {
      MARKET_TABLE[indexOfState].sortType = URLParamType;
    }
  }

  const [localMarkets, setLocalMarkets] = useState<TMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<TMarket[]>([]);

  const [isLocalMarketsLoaded, setIsLocalMarketsLoaded] = useState(false);

  const [tableStates, setTableStates] = useState(MARKET_TABLE);
  const [tableFilters, setTableFilters] = useState(MARKET_TABLE_FILTERS);

  const [activeNetworks, setActiveNetworks] = useState(
    CHAINS.filter(({ active }) => active)
  );

  const activeNetworksHandler = async (chainIDs: string[]) => {
    let updatedNetworks = activeNetworks.map((network) =>
      chainIDs.includes(network.id)
        ? { ...network, active: !network.active }
        : network
    );

    const allActive = activeNetworks.every((network) => network.active);
    const allInactive = updatedNetworks.every((network) => !network.active);

    if (allInactive) {
      updatedNetworks = activeNetworks.map((network) => ({
        ...network,
        active: true,
      }));
    } else if (allActive) {
      updatedNetworks = activeNetworks.map((network) => ({
        ...network,
        active: chainIDs.includes(network.id),
      }));
    }

    /// URL set
    const activeNetworksLength = updatedNetworks.filter(
      (network) => network.active
    )?.length;

    if (activeNetworksLength === updatedNetworks.length) {
      params.delete("chain");
    } else {
      params.delete("chain");

      updatedNetworks.forEach((network) => {
        if (network.active) {
          params.append("chain", network.id);
        }
      });
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());

    setActiveNetworks(updatedNetworks);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    if (!$markets) return;

    let activeNetworksMarkets: { [key: string]: TMarket[] } = {};

    activeNetworks.forEach((network) => {
      if (network.active) {
        activeNetworksMarkets[network.id] = $markets[network.id];
      }
    });

    let sortedMarkets = localMarkets.sort(
      (a: TMarket, b: TMarket) => Number(b.supplyTVL) - Number(a.supplyTVL)
    );

    //filter
    tableFilters.forEach((f) => {
      if (!f.state) return;
      switch (f.type) {
        case "dropdown":
          if (!f.variants) break;
          if (f.name === "Markets") {
            const marketsToFilter = f.variants.reduce<string[]>(
              (acc, { state, name }) => {
                if (state) acc.push(name);
                return acc;
              },
              []
            );

            if (marketsToFilter.length) {
              sortedMarkets = sortedMarkets.filter((market: TMarket) =>
                marketsToFilter.includes(market.name)
              );
            }
          }
          break;
        default:
          console.error("NO FILTER CASE");
          break;
      }
    });

    //sort
    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        sortedMarkets = [...sortedMarkets].sort((a, b) =>
          dataSorter(
            String(a[state.keyName]),
            String(b[state.keyName]),
            state.dataType,
            state.sortType
          )
        );
      }
    });

    setFilteredMarkets(sortedMarkets);
    setTableStates(table);
  };

  const initMarkets = async () => {
    if ($markets) {
      const allMarkets = activeNetworks.flatMap((network) =>
        Object.entries($markets[network.id]).map(([name, assets]) => {
          const formattedAssets = Object.entries(assets)
            .map(([address, data]) => ({
              address,
              ...data,
            }))
            .sort(
              (a: TMarketAsset, b: TMarketAsset) =>
                Number(b.supplyTVL) - Number(a.supplyTVL)
            );

          const supplyAPR = Math.max(
            ...formattedAssets.map((asset) => Number(asset.supplyAPR) || 0)
          );
          const borrowAPR = Math.max(
            ...formattedAssets.map((asset) => Number(asset.borrowAPR) || 0)
          );
          const supplyTVL = Math.max(
            ...formattedAssets.map((asset) => Number(asset.supplyTVL) || 0)
          );
          const borrowTVL = Math.max(
            ...formattedAssets.map((asset) => Number(asset.borrowTVL) || 0)
          );

          return {
            name,
            assets: formattedAssets,
            supplyAPR,
            borrowAPR,
            supplyTVL,
            borrowTVL,
            network,
          };
        })
      );

      initFilters(
        allMarkets,
        tableFilters,
        setTableFilters,
        activeNetworksHandler
      );

      setLocalMarkets(allMarkets);
      setFilteredMarkets(allMarkets);
      setIsLocalMarketsLoaded(true);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [tableFilters, activeNetworks]);

  useEffect(() => {
    initMarkets();
  }, [$markets]);

  const isLoading = useMemo(() => {
    return !$isMarketsLoaded || !isLocalMarketsLoaded;
  }, [isLocalMarketsLoaded, $isMarketsLoaded]);

  return (
    <>
      <div
        className={`${
          isLoading ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} />

        <h2 className="page-title__font text-start mb-2 md:mb-5">Lending</h2>
        <h3 className="text-[#97979a] page-description__font">
          Non-custodial on-chain isolated lending markets
        </h3>

        <div className="flex items-center justify-between gap-2 mt-6 md:mt-10 mb-4">
          <Filters filters={tableFilters} setFilters={setTableFilters} />
        </div>
      </div>
      <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
        <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
          <div className="flex items-center bg-[#151618] border border-[#23252A] rounded-lg h-[48px] w-[1050px] md:w-full mb-4">
            {tableStates.map((value: TTableColumn, index: number) => (
              <ColumnSort
                key={value.name + index}
                index={index}
                value={value.name}
                table={tableStates}
                sort={tableHandler}
              />
            ))}
          </div>
          <div>
            {isLoading ? (
              <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
                <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                  <FullPageLoader />
                </div>
              </div>
            ) : localMarkets?.length ? (
              <MarketsTable markets={filteredMarkets} />
            ) : (
              <div className="text-start h-[60px] font-medium">No markets</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { Lending };
