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
import { NetworkFilters } from "./components/NetworksFilter";

import {
  TimeDifferenceIndicator,
  FullPageLoader,
  ErrorMessage,
  RiskIndicator,
} from "@ui";

import {
  vaults,
  isVaultsLoaded,
  aprFilter,
  connected,
  error,
  visible,
  // platformVersions,
  // currentChainID,
  // assetsPrices,
} from "@store";

import { toVault, initFilters } from "./functions";

import {
  formatNumber,
  formatFromBigInt,
  getTimeDifference,
  dataSorter,
  // getDate,
  // getTokenData,
} from "@utils";

import {
  TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  CHAINS,
  // WBTC,
  // WETH,
  // WMATIC,
} from "@constants";

// import { platforms, PlatformABI } from "@web3";

import type {
  TVault,
  TTableColumn,
  THoldData,
  // TPendingPlatformUpgrade,
  // TAddress,
  // TUpgradesTable,
  TEarningData,
  TVaults,
  TAPRPeriod,
} from "@types";

// type TToken = {
//   logo: string;
//   price: string;
// };

type TVSHoldModalState = {
  assetsVsHold: THoldData[];
  lifetimeVsHold: number;
  vsHoldAPR: number;
  created: number;
  state: boolean;
  isVsActive: boolean;
};

