import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { useStore } from "@nanostores/react";

import { APRModal } from "./components/modals/APRModal";
import { VSHoldModal } from "./components/modals/VSHoldModal";
import { ColumnSort } from "./components/ColumnSort";
import { Filters } from "./components/Filters";
import { Portfolio } from "./components/Portfolio";

import { chains } from "@stabilitydao/stability";

import {
  FullPageLoader,
  ErrorMessage,
  APRtimeSwitcher,
  Pagination,
  VaultsTable,
  DisplayType,
} from "@ui";

import { vaults, isVaultsLoaded, aprFilter, connected, error } from "@store";

import { initFilters } from "./functions";

import { formatFromBigInt, dataSorter, debounce, cn } from "@utils";

import {
  SONIC_TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  DEFAULT_TABLE_PARAMS,
} from "@constants";

import { DisplayTypes } from "@types";

import type {
  TVault,
  TTableColumn,
  TEarningData,
  TVaults,
  TAPRPeriod,
  TTableActiveParams,
  TVSHoldModalState,
} from "@types";

const SonicVaults = (): JSX.Element => {
  const $vaults = useStore(vaults);

  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $connected = useStore(connected);

  const $error = useStore(error);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  const [activeTableParams, setActiveTableParams] =
    useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  const [allParams, setAllParams] = useState<number>(0);
  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);

  let urlTab = 1;

  let urlTableStates = SONIC_TABLE;

  if (!!Number(params.get("page"))) {
    urlTab = Number(params.get("page"));
  }

  if (params.get("sort")) {
    const [paramName, paramType] = params.get("sort")?.split("-") as string[];

    const indexOfState = urlTableStates.findIndex(
      ({ name }) => name.toUpperCase() === paramName.toUpperCase()
    );

    const URLParamType = paramType === "desc" ? "descendentic" : "ascendentic";

    if (indexOfState != -1) {
      urlTableStates[indexOfState].sortType = URLParamType;

      if (!activeTableParams.sort) {
        setActiveTableParams((prev) => ({ ...prev, sort: 1 }));
      }
    }
  }

  const search: React.RefObject<HTMLInputElement> = useRef(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  const [vsHoldModal, setVsHoldModal] = useState<TVSHoldModalState>({
    assetsVsHold: [],
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    created: 0,
    state: false,
    isVsActive: false,
  });

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(urlTableStates);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);
  const [displayType, setDisplayType] = useState<DisplayTypes>(
    DisplayTypes.Rows
  );
  const [activeNetworks, setActiveNetworks] = useState([
    {
      name: chains["146"].name,
      id: "146",
      logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["146"].img}`,
      explorer: "https://sonicscan.org/address/",
      nativeCurrency: "S",
      active: true, // main page active networks
    },
  ]);

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  const userVaultsCondition =
    tableFilters.find((filter) => filter.name === "My vaults")?.state &&
    !$connected;

  const handleSearch = (value: string) => {
    if (search?.current) {
      search.current.value = value;

      tableHandler();
      setSearchHistory([]);
    }
  };

  const clearSearchHistory = (history: string[]) => {
    if (history.length === searchHistory.length) {
      localStorage.setItem("searchHistory", JSON.stringify([]));
      setSearchHistory([]);
    } else {
      const updatedHistory = searchHistory.filter(
        (item) => !history.includes(item)
      );
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
  };

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

  const resetTable = () => {
    // search
    if (search?.current) {
      search.current.value = "";
    }

    // sort
    const _tableStates = tableStates.map((state) => ({
      ...state,
      sortType: "none",
    }));
    setTableStates(_tableStates);

    //filters
    const _tableFilters = tableFilters.map((filter) => {
      if (filter.variants) {
        const variants = filter.variants.map((variant) => ({
          ...variant,
          state: false,
        }));
        return {
          ...filter,
          variants,
        };
      } else if (filter.name === "Active") {
        return { ...filter, state: true };
      } else {
        return { ...filter, state: false };
      }
    });
    setTableFilters(_tableFilters);

    // ui
    setActiveTableParams(DEFAULT_TABLE_PARAMS);
    setAllParams(0);

    // path
    window.history.replaceState(null, "", window.location.pathname);

    // table reset
    tableHandler(_tableStates, DEFAULT_TABLE_PARAMS);
  };

  const updateHistorySearch = useCallback(
    debounce((value: string) => {
      if (!value) return;

      const history = JSON.parse(
        localStorage.getItem("searchHistory") as string
      );

      if (Array.isArray(history) && history.includes(value)) return;

      let newValues = history ? [...history, value] : [value];

      if (newValues.length > 5) {
        newValues.shift();
      }

      localStorage.setItem("searchHistory", JSON.stringify(newValues));
    }, 3000),
    []
  );

  const tableHandler = (
    table: TTableColumn[] = tableStates,
    tableParams = activeTableParams
  ) => {
    if (!$vaults) return;

    const searchValue: string = String(search?.current?.value.toLowerCase());

    //@ts-ignore
    updateHistorySearch(searchValue);

    let activeNetworksVaults: { [key: string]: TVault[] } = {};

    activeNetworks.forEach((network) => {
      if (network.active) {
        activeNetworksVaults[network.id] = $vaults[network.id];
      }
    });

    const mixedVaults: TVaults = Object.values(
      activeNetworksVaults
    ).reduce<TVaults>((acc, value) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        return { ...acc, ...(value as TVaults) };
      }
      return acc;
    }, {});

    let sortedVaults = Object.values(mixedVaults)
      .sort((a: TVault, b: TVault) => Number(b.tvl) - Number(a.tvl))
      .map((vault) => {
        const balance = formatFromBigInt(vault.balance, 18);

        return {
          ...vault,
          balanceInUSD: balance * Number(vault.shareprice),
        };
      });

    //filter
    tableFilters.forEach((f) => {
      if (!f.state) return;
      switch (f.type) {
        case "single":
          if (f.name === "Stablecoins") {
            sortedVaults = sortedVaults.filter((vault: TVault) => {
              if (vault.assets.length > 1) {
                return (
                  STABLECOINS.includes(vault?.assets[0]?.address) &&
                  STABLECOINS.includes(vault?.assets[1]?.address)
                );
              }
              return STABLECOINS.includes(vault?.assets[0]?.address);
            });
          }
          break;
        case "multiple":
          // if (!f.variants) break;
          // if (f.name === "Strategy") {
          //   const strategyName = f.variants.find(
          //     (variant: TTAbleFiltersVariant) => variant.state
          //   )?.name;
          //   if (strategyName) {
          //     sortedVaults = sortedVaults.filter(
          //       (vault: TVault) => vault.strategyInfo.shortId === strategyName
          //     );
          //   }
          // }
          break;
        case "sample":
          if (f.name === "My vaults") {
            sortedVaults = sortedVaults.filter(
              (vault: TVault) => vault.balance
            );
          }
          if (f.name === "Active") {
            sortedVaults = sortedVaults.filter(
              (vault: TVault) => vault.status === "Active"
            );
          }
          break;
        case "dropdown":
          if (!f.variants) break;
          if (f.name === "Strategies") {
            const strategiesToFilter = f.variants.reduce<string[]>(
              (acc, { state, name }) => {
                if (state) acc.push(name);
                return acc;
              },
              []
            );

            if (strategiesToFilter.length) {
              sortedVaults = sortedVaults.filter((vault: TVault) =>
                strategiesToFilter.includes(vault.strategyInfo.shortId)
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
        if (state.keyName === "earningData") {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              a.earningData.apr[$aprFilter],
              b.earningData.apr[$aprFilter],
              state.dataType,
              state.sortType
            )
          );
        } else {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              String(a[state.keyName as keyof TVault]),
              String(b[state.keyName as keyof TVault]),
              state.dataType,
              state.sortType
            )
          );
        }
      }
    });
    //search
    sortedVaults = sortedVaults.filter(
      (vault: TVault) =>
        vault?.symbol.toLowerCase().includes(searchValue) ||
        vault?.assetsSymbol.toLowerCase().includes(searchValue)
    );
    // pagination upd
    if (currentTab != 1) {
      const disponibleTabs = Math.ceil(sortedVaults.length / pagination);

      if (disponibleTabs < currentTab) {
        setCurrentTab(1);
        params.delete("page");
      }
    }

    //active table params(search-sort-filter)
    let _activeTableParams = tableParams;

    if (!!searchValue && !_activeTableParams.search) {
      _activeTableParams = { ..._activeTableParams, search: 1 };
    } else if (!searchValue && !!_activeTableParams.search) {
      _activeTableParams = { ..._activeTableParams, search: 0 };
    }

    const isSort = table.some((state) => state.sortType != "none");

    if (isSort && !_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 1 };
    } else if (!isSort && !!_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 0 };
    }

    // search history
    const history = JSON.parse(localStorage.getItem("searchHistory") as string);

    const historyData: string[] = [];
    if (Array.isArray(history) && searchValue) {
      for (const historyValue of history) {
        if (historyValue.includes(searchValue)) {
          historyData.push(historyValue);
        }
      }
    }

    setActiveTableParams(_activeTableParams);
    setFilteredVaults(sortedVaults);
    setTableStates(table);
    setSearchHistory(historyData);
  };

  const initVaults = async () => {
    if ($vaults) {
      const vaults: TVault[] = Object.values($vaults[146])
        .sort((a, b) => Number((b as TVault).tvl) - Number((a as TVault).tvl))
        .map((vault) => {
          const tVault = vault as TVault;
          const balance = formatFromBigInt(tVault.balance, 18);

          return {
            ...tVault,
            balanceInUSD: balance * Number(tVault.shareprice),
          };
        });

      initFilters(
        vaults,
        tableFilters,
        setTableFilters,
        activeNetworksHandler,
        setActiveTableParams
      );
      setLocalVaults(vaults);

      setFilteredVaults(vaults);
      setIsLocalVaultsLoaded(true);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [tableFilters, activeNetworks]);

  useEffect(() => {
    initVaults();
  }, [$vaults, $isVaultsLoaded]);

  useEffect(() => {
    const _allParams = Object.values(activeTableParams).reduce(
      (acc, cur) => (acc += cur),
      0
    );

    if (allParams != _allParams) {
      setAllParams(_allParams);
    }
  }, [activeTableParams]);

  const isLoading = useMemo(() => {
    return !$isVaultsLoaded || !isLocalVaultsLoaded;
  }, [$isVaultsLoaded, isLocalVaultsLoaded]);

  return (
    <>
      <div
        className={`${
          isLoading ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} />

        <div className="flex items-start justify-between">
          <div>
            <h2 className="page-title__font text-start mb-2 md:mb-5">Vaults</h2>
            <h3 className="text-[#97979a] page-description__font">
              Aggregates every active strategy across chains and protocols.
              <br className="hidden md:block" />
              Explore, compare, and deposit into vaults optimized for yield,
              <br className="hidden md:block" />
              auto-compounding, and multi-protocol integration—all
            </h3>
          </div>
          <div className="md:block hidden">
            <APRtimeSwitcher withText={true} />
          </div>
        </div>
        <Portfolio vaults={localVaults} />

        <div className="flex items-center xl:justify-between gap-2 mt-6 md:mt-10 mb-4">
          <div className="max-w-[240px] w-full relative text-[16px]">
            <label className="relative block">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <img
                  src="/search.svg"
                  alt="Search"
                  className="w-5 h-5 text-[#97979A]"
                />
              </span>
              <input
                type="text"
                className="text-[#97979A] w-full bg-transparent border border-[#23252A] rounded-lg transition-all duration-300 h-[48px] pl-[44px] pr-10"
                placeholder="Search asset"
                ref={search}
                onChange={() => tableHandler()}
              />

              <span
                onClick={() => handleSearch("")}
                className={cn(
                  "absolute inset-y-0 right-4 flex items-center cursor-pointer",
                  !search?.current?.value && "hidden"
                )}
              >
                <img src="/icons/circle-xmark.png" alt="xmark" />
              </span>
            </label>
            {!!searchHistory.length && (
              <div className="absolute left-0 mt-2 w-full bg-[#1C1D1F] border border-[#383B42] rounded-lg z-[10] p-[6px]">
                <span className="text-[#97979A] text-[12px] leading-[14px] font-medium p-[6px]">
                  Recent searches
                </span>
                {searchHistory.map((text, index) => (
                  <div
                    key={text + index}
                    className={cn(
                      "cursor-pointer flex items-center justify-between"
                    )}
                  >
                    <span
                      className="text-ellipsis whitespace-nowrap overflow-hidden text-[14px] leading-5 font-medium py-[6px] pl-[6px]"
                      onClick={() => handleSearch(text)}
                    >
                      {text}
                    </span>
                    <img
                      className="py-[6px] pr-[6px]"
                      onClick={() => clearSearchHistory([text])}
                      src="/icons/xmark.svg"
                      alt="xmark"
                    />
                  </div>
                ))}
                <button
                  className="text-[#A193F2] text-[12px] leading-[14px] font-medium p-[6px] w-full text-start"
                  onClick={() => clearSearchHistory(searchHistory)}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            allParams={allParams}
            setTableParams={setActiveTableParams}
            resetTable={resetTable}
          />

          <DisplayType
            type={displayType}
            setType={setDisplayType}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>

      <div className="pb-5">
        <div
          className={cn(
            "flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]",
            displayType === "grid" && "hidden"
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
                "relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]",
                displayType === "grid" && "rounded-lg border-b"
              )}
            >
              <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                <FullPageLoader />
              </div>
            </div>
          ) : localVaults?.length ? (
            <VaultsTable
              vaults={currentTabVaults}
              display={displayType}
              isUserVaults={!!userVaultsCondition}
              period={$aprFilter}
              setModalState={setAprModal}
            />
          ) : (
            <div className="text-start h-[60px] font-medium">No vaults</div>
          )}
        </div>
        <Pagination
          pagination={pagination}
          data={filteredVaults}
          tab={currentTab}
          display={displayType}
          setTab={setCurrentTab}
          setPagination={setPagination}
        />
      </div>

      {aprModal.state && (
        <APRModal state={aprModal} setModalState={setAprModal} />
      )}
      {vsHoldModal.state && (
        <VSHoldModal state={vsHoldModal} setModalState={setVsHoldModal} />
      )}
    </>
  );
};

export { SonicVaults };
