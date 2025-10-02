import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";

import { FullPageLoader, ErrorMessage, MarketsTable } from "@ui";

import { error, markets, isMarketsLoaded } from "@store";

import { dataSorter } from "@utils";

import { CHAINS, MARKET_TABLE } from "@constants";

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

  const activeNetworks = CHAINS.filter(({ active }) => active);

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
      let allMarkets = activeNetworks.flatMap((network) =>
        Object.entries($markets[network.id] ?? {}).map(([name, assets]) => {
          const formattedAssets = Object.entries(assets).map(
            ([address, data]) => {
              return {
                address,
                ...data,
              };
            }
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

          const LTV = Math.max(
            ...formattedAssets.map((asset) => Number(asset.maxLtv) || 0)
          );

          return {
            name,
            assets: formattedAssets,
            supplyAPR,
            borrowAPR,
            supplyTVL,
            borrowTVL,
            network,
            LTV,
          };
        })
      );

      if (!params.get("sort")) {
        allMarkets = allMarkets.sort(
          (a: TMarket, b: TMarket) => Number(b.supplyTVL) - Number(a.supplyTVL)
        );
      }

      setLocalMarkets(allMarkets);
      setFilteredMarkets(allMarkets);
      setIsLocalMarketsLoaded(true);
    }
  };

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