const Vaults = (): JSX.Element => {
  const { open } = useWeb3Modal();

  const $vaults = useStore(vaults);

  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $connected = useStore(connected);

  const $error = useStore(error);
  const $visible = useStore(visible);
  // const $publicClient = useStore(publicClient);
  // const $platformVersions = useStore(platformVersions);
  // const $currentChainID = useStore(currentChainID);
  // const $assetsPrices = useStore(assetsPrices);

  // const [tokens, setTokens] = useState<TToken[]>([]);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  let urlTab = 1;

  let urlTableStates = TABLE;

  if (!!Number(params.get("page"))) {
    urlTab = Number(params.get("page"));
  }

  if (params.get("sort")) {
    const [paramName, paramType] = params.get("sort")?.split("-") as string[];

    const indexOfState = urlTableStates.findIndex(
      ({ name }) => name.toUpperCase() === paramName.toUpperCase()
    );

    if (indexOfState != -1) {
      urlTableStates[indexOfState].sortType = paramType;
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

  // const [platformUpdates, setPlatformUpdates] =
  //   useState<TPendingPlatformUpgrade>();

  // const [lockTime, setLockTime] = useState({ start: "", end: "" });
  // const [upgradesTable, setUpgradesTable] = useState<TUpgradesTable[]>([]);

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(TABLE);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);
  const [activeNetworks, setActiveNetworks] = useState(CHAINS);

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

  // const fetchPlatformUpdates = async () => {
  //   try {
  //     const pendingPlatformUpgrade: any = await $publicClient?.readContract({
  //       address: platforms[$currentChainID],
  //       abi: PlatformABI,
  //       functionName: "pendingPlatformUpgrade",
  //     });
  //     let upgrated = [];
  //     if (pendingPlatformUpgrade?.proxies.length) {
  //       const promises = pendingPlatformUpgrade.proxies.map(
  //         async (proxy: TAddress, index: number) => {
  //           const moduleContracts = Object.keys(deployments[$currentChainID]);
  //           const upgratedData = await Promise.all(
  //             moduleContracts.map(async (moduleContract: string) => {
  //               //Can't use CoreContracts type
  //               //@ts-ignore
  //               const address = deployments[$currentChainID][moduleContract];
  //               if (proxy === address) {
  //                 const oldImplementation = await $publicClient?.readContract({
  //                   address: address,
  //                   abi: [
  //                     {
  //                       inputs: [],
  //                       name: "implementation",
  //                       outputs: [
  //                         {
  //                           internalType: "address",
  //                           name: "",
  //                           type: "address",
  //                         },
  //                       ],
  //                       stateMutability: "view",
  //                       type: "function",
  //                     },
  //                   ],
  //                   functionName: "implementation",
  //                 });
  //                 const oldImplementationVersion =
  //                   await $publicClient?.readContract({
  //                     address: oldImplementation,
  //                     abi: PlatformABI,
  //                     functionName: "VERSION",
  //                   });
  //                 const newImplementationVersion =
  //                   await $publicClient?.readContract({
  //                     address: pendingPlatformUpgrade.newImplementations[index],
  //                     abi: PlatformABI,
  //                     functionName: "VERSION",
  //                   });
  //                 return {
  //                   contract: moduleContract,
  //                   oldVersion: oldImplementationVersion,
  //                   newVersion: newImplementationVersion,
  //                   proxy: proxy,
  //                   oldImplementation: oldImplementation,
  //                   newImplementation:
  //                     pendingPlatformUpgrade.newImplementations[index],
  //                 };
  //               }
  //             })
  //           );
  //           return upgratedData.filter((data) => data !== undefined);
  //         }
  //       );
  //       upgrated = (await Promise.all(promises)).flat();
  //     }

  //     /////***** TIME CHECK  *****/////
  //     const lockTime: any = await $publicClient?.readContract({
  //       address: platforms[$currentChainID],
  //       abi: PlatformABI,
  //       functionName: "TIME_LOCK",
  //     });
  //     const platformUpgradeTimelock: any = await $publicClient?.readContract({
  //       address: platforms[$currentChainID],
  //       abi: PlatformABI,
  //       functionName: "platformUpgradeTimelock",
  //     });
  //     if (lockTime && platformUpgradeTimelock) {
  //       setLockTime({
  //         start: getDate(Number(platformUpgradeTimelock - lockTime)),
  //         end: getDate(Number(platformUpgradeTimelock)),
  //       });
  //     }
  //     /////***** SET DATA  *****/////
  //     setUpgradesTable(upgrated);
  //     setPlatformUpdates(pendingPlatformUpgrade);
  //   } catch (error) {
  //     console.error("Error fetching platform updates:", error);
  //   }
  // };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
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

    setFilteredVaults(sortedVaults);
    setTableStates(table);
  };

  const initVaults = async () => {
    if ($vaults) {
      const mixedVaults: TVaults = Object.values($vaults).reduce<TVaults>(
        (acc, value) => {
          return { ...acc, ...(value as TVaults) };
        },
        {}
      );

      const vaults: TVault[] = Object.values(mixedVaults)
        .sort((a: TVault, b: TVault) => Number(b.tvl) - Number(a.tvl))
        .map((vault) => {
          const balance = formatFromBigInt(vault.balance, 18);

          return {
            ...vault,
            balanceInUSD: balance * Number(vault.shareprice),
          };
        });

      initFilters(vaults, tableFilters, setTableFilters, activeNetworksHandler);
      setLocalVaults(vaults);

      setFilteredVaults(vaults);
      setIsLocalVaultsLoaded(true);
      /////***** AFTER PAGE LOADING *****/ /////
      // if (!upgradesTable.length) {
      //   fetchPlatformUpdates();
      // }
    }
  };
  // useEffect(() => {
  //   if ($assetsPrices) {
  //     const BTC_LOGO = getTokenData(WBTC[0])?.logoURI as string;
  //     const ETH_LOGO = getTokenData(WETH[0])?.logoURI as string;
  //     const MATIC_LOGO = getTokenData(WMATIC[0])?.logoURI as string;

  //     const BTC_PRICE = formatNumber(
  //       formatUnits($assetsPrices[WBTC[0]], 18),
  //       "formatWithoutDecimalPart"
  //     ) as string;

  //     const ETH_PRICE = formatNumber(
  //       formatUnits($assetsPrices[WETH[0]], 18),
  //       "formatWithoutDecimalPart"
  //     ) as string;

  //     const MATIC_PRICE = formatNumber(
  //       formatUnits($assetsPrices[WMATIC[0]], 18),
  //       "format"
  //     ) as string;

  //     setTokens([
  //       { logo: BTC_LOGO, price: BTC_PRICE },
  //       { logo: ETH_LOGO, price: ETH_PRICE },
  //       { logo: MATIC_LOGO, price: MATIC_PRICE },
  //     ]);
  //   }
  // }, [$assetsPrices]);

  useEffect(() => {
    tableHandler();
  }, [tableFilters, activeNetworks]);

  useEffect(() => {
    initVaults();
  }, [$vaults, $isVaultsLoaded]);

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
        <ErrorMessage type={$error.type} isAlert={true} />
        <Portfolio vaults={localVaults} />
        <NetworkFilters
          activeNetworks={activeNetworks}
          activeNetworksHandler={activeNetworksHandler}
        />
        <div className="flex items-center gap-2 flex-col lg:flex-row font-semibold text-[14px]">
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
          <Filters filters={tableFilters} setFilters={setTableFilters} />
        </div>
      </div>

      <div className="overflow-x-auto min-[1020px]:overflow-x-visible min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px]">
        <table className="table table-auto w-full select-none mb-9 min-w-[730px] md:min-w-full">
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
                    const network = CHAINS.find(
                      (chain) => chain.id === vault.network
                    );

                    const aprValue = vault?.earningData?.apr[$aprFilter];

                    const apyValue = vault.earningData.apy[$aprFilter];

                    const swapFeesAPRValue =
                      vault.earningData.poolSwapFeesAPR[$aprFilter];

                    const strategyAPRValue =
                      vault.earningData.farmAPR[$aprFilter];

                    const dailyAPRValue = (
                      Number(vault?.earningData?.apr[$aprFilter]) / 365
                    ).toFixed(2);

                    return (
                      <tr
                        key={vault.name + index}
                        className="text-center min-[1020px]:hover:bg-accent-950 cursor-pointer h-[48px] font-medium relative"
                        onClick={() => toVault(vault.network, vault.address)}
                        data-testid="vault"
                      >
                        <td className="min-[1020px]:px-2 min-[1130px]:px-3 py-2 text-center sticky min-[1020px]:relative left-0 min-[1020px]:table-cell bg-accent-950 min-[1020px]:bg-transparent z-10">
                          <div className="flex items-center min-[1020px]:ml-0 ml-[18px]">
                            {/* {vault?.risk?.isRektStrategy ? (
                                <div
                                  className="h-5 w-5 md:w-3 md:h-3 rounded-full mr-2 bg-[#EE6A63]"
                                  title={vault?.risk?.isRektStrategy as string}
                                ></div>
                              ) : (
                                <VaultState status={vault.status} />
                              )} */}
                            <div className="relative mr-[6px] hidden min-[1020px]:block">
                              <img
                                src={network?.logoURI}
                                alt={network?.name}
                                className="h-4 w-4 rounded-full absolute left-[-15%] top-[-15%]"
                              />
                              <img
                                src={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
                                alt="logo"
                                className="w-6 h-6 rounded-full"
                              />
                            </div>

                            <div className="max-w-[150px] min-[1020px]:max-w-[250px] flex items-start flex-col text-[#eaecef]">
                              <p
                                title={vault.name}
                                className={`whitespace-nowrap text-[12px] md:text-[14px] ${
                                  vault?.risk?.isRektStrategy
                                    ? "text-[#818181]"
                                    : "text-[#fff]"
                                }`}
                                style={{ color: vault.strategyInfo.color }}
                              >
                                {vault.symbol}
                              </p>
                              <p className="min-[1130px]:hidden text-[#848e9c]">
                                {vault.strategyInfo.shortId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 min-[1130px]:px-1 py-2 table-cell">
                          <div className="flex items-center">
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
                            <span>{vault.assetsSymbol}</span>
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
                        <td className="pl-2 py-2 hidden min-[1340px]:table-cell whitespace-nowrap">
                          <div className="flex items-center border-0 rounded-[8px] pl-0 py-1 border-[#935ec2]">
                            {vault.strategyInfo && (
                              <>
                                <span
                                  className={`px-2 rounded-[10px] hidden min-[1020px]:flex h-8 items-center ${
                                    (vault.strategySpecific &&
                                      vault.strategyInfo.shortId != "Y") ||
                                    vault.strategyInfo.protocols.length > 2
                                      ? "min-w-[100px] w-[170px]"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`flex ${
                                      vault.yearnProtocols.length ||
                                      vault.strategyInfo.shortId === "CF"
                                        ? ""
                                        : "min-w-[50px]"
                                    }`}
                                  >
                                    {vault.strategyInfo.protocols.map(
                                      (protocol, index) => (
                                        <img
                                          className="h-6 w-6 rounded-full mx-[2px]"
                                          key={protocol.logoSrc + String(index)}
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
                                  {vault.yearnProtocols.length ? (
                                    <div className="flex">
                                      {vault.yearnProtocols.map((protocol) => (
                                        <img
                                          key={protocol.link}
                                          src={protocol.link}
                                          alt={protocol.title}
                                          title={protocol.title}
                                          className="h-6 w-6 rounded-full mx-[2px]"
                                        />
                                      ))}
                                    </div>
                                  ) : vault.strategySpecific ? (
                                    <span
                                      className={`font-bold rounded-[4px] text-[#b6bdd7] hidden min-[1130px]:inline ${
                                        vault.strategySpecific.length > 10
                                          ? "lowercase  text-[9px] pl-[6px] whitespace-pre-wrap max-w-[70px] text-left"
                                          : "uppercase  text-[9px] px-[6px]"
                                      }`}
                                    >
                                      {vault.strategySpecific}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </span>
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
                            <p className="text-end">{aprValue}%</p>
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
                                  <p className="text-end">{apyValue}%</p>
                                </div>
                                <div className="font-bold flex items-center justify-between">
                                  <p>Total APR</p>
                                  <p className="text-end">{aprValue}%</p>
                                </div>

                                {vault?.earningData?.poolSwapFeesAPR.daily !=
                                  "-" &&
                                  vault?.pool && (
                                    <div className="font-bold flex items-center justify-between">
                                      <p>Pool swap fees APR</p>
                                      <p className="text-end">
                                        {swapFeesAPRValue}%
                                      </p>
                                    </div>
                                  )}
                                <div className="font-bold flex items-center justify-between">
                                  <p>Strategy APR</p>
                                  <p className="text-end">
                                    {strategyAPRValue}%
                                  </p>
                                </div>
                                <div className="font-bold flex items-center justify-between">
                                  <p>Daily</p>
                                  <p className="text-end">{dailyAPRValue}%</p>
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
                        <td
                          onClick={(e) => {
                            if (isMobile) {
                              e.stopPropagation();
                              setVsHoldModal({
                                assetsVsHold: vault.assetsVsHold as THoldData[],
                                lifetimeVsHold: vault.lifetimeVsHold,
                                vsHoldAPR: vault.vsHoldAPR,
                                created: getTimeDifference(vault.created)?.days,
                                state: true,
                                isVsActive: vault.isVsActive,
                              });
                            }
                          }}
                          className="px-2 min-[1130px]:px-3 py-2 tooltip cursor-help"
                        >
                          <p
                            className={`whitespace-nowrap w-full text-end flex items-center justify-end gap-[2px] ${
                              vault.vsHoldAPR < 0 &&
                              getTimeDifference(vault.created).days >= 3 &&
                              "text-[#eb7979]"
                            }`}
                          >
                            {getTimeDifference(vault.created).days >= 3
                              ? `${vault.vsHoldAPR}%`
                              : "-"}
                          </p>

                          <div className="visible__tooltip !w-[450px]">
                            <table className="table table-auto w-full rounded-lg">
                              <thead className="bg-[#0b0e11]">
                                <tr className="text-[16px] text-[#8f8f8f] uppercase">
                                  <th></th>
                                  <th>
                                    {getTimeDifference(vault.created).days} days
                                  </th>
                                  <th className="text-right">est Annual</th>
                                </tr>
                              </thead>
                              <tbody data-testid="vsHoldAPRTable">
                                <tr className="hover:bg-[#2B3139]">
                                  <td className="text-left">VAULT VS HODL</td>

                                  {vault.isVsActive ? (
                                    <td
                                      className={`text-right ${
                                        vault.lifetimeVsHold < 0 &&
                                        "text-[#eb7979]"
                                      }`}
                                    >
                                      {vault.lifetimeVsHold}%
                                    </td>
                                  ) : (
                                    <td className="text-right">-</td>
                                  )}

                                  {vault.isVsActive ? (
                                    <td
                                      className={`text-right ${
                                        vault.vsHoldAPR < 0 && "text-[#eb7979]"
                                      }`}
                                    >
                                      {vault.vsHoldAPR}%
                                    </td>
                                  ) : (
                                    <td className="text-right">-</td>
                                  )}
                                </tr>

                                {vault.assetsVsHold.map(
                                  (aprsData: THoldData, index: number) => (
                                    <tr
                                      key={aprsData?.symbol + index}
                                      className="hover:bg-[#2B3139]"
                                    >
                                      <td className="text-left">
                                        VAULT VS {aprsData?.symbol} HODL
                                      </td>

                                      {vault.isVsActive ? (
                                        <td
                                          className={`text-right ${
                                            Number(aprsData.latestAPR) < 0 &&
                                            "text-[#eb7979]"
                                          }`}
                                        >
                                          {aprsData.latestAPR}%
                                        </td>
                                      ) : (
                                        <td className="text-right">-</td>
                                      )}

                                      {vault.isVsActive ? (
                                        <td
                                          className={`text-right ${
                                            Number(aprsData.latestAPR) < 0 &&
                                            "text-[#eb7979]"
                                          }`}
                                        >
                                          {aprsData.APR}%
                                        </td>
                                      ) : (
                                        <td className="text-right">-</td>
                                      )}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                            <i></i>
                          </div>
                        </td>
                        <td className="px-2 min-[1130px]:px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <RiskIndicator
                              riskSymbol={
                                vault?.risk?.isRektStrategy
                                  ? vault?.risk?.symbol
                                  : (vault.strategyInfo.il?.title as string)
                              }
                            />
                          </div>
                        </td>
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
        data={filteredVaults}
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

export { Vaults };
