import { useState, useEffect, useRef, useMemo } from "react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

// import { formatUnits} from "viem";

import { useStore } from "@nanostores/react";

import { isMobile } from "react-device-detect";

// import { deployments } from "@stabilitydao/stability";

import { APRModal } from "./components/modals/APRModal";
import { VSHoldModal } from "./components/modals/VSHoldModal";
import { ColumnSort } from "./components/ColumnSort";
import { Pagination } from "./components/Pagination";
import { Filters } from "./components/Filters";
import { Portfolio } from "./components/Portfolio";

import { chains, deployments } from "@stabilitydao/stability";

import {
  TimeDifferenceIndicator,
  FullPageLoader,
  ErrorMessage,
  ExplorerLink,
} from "@ui";

import {
  vaults,
  isVaultsLoaded,
  aprFilter,
  connected,
  error,
  visible,
  publicClient,
  platformVersions,
  apiData,
  // platformVersions,
  // currentChainID,
  // assetsPrices,
} from "@store";

import { toVault, initFilters } from "./functions";

import {
  formatNumber,
  formatFromBigInt,
  dataSorter,
  getShortAddress,
} from "@utils";

import {
  SONIC_TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  CHAINS,
  DEFAULT_TABLE_PARAMS,
  SILO_POINTS,
  // CHAINS,
  // WBTC,
  // WETH,
  // WMATIC,
} from "@constants";

import { PlatformABI } from "@web3";

import type {
  TVault,
  TTableColumn,
  // TPendingPlatformUpgrade,
  // TAddress,
  // TUpgradesTable,
  TEarningData,
  TVaults,
  TAPRPeriod,
  TPendingPlatformUpgrade,
  TUpgradesTable,
  TAddress,
  TTableActiveParams,
  TVSHoldModalState,
} from "@types";

// type TToken = {
//   logo: string;
//   price: string;
// };

