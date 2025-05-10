import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { useStore } from "@nanostores/react";

import { isMobile } from "react-device-detect";

import { APRModal } from "./components/modals/APRModal";
import { VSHoldModal } from "./components/modals/VSHoldModal";
import { ColumnSort } from "./components/ColumnSort";
import { Pagination } from "./components/Pagination";
import { Filters } from "./components/Filters";
import { Portfolio } from "./components/Portfolio";

import { chains } from "@stabilitydao/stability";

import {
  TimeDifferenceIndicator,
  FullPageLoader,
  ErrorMessage,
  APRtimeSwitcher,
  GridIcon,
  RowsIcon,
} from "@ui";

import {
  vaults,
  isVaultsLoaded,
  aprFilter,
  connected,
  error,
  visible,
} from "@store";

import { initFilters } from "./functions";

import {
  formatNumber,
  formatFromBigInt,
  dataSorter,
  debounce,
  cn,
} from "@utils";

import {
  SONIC_TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  DEFAULT_TABLE_PARAMS,
  SILO_POINTS,
} from "@constants";

import type {
  TVault,
  TTableColumn,
  TEarningData,
  TVaults,
  TAPRPeriod,
  TTableActiveParams,
  TVSHoldModalState,
  TDisplay,
} from "@types";

const SonicVaults = (): JSX.Element => {
  const { open } = useWeb3Modal();

  const $vaults = useStore(vaults);

  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $connected = useStore(connected);

  const $error = useStore(error);
  const $visible = useStore(visible);
  // const $currentChainID = useStore(currentChainID);
  // const $assetsPrices = useStore(assetsPrices);

  // const [tokens, setTokens] = useState<TToken[]>([]);

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
  const [displayType, setDisplayType] = useState<TDisplay>("rows");
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

      if (newValues.length > 10) {
        newValues.shift();
      }

      localStorage.setItem("searchHistory", JSON.stringify(newValues));
    }, 2000),
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
            <h2 className="font-bold text-[40px] leading-[48px] text-start mb-5">
              Vaults
            </h2>
            <h3 className="text-[#97979a] font-medium text-[20px] leading-8">
              Aggregates every active strategy across chains and protocols.
              <br />
              Explore, compare, and deposit into vaults optimized for yield,
              <br />
              auto-compounding, and multi-protocol integration—all
            </h3>
          </div>
          <APRtimeSwitcher withText={true} />
        </div>
        <Portfolio vaults={localVaults} />

        {/* <NetworkFilters
          activeNetworks={activeNetworks}
          activeNetworksHandler={activeNetworksHandler}
        /> */}
        <div className="flex items-center justify-between gap-2 mt-10 mb-4">
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
                className="text-[#97979A] w-full bg-transparent border border-[#23252A] rounded-lg transition-all duration-300 h-[48px] pl-[44px] pr-3"
                placeholder="Search asset"
                ref={search}
                onChange={() => tableHandler()}
              />
            </label>
            {searchHistory.length > 0 && (
              <ul className="absolute left-0 mt-2 w-full bg-accent-900 text-neutral-50 font-manrope rounded-2xl z-[10]">
                {searchHistory.map((text, index) => (
                  <li
                    key={text + index}
                    className={`p-2 cursor-pointer hover:bg-accent-800 ${!index ? "hover:rounded-t-2xl" : index === searchHistory.length - 1 ? "hover:rounded-b-2xl" : ""}`}
                    onClick={() => handleSearch(text)}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            allParams={allParams}
            setTableParams={setActiveTableParams}
            resetTable={resetTable}
          />
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "border border-[#2C2E33] rounded-lg cursor-pointer",
                displayType === "rows" && "bg-[#22242A]"
              )}
              onClick={() => setDisplayType("rows")}
            >
              <div className="p-3">
                <RowsIcon isActive={displayType === "rows"} />
              </div>
            </div>
            <div
              className={cn(
                "border border-[#2C2E33] rounded-lg cursor-pointer",
                displayType === "grid" && "bg-[#22242A]"
              )}
              onClick={() => setDisplayType("grid")}
            >
              <div className="p-3">
                <GridIcon isActive={displayType === "grid"} />
              </div>
            </div>
          </div>
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
        <div
          className={cn(
            displayType === "grid" && "flex items-center gap-6 flex-wrap"
          )}
        >
          {isLoading ? (
            <div className="relative h-[80px]">
              <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
                <FullPageLoader />
              </div>
            </div>
          ) : localVaults?.length ? (
            <>
              {currentTabVaults?.length ? (
                currentTabVaults.map((vault: TVault, index: number) => {
                  const aprValue = Number(vault?.earningData?.apr[$aprFilter]);

                  const apyValue = vault.earningData.apy[$aprFilter];

                  const swapFeesAPRValue =
                    vault.earningData.poolSwapFeesAPR[$aprFilter];

                  const strategyAPRValue =
                    vault.earningData.farmAPR[$aprFilter];

                  const dailyAPRValue = (
                    Number(vault?.earningData?.apr[$aprFilter]) / 365
                  ).toFixed(2);

                  const gemsAprValue = Number(
                    vault.earningData.gemsAPR[$aprFilter]
                  );

                  const isSTBLVault =
                    Array.isArray(vault?.assets) &&
                    vault.assets.some(
                      (asset) => asset?.symbol && asset?.symbol === "STBL"
                    );

                  if (displayType === "grid") {
                    return (
                      <a
                        key={vault.name + index}
                        className="bg-[#101012] cursor-pointer font-medium relative border border-[#23252A] rounded-lg w-[258px]"
                        data-testid="vault"
                        href={`/vaults/vault/${vault.network}/${vault.address}`}
                      >
                        <div className="p-6 flex flex-col gap-6">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center">
                              {vault.assets.map((asset, index) => (
                                <img
                                  src={asset?.logo}
                                  alt={asset?.symbol}
                                  className={`w-10 h-10 rounded-full ${
                                    !index &&
                                    vault.assets.length > 1 &&
                                    "mr-[-16px] z-[5]"
                                  }`}
                                  key={asset?.logo + index}
                                />
                              ))}
                            </div>

                            <div className="flex flex-col items-start gap-1">
                              <span className="font-semibold text-[16px]">
                                {vault.assetsSymbol}
                              </span>
                              <div className="flex items-center justify-center gap-1">
                                {!vault.symbol.includes("PT-") && (
                                  <div
                                    title="Sonic Activity Points"
                                    className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
                                  >
                                    <div className="flex items-center gap-1 px-2">
                                      <img
                                        src="/sonic.png"
                                        alt="sonic"
                                        className="w-4 h-4 rounded-full"
                                      />
                                      <span className="text-[12px]">
                                        x{vault.sonicActivePoints}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {SILO_POINTS[
                                  vault.address as keyof typeof SILO_POINTS
                                ] && (
                                  <div
                                    title="Silo Points per $ / day"
                                    className="rounded-[4px] border border-[#FFA500] bg-[#36280f] h-6 flex items-center justify-center"
                                  >
                                    <div className="flex items-center gap-1 px-2">
                                      <img
                                        src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                                        alt="silo"
                                        className="w-4 h-4 rounded-full"
                                      />
                                      <span className="text-[12px]">
                                        {
                                          SILO_POINTS[
                                            vault.address as keyof typeof SILO_POINTS
                                          ]
                                        }
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {!!vault.ringsPoints && (
                                  <div
                                    title="Rings Points"
                                    className="rounded-[4px] border border-[#5E6AD2] bg-[#1C1E31] h-6 flex items-center justify-center"
                                  >
                                    <div className="flex items-center gap-1 px-2">
                                      <img
                                        src="/rings.png"
                                        alt="rings"
                                        className="w-4 h-4 rounded-full"
                                      />
                                      <span className="text-[12px]">
                                        x{vault.ringsPoints}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#97979A] text-[14px]">
                                Strategy
                              </span>
                              <div className="flex items-center text-[12px]">
                                {vault.strategyInfo && (
                                  <div
                                    style={{
                                      backgroundColor:
                                        vault.strategyInfo.bgColor + "66",
                                      border: `1px solid ${vault.strategyInfo.bgColor}`,
                                    }}
                                    className="px-2 rounded-[4px] h-6 flex items-center gap-1"
                                  >
                                    <span
                                      style={{
                                        color: vault.strategyInfo.color,
                                      }}
                                      title={vault.strategyInfo.id}
                                    >
                                      {vault.strategyInfo.shortId}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="flex items-center">
                                        {vault.strategyInfo.protocols.map(
                                          (protocol, index) => (
                                            <div
                                              key={
                                                protocol.logoSrc + String(index)
                                              }
                                              className={cn(
                                                "h-4 w-4 rounded-full bg-black flex items-center justify-center",
                                                !index &&
                                                  vault.strategyInfo.protocols
                                                    .length > 1 &&
                                                  "mr-[-6px] z-[5]"
                                              )}
                                            >
                                              <img
                                                className="rounded-full"
                                                src={protocol.logoSrc}
                                                alt={protocol.name}
                                                title={protocol.name}
                                                style={{
                                                  zIndex:
                                                    vault.strategyInfo.protocols
                                                      .length - index,
                                                }}
                                              />
                                            </div>
                                          )
                                        )}
                                      </span>
                                      {vault.strategySpecific && (
                                        <span>{vault.strategySpecific}</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#97979A] text-[14px]">
                                APR
                              </span>
                              <div
                                onClick={(e) => {
                                  if (isMobile) {
                                    e.stopPropagation();
                                    setAprModal({
                                      earningData: vault.earningData,
                                      daily: vault.daily,
                                      lastHardWork: vault.lastHardWork,
                                      symbol: vault?.risk?.symbol as string,
                                      state: true,
                                      pool: vault?.pool,
                                    });
                                  }
                                }}
                                className="tooltip cursor-help"
                              >
                                <div
                                  className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
                                    vault?.risk?.isRektStrategy
                                      ? "text-[#818181]"
                                      : "text-[#eaecef]"
                                  }`}
                                >
                                  <p className="text-[14px] font-bold">
                                    {formatNumber(aprValue, "formatAPR")}%
                                  </p>
                                </div>
                                <div className="visible__tooltip">
                                  <div className="flex items-start flex-col gap-4">
                                    <div className="flex flex-col gap-1 w-full">
                                      {!!vault?.risk?.isRektStrategy && (
                                        <div className="flex flex-col items-center gap-2 mb-[10px]">
                                          <h3 className="text-[#f52a11] font-bold">
                                            {vault?.risk?.symbol} VAULT
                                          </h3>
                                          <p className="text-[12px] text-start">
                                            Rekt vault regularly incurs losses,
                                            potentially leading to rapid USD
                                            value decline, with returns
                                            insufficient to offset the losses.
                                          </p>
                                        </div>
                                      )}
                                      <div className="font-bold flex items-center justify-between">
                                        <p>Total APY</p>
                                        <p className="text-end">
                                          {formatNumber(apyValue, "formatAPR")}%
                                        </p>
                                      </div>
                                      <div className="font-bold flex items-center justify-between">
                                        <p>Total APR</p>
                                        <p className="text-end">
                                          {formatNumber(aprValue, "formatAPR")}%
                                        </p>
                                      </div>

                                      {vault?.earningData?.poolSwapFeesAPR
                                        .daily != "-" &&
                                        vault?.pool && (
                                          <div className="font-bold flex items-center justify-between">
                                            <p>Pool swap fees APR</p>
                                            <p className="text-end">
                                              {formatNumber(
                                                swapFeesAPRValue,
                                                "formatAPR"
                                              )}
                                              %
                                            </p>
                                          </div>
                                        )}
                                      <div className="font-bold flex items-center justify-between">
                                        <p>Strategy APR</p>
                                        <p className="text-end">
                                          {formatNumber(
                                            strategyAPRValue,
                                            "formatAPR"
                                          )}
                                          %
                                        </p>
                                      </div>
                                      <div className="font-bold flex items-center justify-between">
                                        <p>Daily</p>
                                        <p className="text-end">
                                          {formatNumber(
                                            dailyAPRValue,
                                            "formatAPR"
                                          )}
                                          %
                                        </p>
                                      </div>
                                      {!isSTBLVault && (
                                        <div className="font-bold flex items-center justify-between">
                                          <p>Gems APR</p>
                                          <div className="flex items-center justify-end">
                                            {formatNumber(
                                              gemsAprValue.toFixed(2),
                                              "formatAPR"
                                            )}
                                            %
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                      <p>Last Hard Work</p>
                                      <TimeDifferenceIndicator
                                        unix={vault.lastHardWork}
                                      />
                                    </div>
                                  </div>
                                  <i></i>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[14px]">
                              <span className="text-[#97979A]">TVL</span>
                              <span className="font-bold">
                                {formatNumber(vault.tvl, "abbreviate")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[14px]">
                              <span className="text-[#97979A]">Balance</span>
                              <p
                                className={`${!$visible && "blur select-none"} font-bold`}
                              >
                                {$visible
                                  ? `$${formatNumber(vault.balanceInUSD, "format")}`
                                  : "$000"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <a
                      key={vault.name + index}
                      className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center border border-[#23252A] border-b-0"
                      data-testid="vault"
                      href={`/vaults/vault/${vault.network}/${vault.address}`}
                    >
                      <div className="flex items-center w-[30%] justify-between px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center">
                            {vault.assets.map((asset, index) => (
                              <img
                                src={asset?.logo}
                                alt={asset?.symbol}
                                className={`w-8 h-8 rounded-full ${
                                  !index &&
                                  vault.assets.length > 1 &&
                                  "mr-[-8px] z-[5]"
                                }`}
                                key={asset?.logo + index}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-[16px]">
                            {vault.assetsSymbol}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1">
                          {!vault.symbol.includes("PT-") && (
                            <div
                              title="Sonic Activity Points"
                              className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
                            >
                              <div className="flex items-center gap-1 px-2">
                                <img
                                  src="/sonic.png"
                                  alt="sonic"
                                  className="w-4 h-4 rounded-full"
                                />
                                <span className="text-[12px]">
                                  x{vault.sonicActivePoints}
                                </span>
                              </div>
                            </div>
                          )}
                          {SILO_POINTS[
                            vault.address as keyof typeof SILO_POINTS
                          ] && (
                            <div
                              title="Silo Points per $ / day"
                              className="rounded-[4px] border border-[#FFA500] bg-[#36280f] h-6 flex items-center justify-center"
                            >
                              <div className="flex items-center gap-1 px-2">
                                <img
                                  src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                                  alt="silo"
                                  className="w-4 h-4 rounded-full"
                                />
                                <span className="text-[12px]">
                                  {
                                    SILO_POINTS[
                                      vault.address as keyof typeof SILO_POINTS
                                    ]
                                  }
                                </span>
                              </div>
                            </div>
                          )}

                          {!!vault.ringsPoints && (
                            <div
                              title="Rings Points"
                              className="rounded-[4px] border border-[#5E6AD2] bg-[#1C1E31] h-6 flex items-center justify-center"
                            >
                              <div className="flex items-center gap-1 px-2">
                                <img
                                  src="/rings.png"
                                  alt="rings"
                                  className="w-4 h-4 rounded-full"
                                />
                                <span className="text-[12px]">
                                  x{vault.ringsPoints}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 w-[17.5%]">
                        <div className="flex items-center text-[12px]">
                          {vault.strategyInfo && (
                            <div
                              style={{
                                backgroundColor:
                                  vault.strategyInfo.bgColor + "66",
                                border: `1px solid ${vault.strategyInfo.bgColor}`,
                              }}
                              className="px-2 rounded-[4px] h-6 flex items-center gap-1"
                            >
                              <span
                                style={{ color: vault.strategyInfo.color }}
                                title={vault.strategyInfo.id}
                              >
                                {vault.strategyInfo.shortId}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="flex items-center">
                                  {vault.strategyInfo.protocols.map(
                                    (protocol, index) => (
                                      <div
                                        key={protocol.logoSrc + String(index)}
                                        className={cn(
                                          "h-4 w-4 rounded-full bg-black flex items-center justify-center",
                                          !index &&
                                            vault.strategyInfo.protocols
                                              .length > 1 &&
                                            "mr-[-6px] z-[5]"
                                        )}
                                      >
                                        <img
                                          className="rounded-full"
                                          src={protocol.logoSrc}
                                          alt={protocol.name}
                                          title={protocol.name}
                                          style={{
                                            zIndex:
                                              vault.strategyInfo.protocols
                                                .length - index,
                                          }}
                                        />
                                      </div>
                                    )
                                  )}
                                </span>
                                {vault.strategySpecific && (
                                  <span>{vault.strategySpecific}</span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          if (isMobile) {
                            e.stopPropagation();
                            setAprModal({
                              earningData: vault.earningData,
                              daily: vault.daily,
                              lastHardWork: vault.lastHardWork,
                              symbol: vault?.risk?.symbol as string,
                              state: true,
                              pool: vault?.pool,
                            });
                          }
                        }}
                        className="px-4 w-[17.5%] tooltip cursor-help"
                      >
                        <div
                          className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
                            vault?.risk?.isRektStrategy
                              ? "text-[#818181]"
                              : "text-[#eaecef]"
                          }`}
                        >
                          <div className="flex flex-col justify-end">
                            <p className="text-[16px]">
                              {formatNumber(aprValue, "formatAPR")}%
                            </p>
                            {!!vault?.liveAPR && (
                              <p className="text-[14px] text-[#97979A]">
                                live. {vault?.liveAPR?.toFixed(2)}%
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="visible__tooltip">
                          <div className="flex items-start flex-col gap-4">
                            <div className="flex flex-col gap-1 w-full">
                              {!!vault?.risk?.isRektStrategy && (
                                <div className="flex flex-col items-center gap-2 mb-[10px]">
                                  <h3 className="text-[#f52a11] font-bold">
                                    {vault?.risk?.symbol} VAULT
                                  </h3>
                                  <p className="text-[12px] text-start">
                                    Rekt vault regularly incurs losses,
                                    potentially leading to rapid USD value
                                    decline, with returns insufficient to offset
                                    the losses.
                                  </p>
                                </div>
                              )}
                              <div className="font-bold flex items-center justify-between">
                                <p>Total APY</p>
                                <p className="text-end">
                                  {formatNumber(apyValue, "formatAPR")}%
                                </p>
                              </div>
                              <div className="font-bold flex items-center justify-between">
                                <p>Total APR</p>
                                <p className="text-end">
                                  {formatNumber(aprValue, "formatAPR")}%
                                </p>
                              </div>

                              {vault?.earningData?.poolSwapFeesAPR.daily !=
                                "-" &&
                                vault?.pool && (
                                  <div className="font-bold flex items-center justify-between">
                                    <p>Pool swap fees APR</p>
                                    <p className="text-end">
                                      {formatNumber(
                                        swapFeesAPRValue,
                                        "formatAPR"
                                      )}
                                      %
                                    </p>
                                  </div>
                                )}
                              <div className="font-bold flex items-center justify-between">
                                <p>Strategy APR</p>
                                <p className="text-end">
                                  {formatNumber(strategyAPRValue, "formatAPR")}%
                                </p>
                              </div>
                              <div className="font-bold flex items-center justify-between">
                                <p>Daily</p>
                                <p className="text-end">
                                  {formatNumber(dailyAPRValue, "formatAPR")}%
                                </p>
                              </div>
                              {!isSTBLVault && (
                                <div className="font-bold flex items-center justify-between">
                                  <p>Gems APR</p>
                                  <div className="flex items-center justify-end">
                                    {formatNumber(
                                      gemsAprValue.toFixed(2),
                                      "formatAPR"
                                    )}
                                    %
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <p>Last Hard Work</p>
                              <TimeDifferenceIndicator
                                unix={vault.lastHardWork}
                              />
                            </div>
                          </div>
                          <i></i>
                        </div>
                      </div>
                      <div className="px-4 text-right text-[16px] w-[17.5%]">
                        {formatNumber(vault.tvl, "abbreviate")}
                      </div>
                      <div className="px-4 text-right text-[16px] w-[17.5%]">
                        <p className={`${!$visible && "blur select-none"}`}>
                          {$visible
                            ? `$${formatNumber(vault.balanceInUSD, "format")}`
                            : "$000"}
                        </p>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-start h-[60px] font-medium">
                  {userVaultsCondition ? (
                    <div>
                      <p className="text-[18px]">
                        You haven't connected your wallet.
                      </p>
                      <p>Connect to view your vaults.</p>
                      <button
                        className="bg-[#30127f] text-[#fcf3f6] py-0.5 px-4 rounded-md min-w-[120px] mt-2"
                        onClick={() => open()}
                      >
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[18px]">No results found.</p>
                      <p>
                        Try clearing your filters or changing your search term.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-start h-[60px] font-medium">No vaults</div>
          )}
        </div>
        <Pagination
          pagination={pagination}
          vaults={filteredVaults}
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
      {/* <a href="/factory">
        <button className="bg-button px-3 py-2 rounded-md text-[14px] mt-3">
          Create vault
        </button>
      </a> */}
    </>
  );
};

export { SonicVaults };
