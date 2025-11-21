import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";
import { Filters } from "./components/Filters";

import { FullPageLoader, ErrorMessage, MarketsTable } from "@ui";

import { error, markets, isMarketsLoaded } from "@store";

import { dataSorter } from "@utils";

import { initFilters } from "./functions";

import {
  CHAINS,
  MARKET_TABLE,
  MARKETS_TABLE_FILTERS,
  DEFAULT_TABLE_PARAMS,
} from "@constants";

import { TTableColumn, TMarket, TTableActiveParams } from "@types";

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

  const [activeTableParams, setActiveTableParams] =
    useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  const [localMarkets, setLocalMarkets] = useState<TMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<TMarket[]>([]);

  const [isLocalMarketsLoaded, setIsLocalMarketsLoaded] = useState(false);

  const [tableStates, setTableStates] = useState(MARKET_TABLE);
  const [tableFilters, setTableFilters] = useState(MARKETS_TABLE_FILTERS);

  const activeNetworks = CHAINS.filter(({ active }) => active);

  const activeNetworksHandler = async (chainIDs: string[]) => {
    //temp
    console.log(chainIDs);

    // let updatedNetworks = activeNetworks.map((network) =>
    //   chainIDs.includes(network.id)
    //     ? { ...network, active: !network.active }
    //     : network
    // );

    // const allActive = activeNetworks.every((network) => network.active);
    // const allInactive = updatedNetworks.every((network) => !network.active);

    // if (allInactive) {
    //   updatedNetworks = activeNetworks.map((network) => ({
    //     ...network,
    //     active: true,
    //   }));
    // } else if (allActive) {
    //   updatedNetworks = activeNetworks.map((network) => ({
    //     ...network,
    //     active: chainIDs.includes(network.id),
    //   }));
    // }

    // /// URL set
    // const activeNetworksLength = updatedNetworks.filter(
    //   (network) => network.active
    // )?.length;

    // if (activeNetworksLength === updatedNetworks.length) {
    //   params.delete("chain");
    // } else {
    //   params.delete("chain");

    //   updatedNetworks.forEach((network) => {
    //     if (network.active) {
    //       params.append("chain", network.id);
    //     }
    //   });
    // }

    // newUrl.search = `?${params.toString()}`;
    // window.history.pushState({}, "", newUrl.toString());

    // setActiveNetworks(updatedNetworks);
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
      (a: TMarket, b: TMarket) =>
        Number(b?.supplyTVLInUSD) - Number(a?.supplyTVLInUSD)
    );

    //filter
    tableFilters.forEach((f) => {
      if (!f.state) return;
      switch (f.type) {
        case "sample":
          if (f.name === "Active") {
            sortedMarkets = sortedMarkets.filter(
              (market: TMarket) => !market.deprecated
            );
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
            String(a[state.key as keyof TMarket]),
            String(b[state.key as keyof TMarket]),
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
    if ($markets && $isMarketsLoaded) {
      let allMarkets = activeNetworks.flatMap((network) => {
        const networkMarkets = $markets[network.id];
        if (!networkMarkets) return [];

        return networkMarkets.map((market: TMarket) => {
          const marketId = market?.marketId;

          const reserves = market?.reserves;

          const deprecated = market?.deprecated;

          const type = market?.type;

          const supplyAPR = Math.max(
            ...reserves?.map((asset) => Number(asset?.supplyAPR) || 0)
          );

          const borrowAPR = Math.max(
            ...reserves?.map((asset) => Number(asset?.borrowAPR) || 0)
          );

          const supplyTVLInUSD = reserves?.reduce(
            (acc, cur) => acc + Number(cur?.supplyTVLInUSD),
            0
          );

          const borrowTVL = Math.max(
            ...reserves?.map((asset) => Number(asset?.borrowTVL) || 0)
          );

          const LTV = Math.max(
            ...reserves?.map((asset) => Number(asset?.maxLtv) || 0)
          );

          const utilization = Math.max(
            ...reserves?.map((asset) => Number(asset?.utilization) || 0)
          );

          return {
            marketId,
            reserves,
            supplyAPR,
            borrowAPR,
            supplyTVLInUSD,
            borrowTVL,
            network,
            LTV,
            utilization,
            deprecated,
            type,
          };
        });
      });

      if (!params.get("sort")) {
        allMarkets = allMarkets.sort(
          (a: TMarket, b: TMarket) =>
            Number(b?.supplyTVLInUSD) - Number(a?.supplyTVLInUSD)
        );
      }

      initFilters(
        allMarkets,
        tableFilters,
        setTableFilters,
        activeNetworksHandler,
        setActiveTableParams
      );

      setLocalMarkets(allMarkets);

      setFilteredMarkets(allMarkets);
      setIsLocalMarketsLoaded(true);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [tableFilters]); //activeNetworks

  useEffect(() => {
    initMarkets();
  }, [$markets, $isMarketsLoaded]);

  const isLoading = useMemo(() => {
    return !$isMarketsLoaded || !isLocalMarketsLoaded;
  }, [isLocalMarketsLoaded, $isMarketsLoaded]);
  console.log(activeTableParams);
  return (
    <>
      <div
        className={`${
          isLoading ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} />

        <h2 className="page-title__font text-start mb-2 md:mb-5">Lending</h2>
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2">
          <h3 className="text-[#97979a] page-description__font">
            Non-custodial on-chain lending markets
          </h3>
          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            setTableParams={setActiveTableParams}
          />
        </div>
      </div>
      <div className="pb-5 mt-4 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
        <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
          <div className="flex items-center bg-[#151618] border border-[#23252A] rounded-lg h-[48px] w-[850px] md:w-full mb-4">
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
              <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
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