const SonicVaults = (): JSX.Element => {
  const { open } = useWeb3Modal();

  const $vaults = useStore(vaults);
  const $apiData = useStore(apiData);

  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $connected = useStore(connected);

  const $error = useStore(error);
  const $visible = useStore(visible);
  const $publicClient = useStore(publicClient);
  const $platformVersions = useStore(platformVersions);
  const $currentChainID = "146";
  // const $currentChainID = useStore(currentChainID);
  // const $assetsPrices = useStore(assetsPrices);

  // const [tokens, setTokens] = useState<TToken[]>([]);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  const [activeTableParams, setActiveTableParams] =
    useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  const [allParams, setAllParams] = useState<number>(0);

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

  const [platformUpdates, setPlatformUpdates] =
    useState<TPendingPlatformUpgrade>();

  const [lockTime, setLockTime] = useState({ start: "", end: "" });
  const [upgradesTable, setUpgradesTable] = useState<TUpgradesTable[]>([]);
  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(urlTableStates);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);
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

  const lastTabIndex = currentTab * PAGINATION_VAULTS;
  const firstTabIndex = lastTabIndex - PAGINATION_VAULTS;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  const userVaultsCondition =
    tableFilters.find((filter) => filter.name === "My vaults")?.state &&
    !$connected;

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

  const fetchPlatformUpdates = async () => {
    try {
      const pendingPlatformUpgrade: any = await $publicClient?.readContract({
        address: deployments[$currentChainID]?.core.platform,
        abi: PlatformABI,
        functionName: "pendingPlatformUpgrade",
      });
      let upgrated = [];
      if (pendingPlatformUpgrade?.proxies.length) {
        const promises = pendingPlatformUpgrade.proxies.map(
          async (proxy: TAddress, index: number) => {
            const moduleContracts = Object.keys(
              deployments[$currentChainID].core
            );
            const upgratedData = await Promise.all(
              moduleContracts.map(async (moduleContract: string) => {
                //Can't use CoreContracts type
                //@ts-ignore
                const address =
                  deployments[$currentChainID].core[moduleContract];
                if (proxy.toLowerCase() === address.toLowerCase()) {
                  const oldImplementation = await $publicClient?.readContract({
                    address: address,
                    abi: [
                      {
                        inputs: [],
                        name: "implementation",
                        outputs: [
                          {
                            internalType: "address",
                            name: "",
                            type: "address",
                          },
                        ],
                        stateMutability: "view",
                        type: "function",
                      },
                    ],
                    functionName: "implementation",
                  });
                  const oldImplementationVersion =
                    await $publicClient?.readContract({
                      address: oldImplementation,
                      abi: PlatformABI,
                      functionName: "VERSION",
                    });
                  const newImplementationVersion =
                    await $publicClient?.readContract({
                      address: pendingPlatformUpgrade.newImplementations[index],
                      abi: PlatformABI,
                      functionName: "VERSION",
                    });
                  return {
                    contract: moduleContract,
                    oldVersion: oldImplementationVersion,
                    newVersion: newImplementationVersion,
                    proxy: proxy,
                    oldImplementation: oldImplementation,
                    newImplementation:
                      pendingPlatformUpgrade.newImplementations[index],
                  };
                }
              })
            );

            return upgratedData.filter((data) => data !== undefined);
          }
        );
        upgrated = (await Promise.all(promises)).flat();
      }

      /////***** TIME CHECK  *****/////
      const lockTime: any = await $publicClient?.readContract({
        address: deployments[$currentChainID].core.platform,
        abi: PlatformABI,
        functionName: "TIME_LOCK",
      });
      const platformUpgradeTimelock: any = await $publicClient?.readContract({
        address: deployments[$currentChainID].core.platform,
        abi: PlatformABI,
        functionName: "platformUpgradeTimelock",
      });
      if (lockTime && platformUpgradeTimelock) {
        setLockTime({
          start: `${new Date(Number(platformUpgradeTimelock - lockTime) * 1000).toLocaleDateString()} ${new Date(Number(platformUpgradeTimelock - lockTime) * 1000).toLocaleTimeString()}`,
          end: `${new Date(Number(platformUpgradeTimelock) * 1000).toLocaleDateString()} ${new Date(Number(platformUpgradeTimelock) * 1000).toLocaleTimeString()}`,
        });
      }
      /////***** SET DATA  *****/////
      setUpgradesTable(upgrated);
      setPlatformUpdates(pendingPlatformUpgrade);
    } catch (error) {
      console.error("Error fetching platform updates:", error);
    }
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

  const tableHandler = (
    table: TTableColumn[] = tableStates,
    tableParams = activeTableParams
  ) => {
    if (!$vaults) return;

    const searchValue: string = String(search?.current?.value.toLowerCase());

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
                  STABLECOINS.includes(vault.assets[0].address) &&
                  STABLECOINS.includes(vault.assets[1].address)
                );
              }
              return STABLECOINS.includes(vault.assets[0].address);
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
        vault.symbol.toLowerCase().includes(searchValue) ||
        vault.assetsSymbol.toLowerCase().includes(searchValue)
    );
    // pagination upd
    if (currentTab != 1) {
      const disponibleTabs = Math.ceil(sortedVaults.length / PAGINATION_VAULTS);

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

    setActiveTableParams(_activeTableParams);
    setFilteredVaults(sortedVaults);
    setTableStates(table);
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
      /////***** AFTER PAGE LOADING *****/ /////
      if (!upgradesTable.length) {
        fetchPlatformUpdates();
      }
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

  const explorer = CHAINS.find((chain) => chain.id === "146")?.explorer;

  return (
    <>
      {!!platformUpdates?.newVersion &&
        platformUpdates?.newVersion != $platformVersions[$currentChainID] &&
        !!upgradesTable?.length && (
          <div className="p-3  mt-3 bg-accent-900 rounded-[10px]">
            <h3 className="mb-2 text-[18px] font-medium">
              Time-locked platform upgrade in progress
            </h3>
            <div className="flex gap-3 text-[14px]">
              <span className="w-[100px]">Version:</span>
              <span>
                {$platformVersions[$currentChainID]} -{">"}{" "}
                {platformUpdates.newVersion}
              </span>
            </div>
            <div className="flex gap-3 text-[14px]">
              <span className="w-[100px]">Timelock:</span>
              <span>
                {lockTime.start} -{">"} {lockTime.end}
              </span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="table table-auto w-full rounded-lg">
                <thead className="">
                  <tr className="text-[12px] text-neutral-600 uppercase whitespace-nowrap">
                    <th className="text-left">Contract</th>
                    <th className="text-left">Version</th>
                    <th className="text-left">Proxy</th>
                    <th className="text-left">Old Implementation</th>
                    <th className="text-left">New Implementation</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {!!upgradesTable.length &&
                    upgradesTable.map((upgrade) => (
                      <tr key={upgrade.contract} className="">
                        <td className="text-left min-w-[100px] capitalize">
                          <p>{upgrade.contract}</p>
                        </td>
                        <td className="text-left min-w-[100px]">
                          {upgrade.oldVersion} {"->"} {upgrade.newVersion}
                        </td>
                        {upgrade?.proxy && (
                          <td className="text-left min-w-[150px]">
                            <span className="flex items-center">
                              {getShortAddress(upgrade.proxy, 6, 4)}
                              <ExplorerLink
                                explorer={explorer || ""}
                                address={upgrade.proxy}
                              />
                            </span>
                          </td>
                        )}
                        {upgrade.oldImplementation && (
                          <td className="text-left min-w-[150px]">
                            <span className="flex items-center">
                              {getShortAddress(upgrade.oldImplementation, 6, 4)}
                              <ExplorerLink
                                explorer={explorer || ""}
                                address={upgrade.oldImplementation}
                              />
                            </span>
                          </td>
                        )}
                        {upgrade?.newImplementation && (
                          <td className="text-left min-w-[150px]">
                            <span className="flex items-center">
                              {getShortAddress(upgrade.newImplementation, 6, 4)}
                              <ExplorerLink
                                explorer={explorer || ""}
                                address={upgrade.newImplementation}
                              />
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      <div
        className={`${
          isLoading ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} />
        <Portfolio vaults={localVaults} />
        {/* <NetworkFilters
          activeNetworks={activeNetworks}
          activeNetworksHandler={activeNetworksHandler}
        /> */}
        <div className="flex items-center gap-2 flex-col min-[1440px]:flex-row font-semibold text-[14px]">
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
          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            allParams={allParams}
            setTableParams={setActiveTableParams}
            resetTable={resetTable}
          />
        </div>
      </div>

      <div className="overflow-x-auto lg:overflow-x-visible min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px]">
        <table className="table table-auto w-full select-none mb-9 min-w-[1024px] lg:min-w-full">
          <thead className="bg-accent-950">
            <tr className="text-[12px] uppercase">
              {tableStates.map((value: TTableColumn, index: number) => (
                <ColumnSort
                  key={value.name + index}
                  index={index}
                  value={value.name}
                  table={tableStates}
                  sort={tableHandler}
                />
              ))}
            </tr>
          </thead>
          <tbody className="font-manrope font-semibold text-[14px]">
            {isLoading ? (
              <tr className="relative h-[80px]">
                <td className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
                  <FullPageLoader />
                </td>
              </tr>
            ) : localVaults?.length ? (
              <>
                {currentTabVaults?.length ? (
                  currentTabVaults.map((vault: TVault, index: number) => {
                    const aprValue = Number(
                      vault?.earningData?.apr[$aprFilter]
                    );

                    let gemsAprValue = 0;

                    if (aprValue >= 0) {
                      gemsAprValue =
                        aprValue * $apiData.rewards?.gemsAprMultiplier;
                    }

                    const apyValue = vault.earningData.apy[$aprFilter];

                    const swapFeesAPRValue =
                      vault.earningData.poolSwapFeesAPR[$aprFilter];

                    const strategyAPRValue =
                      vault.earningData.farmAPR[$aprFilter];

                    const dailyAPRValue = (
                      Number(vault?.earningData?.apr[$aprFilter]) / 365
                    ).toFixed(2);

                    const isSTBLVault = !!vault.assets.find(
                      ({ symbol }) => symbol === "STBL"
                    );

                    return (
                      <tr
                        key={vault.name + index}
                        className="text-center min-[1020px]:hover:bg-accent-950 cursor-pointer h-[48px] font-medium relative"
                        onClick={() => toVault(vault.network, vault.address)}
                        data-testid="vault"
                      >
                        <td className="px-2 min-[1130px]:px-1 py-2 table-cell">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center w-[52px] justify-center">
                              {vault.assets.map((asset, index) => (
                                <img
                                  src={asset.logo}
                                  alt={asset.symbol}
                                  className={`w-6 h-6 rounded-full ${
                                    !index &&
                                    vault.assets.length > 1 &&
                                    "mr-[-10px] z-[5]"
                                  }`}
                                  key={asset.logo + index}
                                />
                              ))}
                            </div>
                            <span className="mr-2">{vault.assetsSymbol}</span>
                            <div className="flex items-center justify-center gap-1">
                              <div
                                title="Sonic Activity Points"
                                className="flex items-center rounded-full border border-[#6EBD70] bg-[#6EBD70]/[0.16] pr-[6px]"
                              >
                                <img
                                  src="/sonic.png"
                                  alt="sonic"
                                  className="w-[14px] h-[14px] rounded-full"
                                />
                                <span className="text-[10px] ml-[3px] mr-[2px]">
                                  x{vault.sonicActivePoints}
                                </span>
                              </div>

                              {SILO_POINTS[vault.address] && (
                                <div
                                  title="Silo Points per $ / day"
                                  className="flex items-center rounded-full border border-[#fff699] bg-[#fff699]/[0.16] pr-[6px]"
                                >
                                  <img
                                    src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                                    alt="silo"
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                  <span className="text-[10px] ml-[3px] mr-[2px]">
                                    {SILO_POINTS[vault.address]}
                                  </span>
                                </div>
                              )}

                              {!!vault.ringsPoints && (
                                <div
                                  title="Rings Points"
                                  className="flex items-center rounded-full border border-[#ac62e4] bg-black pr-[6px]"
                                >
                                  <img
                                    src="/rings.png"
                                    alt="rings"
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                  <span className="text-[10px] ml-[3px] mr-[2px]">
                                    x{vault.ringsPoints}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* <td className="px-2 min-[1130px]:px-1 py-2 table-cell w-[50px]">
                          <div className="flex items-center justify-center">
                            {vault?.risk?.isRektStrategy ? (
                              <div
                                className="h-5 w-5 md:w-3 md:h-3 rounded-full mr-2 bg-[#EE6A63]"
                                title={vault?.risk?.isRektStrategy as string}
                              ></div>
                            ) : (
                              <VaultState status={vault.status} />
                            )}
                          </div>
                        </td>
                        <td className="px-2 min-[1130px]:px-1 py-2 hidden xl:table-cell w-[90px]">
                          <VaultType type={vault.type} />
                        </td> */}
                        <td className="pl-2 py-2 whitespace-nowrap">
                          <div className="flex items-center border-0 rounded-[8px] pl-0 py-1 border-[#935ec2]">
                            {vault.strategyInfo && (
                              <>
                                <div
                                  style={{
                                    backgroundColor: vault.strategyInfo.bgColor,
                                    color: vault.strategyInfo.color,
                                  }}
                                  className="px-3 rounded-[10px] flex items-center  justify-start"
                                >
                                  <span
                                    className="text-[14px] w-[30px] flex justify-center"
                                    title={vault.strategyInfo.id}
                                  >
                                    {vault.strategyInfo.shortId}
                                  </span>
                                  <span
                                    className={`pl-2 flex h-8 items-center`}
                                  >
                                    <span className="min-w-[24px] flex items-center">
                                      {vault.strategyInfo.protocols.map(
                                        (protocol, index) => (
                                          <img
                                            className="h-6 w-6 mx-[2px]"
                                            key={
                                              protocol.logoSrc + String(index)
                                            }
                                            src={protocol.logoSrc}
                                            alt={protocol.name}
                                            title={protocol.name}
                                            style={{
                                              zIndex:
                                                vault.strategyInfo.protocols
                                                  .length - index,
                                            }}
                                          />
                                        )
                                      )}
                                    </span>
                                    {vault.strategySpecific && (
                                      <span
                                        className={`font-bold text-[#b6bdd7] inline ${
                                          vault.strategySpecific.length > 10
                                            ? "lowercase text-[10px] pl-[12px] whitespace-pre-wrap max-w-[70px] text-left"
                                            : "uppercase text-[10px] pl-[12px]"
                                        }`}
                                      >
                                        {vault.strategySpecific}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        <td
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
                          className="px-2 min-[1130px]:px-3 py-2 tooltip cursor-help"
                        >
                          <div
                            className={`whitespace-nowrap w-full text-end flex items-center justify-end gap-[2px] ${
                              vault?.risk?.isRektStrategy
                                ? "text-[#818181]"
                                : "text-[#eaecef]"
                            }`}
                          >
                            <p className="text-end">
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
                                      potentially leading to rapid USD value
                                      decline, with returns insufficient to
                                      offset the losses.
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
                                    {formatNumber(dailyAPRValue, "formatAPR")}%
                                  </p>
                                </div>
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
                        </td>
                        <td className="px-2 min-[1130px]:px-4 py-2 whitespace-nowrap">
                          {!isSTBLVault && (
                            <div className="flex items-center justify-end">
                              {formatNumber(
                                gemsAprValue.toFixed(2),
                                "formatAPR"
                              )}
                              %
                              <img
                                src="https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/sGEM1.png"
                                className="w-[24px] h-[24px] ml-1.5"
                                title="sGEM1"
                                alt="sGEM1"
                              />
                            </div>
                          )}
                        </td>
                        {/* <td className="px-2 min-[1130px]:px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <div
                              title="Sonic Activity Points"
                              className="flex items-center rounded-full border border-[#6EBD70] bg-[#6EBD70]/[0.16] pr-[6px]"
                            >
                              <img
                                src="/sonic.png"
                                alt="sonic"
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-[10px] ml-[3px] mr-[2px]">
                                x{vault.sonicActivePoints}
                              </span>
                            </div>

                            {SILO_POINTS[vault.address] && (
                              <div
                                title="Silo Points per $ / day"
                                className="flex items-center rounded-full border border-[#fff699] bg-[#fff699]/[0.16] pr-[6px]"
                              >
                                <img
                                  src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                                  alt="silo"
                                  className="w-5 h-5 rounded-full"
                                />
                                <span className="text-[10px] ml-[3px] mr-[2px]">
                                  {SILO_POINTS[vault.address]}
                                </span>
                              </div>
                            )}
                          </div>
                        </td> */}
                        {/* <td className="px-2 min-[1130px]:px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <RiskIndicator
                              riskSymbol={
                                vault?.risk?.isRektStrategy
                                  ? vault?.risk?.symbol
                                  : (vault.strategyInfo.il?.title as string)
                              }
                            />
                          </div>
                        </td> */}
                        <td className="px-2 min-[1130px]:px-4 py-2 text-right">
                          {formatNumber(vault.tvl, "abbreviate")}
                        </td>
                        <td className="pr-2 md:pr-3 min-[1130px]:pr-5 py-2 text-right">
                          <p className={`${!$visible && "blur select-none"}`}>
                            {$visible
                              ? `$${formatNumber(vault.balanceInUSD, "format")}`
                              : "$000"}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="text-start h-[60px] font-medium">
                    {userVaultsCondition ? (
                      <td>
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
                      </td>
                    ) : (
                      <td>
                        <p className="text-[18px]">No results found.</p>
                        <p>
                          Try clearing your filters or changing your search
                          term.
                        </p>
                      </td>
                    )}
                  </tr>
                )}
              </>
            ) : (
              <tr className="text-start h-[60px] font-medium">
                <td>No vaults</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        vaults={filteredVaults}
        tab={currentTab}
        setTab={setCurrentTab}
      />
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
