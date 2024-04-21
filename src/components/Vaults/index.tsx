import { useState, useEffect, useRef } from "react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

// import { formatUnits } from "viem";

import { useStore } from "@nanostores/react";

import { APRModal } from "./APRModal";
import { ColumnSort } from "./ColumnSort";
import { Pagination } from "./Pagination";
import { Filters } from "./Filters";
import { Portfolio } from "./Portfolio";
import {
  VaultType,
  AssetsProportion,
  VaultState,
  TimeDifferenceIndicator,
  Loader,
  ErrorMessage,
} from "@components";

import {
  vaults,
  isVaultsLoaded,
  hideFeeApr,
  error,
  aprFilter,
  connected,
  // assetsPrices,
} from "@store";

import {
  formatNumber,
  getStrategyShortName,
  formatFromBigInt,
  // getTokenData,
} from "@utils";

import {
  TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  // WBTC,
  // WETH,
  // WMATIC,
} from "@constants";
import type {
  TVault,
  TTableColumn,
  TTableFilters,
  TTAbleFiltersVariant,
} from "@types";

// type TToken = {
//   logo: string;
//   price: string;
// };

const Vaults = () => {
  const { open } = useWeb3Modal();

  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $error = useStore(error);
  const $hideFeeAPR = useStore(hideFeeApr);
  const $aprFilter = useStore(aprFilter);
  const $connected = useStore(connected);
  // const $assetsPrices = useStore(assetsPrices);

  // const [tokens, setTokens] = useState<TToken[]>([]);

  const search: React.RefObject<HTMLInputElement> = useRef(null);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [aprModal, setAprModal] = useState({
    earningData: "",
    daily: 0,
    lastHardWork: 0,
    symbol: "",
    state: false,
  });

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(1);

  const [tableStates, setTableStates] = useState(TABLE);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);

  const lastTabIndex = currentTab * PAGINATION_VAULTS;
  const firstTabIndex = lastTabIndex - PAGINATION_VAULTS;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  const userVaultsCondition =
    tableFilters.find((filter) => filter.name === "My vaults")?.state &&
    !$connected;

  const toVault = (address: string) => {
    window.location.href = `/vault/${address}`;
  };

  const compareHandler = (
    a: any,
    b: any,
    dataType: string,
    sortOrder: string
  ) => {
    if (dataType === "number") {
      return sortOrder === "ascendentic"
        ? Number(a) - Number(b)
        : Number(b) - Number(a);
    }
    if (dataType === "string") {
      return sortOrder === "ascendentic"
        ? a.localeCompare(b)
        : b.localeCompare(a);
    }
    return 0;
  };

  const setURLFilters = (filters: TTableFilters[]) => {
    const searchParams = new URLSearchParams(window.location.search);

    const tagsParam = searchParams.get("tags");
    const strategyParam = searchParams.get("strategy");
    const vaultsParam = searchParams.get("vaults");
    const statusParam = searchParams.get("status");

    if (tagsParam) {
      filters = filters.map((f) =>
        f.name.toLowerCase() === tagsParam ? { ...f, state: true } : f
      );
    }
    if (strategyParam) {
      filters = filters.map((f) => {
        return f.name.toLowerCase() === "strategy"
          ? {
              ...f,
              variants:
                f.variants?.map((variant: TTAbleFiltersVariant) => {
                  return variant.name.toLowerCase() ===
                    strategyParam.toLowerCase()
                    ? { ...variant, state: true }
                    : { ...variant, state: false };
                }) || [],
            }
          : f;
      });
    }
    if (vaultsParam) {
      filters = filters.map((f) => {
        if (f.name.toLowerCase() === "my vaults") {
          return vaultsParam === "my"
            ? { ...f, state: true }
            : { ...f, state: false };
        }
        return f;
      });
    }
    if (statusParam) {
      filters = filters.map((f) => {
        if (f.name.toLowerCase() === "active") {
          return statusParam === "active"
            ? { ...f, state: true }
            : { ...f, state: false };
        }
        return f;
      });
    }
    setTableFilters(filters);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    const searchValue: string = String(search?.current?.value.toLowerCase());

    let sortedVaults = localVaults;

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
          //       (vault: TVault) => vault.strategyInfo.shortName === strategyName
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
              (vault: TVault) => vault.status === 1
            );
          }
          break;
        case "dropdown":
          if (!f.variants) break;
          if (f.name === "Strategy") {
            const strategyName = f.variants.find(
              (variant: TTAbleFiltersVariant) => variant.state
            )?.name;
            if (strategyName) {
              sortedVaults = sortedVaults.filter(
                (vault: TVault) => vault.strategyInfo.shortName === strategyName
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
        sortedVaults = [...sortedVaults].sort((a, b) =>
          compareHandler(
            a[state.keyName as keyof TVault],
            b[state.keyName as keyof TVault],
            state.dataType,
            state.sortType
          )
        );
      }
    });
    //search
    sortedVaults = sortedVaults.filter((vault: TVault) =>
      vault.symbol.toLowerCase().includes(searchValue)
    );
    // pagination upd
    if (currentTab != 1) {
      setCurrentTab(1);
    }

    setFilteredVaults(sortedVaults);
    setTableStates(table);
  };

  const initFilters = (vaults: TVault[]) => {
    let shortNames: any[] = [
      ...new Set(vaults.map((vault) => vault.strategyInfo.shortName)),
    ];

    shortNames = shortNames.map((name: string) => ({
      name: name,
      state: false,
    }));

    const newFilters = tableFilters.map((f) =>
      f.name === "Strategy" ? { ...f, variants: shortNames } : f
    );
    setURLFilters(newFilters);
  };

  const initVaults = async () => {
    if ($vaults) {
      const vaults: TVault[] = Object.values($vaults);
      vaults.sort((a: TVault, b: TVault) => parseInt(b.tvl) - parseInt(a.tvl));

      initFilters(vaults);
      setLocalVaults(vaults);

      setFilteredVaults(vaults);
      setIsLocalVaultsLoaded(true);
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
  }, [tableFilters]);

  useEffect(() => {
    initVaults();
  }, [$vaults]);
  if ($error.state && $error.type === "API") {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ErrorMessage type="API" />
      </div>
    );
  }

  return !$isVaultsLoaded || !isLocalVaultsLoaded ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader width="100" height="100" />
    </div>
  ) : localVaults?.length ? (
    <>
      <ErrorMessage type="WEB3" />
      <Portfolio vaults={localVaults} />
      {/* <div className="flex items-center gap-5 p-2 flex-wrap">
        {!!tokens &&
          tokens.map((token) => (
            <div key={token.logo} className="flex items-center gap-2">
              <img
                src={token.logo}
                alt="logo"
                className="w-6 h-6 rounded-full"
              />
              <p className="text-[#848e9c] text-[18px]">${token.price}</p>
            </div>
          ))}
      </div> */}
      <div className="flex items-center gap-2 flex-col lg:flex-row text-[14px]">
        <input
          type="text"
          className="mt-1 lg:mt-0 w-full bg-button outline-none pl-3 py-[3px] rounded-[4px] border-[2px] border-[#3d404b] focus:border-[#6376AF] transition-all duration-300 h-[30px]"
          placeholder="Search"
          ref={search}
          onChange={() => tableHandler()}
        />
        <Filters filters={tableFilters} setFilters={setTableFilters} />
      </div>

      <div className="overflow-x-auto md:overflow-x-visible">
        <table className="table table-auto w-full rounded-lg select-none mb-9 min-w-[730px]">
          <thead className="bg-[#0b0e11]">
            <tr className="text-[12px] text-[#8f8f8f] uppercase">
              {tableStates.map((value: any, index: number) => (
                <ColumnSort
                  key={value.name}
                  index={index}
                  value={value.name}
                  table={tableStates}
                  type="table"
                  sort={tableHandler}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTabVaults?.length ? (
              currentTabVaults.map((vault: TVault) => {
                return (
                  <tr
                    key={vault.name}
                    className="text-center text-[14px] md:hover:bg-[#2B3139] cursor-pointer h-[60px] font-medium"
                    onClick={() => toVault(vault.address)}
                  >
                    <td className="md:px-2 min-[1130px]:px-3 py-2 min-[1130px]:py-3 text-center w-[150px] md:w-[270px] min-[860px]:w-[300px] sticky md:relative left-0 md:block bg-[#181A20] md:bg-transparent z-10 min-[1130px]:mt-2">
                      <div className="flex items-center justify-start">
                        <div className="hidden md:block">
                          {vault?.risk?.isRektStrategy ? (
                            <div
                              className="h-5 w-5 md:w-3 md:h-3 rounded-full mr-2 bg-[#EE6A63]"
                              title={vault?.risk?.isRektStrategy as string}
                            ></div>
                          ) : (
                            <VaultState status={vault.status} />
                          )}
                        </div>
                        {vault.assets && (
                          <AssetsProportion
                            proportions={vault.assetsProportions as number[]}
                            assets={vault.assets}
                            type="vaults"
                          />
                        )}
                        <div className="max-w-[150px] md:max-w-[250px] flex items-start flex-col text-[#eaecef]">
                          <p
                            title={vault.name}
                            className={`whitespace-nowrap text-[12px] md:text-[15px] ${
                              vault?.risk?.isRektStrategy
                                ? "text-[#818181]"
                                : "text-[#fff]"
                            }`}
                          >
                            {vault.symbol}
                          </p>
                          <p className="min-[1130px]:hidden text-[#848e9c]">
                            {vault.type}
                          </p>
                          <p className="min-[1130px]:hidden text-[#848e9c]">
                            {getStrategyShortName(vault.symbol)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 min-[1130px]:px-1 py-2 table-cell md:hidden w-[60px]">
                      <div className="flex items-center justify-center">
                        <VaultState status={vault.status} />
                      </div>
                    </td>
                    {/* <td className="px-2 min-[1130px]:px-1 py-2 hidden xl:table-cell w-[90px]">
                    <VaultType type={vault.type} />
                  </td> */}
                    <td className="pl-2 py-2 hidden min-[1130px]:table-cell whitespace-nowrap w-[250px]">
                      <div className="flex items-center border-0 rounded-[8px] pl-0 py-1 border-[#935ec2]">
                        {vault.strategyInfo && (
                          <>
                            <span
                              style={{
                                backgroundColor: vault.strategyInfo.bgColor,
                                color: vault.strategyInfo.color,
                              }}
                              className="px-2 rounded-l-[10px] font-bold text-[#ffffff] text-[15px] flex h-8 items-center justify-center w-[58px]"
                              title={vault.strategyInfo.name}
                            >
                              {vault.strategyInfo.shortName}
                            </span>
                            <span
                              className={`px-2 rounded-r-[10px] bg-[#1f1d40] hidden md:flex h-8 items-center ${
                                vault.strategySpecific ||
                                vault.strategyInfo.protocols.length > 2
                                  ? "min-w-[100px] w-[170px]"
                                  : ""
                              }`}
                            >
                              <span className="flex min-w-[50px]">
                                {vault.strategyInfo.protocols.map(
                                  (protocol, index) => (
                                    <img
                                      className="h-6 w-6 rounded-full mx-[2px]"
                                      key={index}
                                      src={protocol.logoSrc}
                                      alt={protocol.name}
                                      title={protocol.name}
                                      style={{
                                        zIndex:
                                          vault.strategyInfo.protocols.length -
                                          index,
                                      }}
                                    />
                                  )
                                )}
                              </span>
                              {/* <span className="flex">
                              {vault.strategyInfo.features.map(
                                (feature, i) => (
                                  <img
                                    key={i}
                                    title={feature.name}
                                    alt={feature.name}
                                    className="w-6 h-6 ml-1"
                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                      feature.svg
                                    )}`}
                                  />
                                )
                              )}
                            </span> */}
                              {vault.strategySpecific && (
                                <span
                                  className={`font-bold rounded-[4px] text-[#b6bdd7] hidden min-[1130px]:inline ${
                                    vault.strategySpecific.length > 10
                                      ? "lowercase  text-[9px] pl-[6px] whitespace-pre-wrap max-w-[70px] text-left"
                                      : "uppercase  text-[9px] px-[6px]"
                                  }`}
                                >
                                  {vault.strategySpecific}
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-2 min-[1130px]:px-3 py-2 tooltip cursor-help w-[150px] md:w-[80px] min-[915px]:w-[160px]">
                      <div
                        className={`text-[14px] whitespace-nowrap w-full md:w-[60px] min-[915px]:w-[120px] text-end dotted-underline flex items-center justify-end gap-[2px] ${
                          vault?.risk?.isRektStrategy
                            ? "text-[#818181]"
                            : "text-[#eaecef]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAprModal({
                            earningData: vault.earningData,
                            daily: vault.daily,
                            lastHardWork: vault.lastHardWork as any,
                            symbol: vault?.risk?.symbol as string,
                            state: true,
                          });
                        }}
                      >
                        <p>
                          {$hideFeeAPR
                            ? $aprFilter === "24h"
                              ? vault.earningData.apr.withoutFees.daily
                              : $aprFilter === "week"
                              ? vault.earningData.apr.withoutFees.weekly
                              : vault.earningData.apr.withoutFees[$aprFilter]
                            : $aprFilter === "24h"
                            ? vault.earningData.apr.withFees.daily
                            : $aprFilter === "week"
                            ? vault.earningData.apr.withFees.weekly
                            : vault.earningData.apr.withFees[$aprFilter]}
                          %
                        </p>
                      </div>
                      <div className="visible__tooltip">
                        <div className="flex items-start flex-col gap-4">
                          <div className="text-[14px] flex flex-col gap-1 w-full">
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
                                {$hideFeeAPR
                                  ? $aprFilter === "24h"
                                    ? vault.earningData.apy.withoutFees.daily
                                    : $aprFilter === "week"
                                    ? vault.earningData.apy.withoutFees.weekly
                                    : vault.earningData.apy.withFees[$aprFilter]
                                  : $aprFilter === "24h"
                                  ? vault.earningData.apy.withFees.daily
                                  : $aprFilter === "week"
                                  ? vault.earningData.apy.withFees.weekly
                                  : vault.earningData.apy.withFees[$aprFilter]}
                                %
                              </p>
                            </div>
                            <div className="font-bold flex items-center justify-between">
                              <p>Total APR</p>
                              <p className="text-end">
                                {$hideFeeAPR
                                  ? $aprFilter === "24h"
                                    ? vault.earningData.apr.withoutFees.daily
                                    : $aprFilter === "week"
                                    ? vault.earningData.apr.withoutFees.weekly
                                    : vault.earningData.apr.withoutFees[
                                        $aprFilter
                                      ]
                                  : $aprFilter === "24h"
                                  ? vault.earningData.apr.withFees.daily
                                  : $aprFilter === "week"
                                  ? vault.earningData.apr.withFees.weekly
                                  : vault.earningData.apr.withFees[$aprFilter]}
                                %
                              </p>
                            </div>

                            {vault?.earningData?.poolSwapFeesAPR.daily !=
                              "-" && (
                              <div className="font-bold flex items-center justify-between">
                                <p>Pool swap fees APR</p>
                                <p
                                  className={`${
                                    $hideFeeAPR && "line-through"
                                  } text-end`}
                                >
                                  {$aprFilter === "24h"
                                    ? vault.earningData.poolSwapFeesAPR.daily
                                    : $aprFilter === "week"
                                    ? vault.earningData.poolSwapFeesAPR.weekly
                                    : vault.earningData.poolSwapFeesAPR[
                                        $aprFilter
                                      ]}
                                  %
                                </p>
                              </div>
                            )}
                            <div className="font-bold flex items-center justify-between">
                              <p>Strategy APR</p>
                              <p className="text-end">
                                {$aprFilter === "24h"
                                  ? vault.earningData.farmAPR.daily
                                  : $aprFilter === "week"
                                  ? vault.earningData.farmAPR.weekly
                                  : vault.earningData.farmAPR[$aprFilter]}
                                %
                              </p>
                            </div>
                            <div className="font-bold flex items-center justify-between">
                              <p>Daily</p>
                              <p className="text-end">
                                {$hideFeeAPR
                                  ? vault.earningData.apr.withoutFees.daily
                                  : vault.earningData.apr.withFees.daily}
                                %
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <p className="text-[16px]">Last Hard Work</p>
                            <TimeDifferenceIndicator
                              unix={vault.lastHardWork}
                            />
                          </div>
                        </div>
                        <i></i>
                      </div>
                    </td>
                    {/* <td className="px-2 min-[1130px]:px-3 py-2 w-[150px] md:w-[80px] min-[915px]:w-[160px]">
                      <p className="text-[14px] whitespace-nowrap w-full md:w-[60px] min-[915px]:w-[120px] text-end flex items-center justify-end gap-[2px] text-[#eaecef]">
                        123%
                      </p>
                    </td> */}
                    <td className="px-2 min-[1130px]:px-4 py-2 text-start w-[60px] md:w-[100px]">
                      {vault?.risk?.isRektStrategy ? (
                        <span className="uppercase text-[#F52A11]">
                          {vault?.risk?.symbol}
                        </span>
                      ) : (
                        <span
                          className="uppercase"
                          style={{ color: vault.strategyInfo.il?.color }}
                        >
                          {vault.strategyInfo.il?.title}
                        </span>
                      )}
                    </td>
                    <td className="px-2 min-[1130px]:px-4 py-2 w-[90px]">
                      ${Number(vault.shareprice).toFixed(2)}
                    </td>
                    <td className="px-2 min-[1130px]:px-4 py-2 text-right w-[85px] text-[15px]">
                      {formatNumber(vault.tvl, "abbreviate")}
                    </td>
                    <td className="pr-2 md:pr-3 min-[1130px]:pr-5 py-2 text-right w-[110px] text-[15px]">
                      {formatNumber(
                        formatFromBigInt(vault.balance, 18),
                        "format"
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="text-start text-[14px] h-[60px] font-medium">
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
                      Try clearing your filters or changing your search term.
                    </p>
                  </td>
                )}
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
      <a href="/create-vault">
        <button className="bg-button px-3 py-2 rounded-md text-[14px] mt-3">
          Create vault
        </button>
      </a>
    </>
  ) : (
    <div>
      <p>No vaults</p>
      <a href="/create-vault">
        <button className="bg-button px-3 py-2 rounded-md mt-3">
          Create vault
        </button>
      </a>
    </div>
  );
};

export { Vaults };
