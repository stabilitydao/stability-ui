import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";
// import { Filters } from "./components/Filters";

// import { chains } from "@stabilitydao/stability";

import {
  FullPageLoader,
  // ErrorMessage,
  // Pagination,
  MarketsTable,
  // DisplayType,
  // APRModal,
} from "@ui";

import {
  // vaults,
  // isVaultsLoaded,
  // aprFilter,
  // error,
  // metaVaults,
  markets,
} from "@store";

// import { initFilters } from "./functions";

import { dataSorter, cn } from "@utils";

// import {
//   FARMING_TABLE_FILTERS,
//   PAGINATION_LIMIT,
//   STABLECOINS,
//   DEFAULT_TABLE_PARAMS,
//   LEVERAGE_FARMING_TABLE,
// } from "@constants";

import {
  // TVault,
  TTableColumn,
  // TAPRPeriod,
  // TTableActiveParams,
  // TEarningData,
  // DisplayTypes,
  // VaultTypes,
} from "@types";
import { CHAINS, MARKET_TABLE } from "@constants";

const Lending = (): JSX.Element => {
  // const $vaults = useStore(vaults);
  // const $metaVaults = useStore(metaVaults);
  const $markets = useStore(markets);

  // const $isVaultsLoaded = useStore(isVaultsLoaded);
  // const $aprFilter: TAPRPeriod = useStore(aprFilter);

  // const $error = useStore(error);

  // const newUrl = new URL(window.location.href);
  // const params = new URLSearchParams(newUrl.search);

  // const [activeTableParams, setActiveTableParams] =
  //   useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  // const [allParams, setAllParams] = useState<number>(0);
  // const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);

  // const [aprModal, setAprModal] = useState({
  //   earningData: {} as TEarningData,
  //   daily: 0,
  //   lastHardWork: "0",
  //   symbol: "",
  //   state: false,
  //   pool: {},
  // });

  // let urlTab = 1;

  let urlTableStates = MARKET_TABLE;

  // if (!!Number(params.get("page"))) {
  //   urlTab = Number(params.get("page"));
  // }

  // if (params.get("sort")) {
  //   const [paramName, paramType] = params.get("sort")?.split("-") as string[];

  //   const indexOfState = urlTableStates.findIndex(
  //     ({ name }) => name.toUpperCase() === paramName.toUpperCase()
  //   );

  //   const URLParamType = paramType === "desc" ? "descendentic" : "ascendentic";

  //   if (indexOfState != -1) {
  //     urlTableStates[indexOfState].sortType = URLParamType;

  //     if (!activeTableParams.sort) {
  //       setActiveTableParams((prev) => ({ ...prev, sort: 1 }));
  //     }
  //   }
  // }
  const [localMarkets, setLocalMarkets] = useState([]);
  // const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);

  // const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  // const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(urlTableStates);
  // const [tableFilters, setTableFilters] = useState(FARMING_TABLE_FILTERS);
  // const [displayType, setDisplayType] = useState<DisplayTypes>(
  //   DisplayTypes.Rows
  // );
  const [activeNetworks, setActiveNetworks] = useState(
    CHAINS.filter(({ active }) => active)
  );

  // const lastTabIndex = currentTab * pagination;
  // const firstTabIndex = lastTabIndex - pagination;
  // const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  // // const activeNetworksHandler = async (chainIDs: string[]) => {
  // //   let updatedNetworks = activeNetworks.map((network) =>
  // //     chainIDs.includes(network.id)
  // //       ? { ...network, active: !network.active }
  // //       : network
  // //   );

  // //   const allActive = activeNetworks.every((network) => network.active);
  // //   const allInactive = updatedNetworks.every((network) => !network.active);

  // //   if (allInactive) {
  // //     updatedNetworks = activeNetworks.map((network) => ({
  // //       ...network,
  // //       active: true,
  // //     }));
  // //   } else if (allActive) {
  // //     updatedNetworks = activeNetworks.map((network) => ({
  // //       ...network,
  // //       active: chainIDs.includes(network.id),
  // //     }));
  // //   }

  // //   /// URL set
  // //   const activeNetworksLength = updatedNetworks.filter(
  // //     (network) => network.active
  // //   )?.length;

  // //   if (activeNetworksLength === updatedNetworks.length) {
  // //     params.delete("chain");
  // //   } else {
  // //     params.delete("chain");

  // //     updatedNetworks.forEach((network) => {
  // //       if (network.active) {
  // //         params.append("chain", network.id);
  // //       }
  // //     });
  // //   }

  // //   newUrl.search = `?${params.toString()}`;
  // //   window.history.pushState({}, "", newUrl.toString());

  // //   setActiveNetworks(updatedNetworks);
  // // };

  const tableHandler = (
    table: TTableColumn[] = tableStates,
    tableParams = activeTableParams
  ) => {
    if (!$markets) return;

    let activeNetworksMarkets: { [key: string]: any[] } = {};

    activeNetworks.forEach((network) => {
      if (network.active) {
        activeNetworksMarkets[network.id] = $markets[network.id];
      }
    });

    let sortedVaults = localMarkets.sort(
      (a: any, b: any) => Number(b.tvl) - Number(a.tvl)
    );

    //filter
    // tableFilters.forEach((f) => {
    //   if (!f.state) return;
    //   switch (f.type) {
    //     case "single":
    //       if (f.name === "Stablecoins") {
    //         sortedVaults = sortedVaults.filter((vault: TVault) => {
    //           if (vault.assets.length > 1) {
    //             return (
    //               STABLECOINS.includes(vault?.assets[0]?.address) &&
    //               STABLECOINS.includes(vault?.assets[1]?.address)
    //             );
    //           }
    //           return STABLECOINS.includes(vault?.assets[0]?.address);
    //         });
    //       }
    //       break;
    //     case "multiple":
    //       // if (!f.variants) break;
    //       // if (f.name === "Strategy") {
    //       //   const strategyName = f.variants.find(
    //       //     (variant: TTAbleFiltersVariant) => variant.state
    //       //   )?.name;
    //       //   if (strategyName) {
    //       //     sortedVaults = sortedVaults.filter(
    //       //       (vault: TVault) => vault.strategyInfo.shortId === strategyName
    //       //     );
    //       //   }
    //       // }
    //       break;
    //     case "sample":
    //       if (f.name === "My vaults") {
    //         sortedVaults = sortedVaults.filter(
    //           (vault: TVault) => vault.balance
    //         );
    //       }
    //       if (f.name === "Active") {
    //         sortedVaults = sortedVaults.filter(
    //           (vault: TVault) => vault.status === "Active"
    //         );
    //       }
    //       break;
    //     case "dropdown":
    //       if (!f.variants) break;
    //       if (f.name === "Strategies") {
    //         const strategiesToFilter = f.variants.reduce<string[]>(
    //           (acc, { state, name }) => {
    //             if (state) acc.push(name);
    //             return acc;
    //           },
    //           []
    //         );

    //         if (strategiesToFilter.length) {
    //           sortedVaults = sortedVaults.filter((vault: TVault) =>
    //             strategiesToFilter.includes(vault?.strategyInfo?.shortId)
    //           );
    //         }
    //       }
    //       break;
    //     default:
    //       console.error("NO FILTER CASE");
    //       break;
    //   }
    // });

    //sort
    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        sortedVaults = [...sortedVaults].sort((a, b) =>
          dataSorter(
            String(a[state.keyName]),
            String(b[state.keyName]),
            state.dataType,
            state.sortType
          )
        );
      }
    });

    // pagination upd
    // if (currentTab != 1) {
    //   const disponibleTabs = Math.ceil(sortedVaults.length / pagination);

    //   if (disponibleTabs < currentTab) {
    //     setCurrentTab(1);
    //     params.delete("page");
    //   }
    // }

    //active table params(search-sort-filter)
    let _activeTableParams = tableParams;

    const isSort = table.some((state) => state.sortType != "none");

    if (isSort && !_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 1 };
    } else if (!isSort && !!_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 0 };
    }

    // setActiveTableParams(_activeTableParams);
    // setFilteredVaults(sortedVaults);
    setTableStates(table);
  };

  const initMarkets = async () => {
    if ($markets) {
      const allMarkets = Object.entries($markets[146]).map(([name, assets]) => {
        const formattedAssets = Object.entries(assets).map(
          ([address, data]) => ({
            address,
            ...data,
          })
        );

        return {
          name,
          assets: formattedAssets,
        };
      });

      // initFilters(
      //   vaults,
      //   tableFilters,
      //   setTableFilters,
      //   activeNetworksHandler,
      //   setActiveTableParams
      // );
      setLocalMarkets(allMarkets);
      // setFilteredVaults(vaults);
      // setIsLocalVaultsLoaded(true);
    }
  };

  // // useEffect(() => {
  // //   tableHandler();
  // // }, [tableFilters, activeNetworks]);

  useEffect(() => {
    initMarkets();
  }, [$markets]);

  // // useEffect(() => {
  // //   const _allParams = Object.values(activeTableParams).reduce(
  // //     (acc, cur) => (acc += cur),
  // //     0
  // //   );

  // //   if (allParams != _allParams) {
  // //     setAllParams(_allParams);
  // //   }
  // // }, [activeTableParams]);

  // const isLoading = useMemo(() => {
  //   return !$isVaultsLoaded || !isLocalVaultsLoaded;
  // }, [$isVaultsLoaded, isLocalVaultsLoaded]);

  const isLoading = false;

  return (
    <>
      <div
      // className={`${
      //   isLoading ? "pointer-events-none" : "pointer-events-auto"
      // }`}
      >
        {/* <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} /> */}

        <h2 className="page-title__font text-start mb-2 md:mb-5">Lending</h2>
        <h3 className="text-[#97979a] page-description__font">
          Non-custodial on-chain isolated lending markets
        </h3>

        {/* <div className="flex items-center justify-between gap-2 mt-6 md:mt-10 mb-4">
          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            setTableParams={setActiveTableParams}
          />

          <DisplayType
            type={displayType}
            setType={setDisplayType}
            pagination={pagination}
            setPagination={setPagination}
            setTab={setCurrentTab}
          />
        </div> */}
      </div>
      <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
        <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
          <div
            className={cn(
              "flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] w-[762px] md:w-[960px] lg:w-full"
              // displayType === "grid" && "hidden"
            )}
          >
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
              <div
                className={cn(
                  "relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]"
                  // displayType === "grid" && "rounded-lg border-b"
                )}
              >
                <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                  <FullPageLoader />
                </div>
              </div>
            ) : localMarkets?.length ? (
              <MarketsTable
                markets={localMarkets}
                // vaults={currentTabVaults}
                // display={displayType}
                // setModalState={setAprModal}
              />
            ) : (
              <div className="text-start h-[60px] font-medium">No markets</div>
            )}
          </div>
        </div>

        {/* <Pagination
          pagination={pagination}
          data={filteredVaults}
          tab={currentTab}
          display={displayType}
          setTab={setCurrentTab}
          setPagination={setPagination}
        /> */}
      </div>
      {/* {aprModal.state && aprModal.type === "vault" && (
        <APRModal state={aprModal} setModalState={setAprModal} />
      )} */}
    </>
  );
};

export { Lending };
