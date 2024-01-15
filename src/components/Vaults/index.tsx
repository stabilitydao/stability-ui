import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

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
} from "@components";

import { vaults, isVaultsLoaded, connected } from "@store";

import {
  formatNumber,
  getStrategyShortName,
  formatFromBigInt,
  calculateAPY,
} from "@utils";

import {
  TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
} from "@constants";
import type {
  TVault,
  TTableColumn,
  TTableFilters,
  TTAbleFiltersVariant,
} from "@types";

const Vaults = () => {
  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $connected = useStore(connected);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [aprModal, setAprModal] = useState({
    apr: "",
    assetsWithApr: "",
    assetsAprs: 0,
    lastHardWork: 0,
    strategyApr: 0,
    state: false,
  });

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(1);

  const [portfolio, setPortfolio] = useState({
    deposited: "0",
    monthly: "0",
    daily: "0",
    avg: "0",
  });
  const [sortSelector, setSortSelector] = useState(false);

  const lastTabIndex = currentTab * PAGINATION_VAULTS;
  const firstTabIndex = lastTabIndex - PAGINATION_VAULTS;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);
  const [tableStates, setTableStates] = useState(TABLE);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);

  const search: React.RefObject<HTMLInputElement> = useRef(null);

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
    setFilteredVaults(sortedVaults);
    setTableStates(table);
  };
  const initPortfolio = (vaults: TVault[]) => {
    if (!$connected) return;
    let deposited: any = 0n;
    let monthly = 0;
    let avgApy = 0;

    vaults.forEach((v) => {
      if (v.balance) {
        const apr = Number(v.apr);
        const balance = BigInt(v.balance);

        deposited += balance;
        monthly += ((apr / 100) * Number(formatUnits(balance, 18))) / 12;
      }
    });

    deposited = Number(formatUnits(deposited, 18));
    const daily = monthly / 30;
    avgApy = (100 * daily * 365) / deposited;

    setPortfolio({
      deposited: String(deposited.toFixed(3)),
      monthly: String(monthly.toFixed(3)),
      daily: String(daily.toFixed(3)),
      avg: String(avgApy.toFixed(3)),
    });
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
      initPortfolio(vaults);
      setLocalVaults(vaults);

      setFilteredVaults(vaults);
      setIsLocalVaultsLoaded(true);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [tableFilters]);

  useEffect(() => {
    initVaults();
  }, [$vaults]);
  return !$isVaultsLoaded || !isLocalVaultsLoaded ? (
    <p className="text-[36px] text-center">Loading vaults...</p>
  ) : localVaults?.length ? (
    <>
      <Portfolio data={portfolio} />
      <div className="flex items-center gap-2 flex-col lg:flex-row">
        <input
          type="text"
          className="mt-1 lg:mt-0 w-full bg-[#2c2f38] outline-none pl-3 py-1.5 rounded-[4px] border-[2px] border-[#3d404b] focus:border-[#9baab4] transition-all duration-300"
          placeholder="Search"
          ref={search}
          onChange={() => tableHandler()}
        />
        <Filters filters={tableFilters} setFilters={setTableFilters} />
      </div>

      <div className="flex md:hidden items-center mt-4 gap-3 relative ">
        <div className="relative select-none w-full">
          <div
            onClick={() => {
              setSortSelector((prevState) => !prevState);
            }}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 bg-button text-[20px] cursor-pointer"
          >
            <p className="text-[16px] md:text-[15px] lg:text-[20px]">Sort by</p>
            <svg
              width="15"
              height="9"
              viewBox="0 0 15 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition delay-[50ms] ${
                sortSelector ? "rotate-[180deg]" : "rotate-[0deg]"
              }`}
            >
              <path d="M1 1L7.5 7.5L14 1" stroke="white" />
            </svg>
          </div>
          <div
            className={`bg-button mt-1 rounded-md w-full z-10 ${
              sortSelector ? "absolute transition delay-[50ms]" : "hidden"
            } `}
          >
            <div className="flex flex-col items-center">
              {tableStates.map((value: any, index: number) => (
                <ColumnSort
                  key={value.name}
                  index={index}
                  value={value.name}
                  table={tableStates}
                  type="tile"
                  sort={tableHandler}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {currentTabVaults.length ? (
        <table className="hidden md:table table-auto w-full rounded-lg bg-[#2c2f38] select-none">
          <thead>
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
            {currentTabVaults.map((vault: TVault) => {
              return (
                <tr
                  className="border-t border-[#4f5158] text-center text-[15px] transition delay-[40ms] hover:bg-[#3d404b] cursor-pointer"
                  key={vault.name}
                  onClick={() => toVault(vault.address)}
                >
                  <td className="px-2 lg:px-3 py-2 lg:py-3">
                    <div className="flex items-center justify-start">
                      <VaultState status={vault.status} />
                      {vault.assets && (
                        <AssetsProportion
                          proportions={vault.assetsProportions as number[]}
                          assets={vault.assets}
                          type="vaults"
                        />
                      )}
                      <div className="max-w-[250px] flex items-start flex-col">
                        <p
                          title={vault.name}
                          className="md:whitespace-nowrap font-bold"
                        >
                          {vault.symbol}
                        </p>
                        <p className="lg:hidden">{vault.type}</p>
                        <p className="lg:hidden">
                          {getStrategyShortName(vault.symbol)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 lg:px-1 py-2 hidden xl:table-cell">
                    <VaultType type={vault.type} />
                  </td>
                  <td className="pl-2 py-2 hidden lg:table-cell whitespace-nowrap">
                    <div className="flex items-center border-0 rounded-[8px] pl-0 py-1 border-[#935ec2]">
                      {vault.strategyInfo && (
                        <>
                          <span
                            style={{
                              backgroundColor: vault.strategyInfo.bgColor,
                              color: vault.strategyInfo.color,
                            }}
                            className="pl-2 pr-2 rounded-l-[10px] font-bold text-[#ffffff] text-[15px] flex h-8 items-center justify-center w-[48px]"
                            title={vault.strategyInfo.name}
                          >
                            {vault.strategyInfo.shortName}
                          </span>
                          <span className="px-2 rounded-r-[10px] bg-[#41465a] hidden md:flex h-8 items-center min-w-[100px] lg:min-w-[160px]">
                            <span className="flex min-w-[42px] justify-center">
                              {vault.strategyInfo.protocols.map(
                                (protocol, index) => (
                                  <img
                                    className={`h-6 w-6 rounded-full ${
                                      vault.strategyInfo.protocols.length > 1 &&
                                      index &&
                                      "ml-[-8px]"
                                    }`}
                                    key={index}
                                    src={protocol.logoSrc}
                                    alt={protocol.name}
                                    title={protocol.name}
                                  />
                                )
                              )}
                            </span>
                            <span className="flex">
                              {vault.strategyInfo.features.map((feature, i) => (
                                <img
                                  key={i}
                                  title={feature.name}
                                  alt={feature.name}
                                  className="w-6 h-6 ml-1"
                                  src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                    feature.svg
                                  )}`}
                                />
                              ))}
                            </span>
                            {vault.strategySpecific && (
                              <span
                                className={
                                  vault.strategySpecific.length > 10
                                    ? `ml-0.5 lowercase font-bold text-[9px] pl-[6px] rounded-[4px] text-[#b6bdd7] hidden lg:inline`
                                    : `ml-0.5 uppercase font-bold text-[10px] px-[6px] rounded-[4px] text-[#b6bdd7] hidden lg:inline`
                                }
                              >
                                {vault.strategySpecific}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-2 lg:px-3 py-2">
                    <div className="flex w-[80px] justify-end">
                      <p>{vault.apy}%</p>
                      <div className="tooltip">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="mt-[4px] ml-1 cursor-pointer opacity-40 hover:opacity-100 transition delay-[40ms] tooltip"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAprModal({
                              apr: vault.apr,
                              assetsWithApr: vault.assetsWithApr as any,
                              assetsAprs: vault.monthlyUnderlyingApr,
                              lastHardWork: vault.lastHardWork as any,
                              strategyApr: Number(vault.strategyApr),
                              state: true,
                            });
                          }}
                        >
                          <circle cx="8" cy="8" r="7.5" stroke="white" />
                          <path
                            d="M7.34516 9.37249V9.3266C7.35011 8.83967 7.39958 8.45216 7.49359 8.16408C7.58759 7.876 7.72117 7.64273 7.89433 7.46427C8.06749 7.28581 8.27528 7.12138 8.5177 6.97096C8.66365 6.87918 8.79476 6.77083 8.91103 6.64591C9.02729 6.51844 9.11882 6.37185 9.18561 6.20614C9.25487 6.04043 9.2895 5.85688 9.2895 5.65547C9.2895 5.40563 9.23261 5.18893 9.11882 5.00538C9.00503 4.82182 8.85289 4.68033 8.66242 4.5809C8.47194 4.48148 8.26044 4.43176 8.02791 4.43176C7.82506 4.43176 7.62964 4.4751 7.44164 4.56178C7.25364 4.64846 7.09655 4.78485 6.9704 4.97096C6.84424 5.15707 6.77126 5.40053 6.75147 5.70136H5.81641C5.8362 5.26797 5.94504 4.89703 6.14294 4.58855C6.34331 4.28007 6.60676 4.04426 6.93329 3.88109C7.26229 3.71793 7.62717 3.63635 8.02791 3.63635C8.46328 3.63635 8.84176 3.72558 9.16335 3.90404C9.4874 4.0825 9.73725 4.32724 9.91288 4.63826C10.091 4.94929 10.18 5.30366 10.18 5.70136C10.18 5.9818 10.138 6.23546 10.0539 6.46236C9.97225 6.68925 9.85351 6.89193 9.69767 7.07039C9.5443 7.24884 9.35877 7.40691 9.14108 7.54457C8.92339 7.68479 8.749 7.83266 8.61789 7.98817C8.48678 8.14113 8.39155 8.32341 8.33218 8.53501C8.27281 8.74661 8.24065 9.01048 8.2357 9.3266V9.37249H7.34516ZM7.82012 11.6364C7.63706 11.6364 7.47998 11.5688 7.34887 11.4337C7.21777 11.2986 7.15221 11.1367 7.15221 10.948C7.15221 10.7594 7.21777 10.5975 7.34887 10.4624C7.47998 10.3272 7.63706 10.2597 7.82012 10.2597C8.00317 10.2597 8.16025 10.3272 8.29136 10.4624C8.42247 10.5975 8.48802 10.7594 8.48802 10.948C8.48802 11.0729 8.4571 11.1877 8.39526 11.2922C8.33589 11.3967 8.25549 11.4808 8.15407 11.5446C8.05512 11.6058 7.9438 11.6364 7.82012 11.6364Z"
                            fill="white"
                          />
                        </svg>
                        <div className="visible__tooltip">
                          <div className="flex items-start flex-col gap-4">
                            <p className="text-[14px]">
                              The Annual Percentage Rate (APR) for the Vault is
                              equal to the sum of the Strategy APR and
                              Underlying APRs
                            </p>

                            <div className="text-[16px] flex flex-col gap-1 items-start">
                              <p>
                                Total APR {vault.apr}% (
                                {calculateAPY(vault.apr).toFixed(2)}% APY)
                              </p>
                              {!!vault.monthlyUnderlyingApr && (
                                <p>
                                  Fee APR
                                  {(vault.monthlyUnderlyingApr * 100).toFixed(
                                    2
                                  )}
                                  %
                                </p>
                              )}
                              <p>
                                Strategy APR{" "}
                                {formatFromBigInt(vault.strategyApr, 3).toFixed(
                                  2
                                )}
                                %
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[16px]">Last Hard Work :</p>
                              <TimeDifferenceIndicator
                                unix={vault.lastHardWork}
                              />
                            </div>
                          </div>
                          <i></i>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 lg:px-4 py-2">
                    <span
                      className="uppercase font-bold text-[12px]"
                      style={{ color: vault.strategyInfo.il?.color }}
                    >
                      {vault.strategyInfo.il?.title}
                    </span>
                  </td>
                  <td className="px-2 lg:px-4 py-2">
                    ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
                  </td>
                  <td className="px-2 lg:px-4 py-2 text-right">
                    {formatNumber(
                      formatFromBigInt(vault.tvl, 18, "withFloor"),
                      "abbreviate"
                    )}
                  </td>
                  <td className="pr-2 md:pr-3 lg:pr-5 py-2 text-right">
                    {formatNumber(
                      formatFromBigInt(vault.balance, 18),
                      "format"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center mt-5 md:mt-0">
          No results found...
        </div>
      )}
      <div className="md:hidden block">
        {currentTabVaults.map((vault: TVault, index: number) => {
          return (
            <div
              key={vault.name}
              className="my-3 w-full bg-[#2C2F38] rounded-md"
            >
              <div className="flex flex-col items-center justify-center p-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center flex-wrap gap-1">
                    {vault.assets && (
                      <AssetsProportion
                        proportions={vault.assetsProportions as number[]}
                        assets={vault.assets}
                        type="vaults"
                      />
                    )}
                    <p
                      title={vault.name}
                      className="whitespace-nowrap text-[18px] font-bold"
                    >
                      {vault.symbol}
                    </p>
                  </div>

                  <VaultType type={vault.type} />
                </div>
                <div className="flex items-center rounded-[8px] my-3 border-[#935ec2]">
                  <VaultState status={vault.status} />
                  {vault.strategyInfo && (
                    <>
                      <span
                        style={{
                          backgroundColor: vault.strategyInfo.bgColor,
                          color: vault.strategyInfo.color,
                        }}
                        className="pl-2 pr-2 rounded-l-[10px] font-bold text-[#ffffff] text-[15px] flex h-8 items-center w-[48px]"
                        title={vault.strategyInfo.name}
                      >
                        {vault.strategyInfo.shortName}
                      </span>
                      <span className="px-2 rounded-r-[10px] bg-[#41465a] d-none flex h-8 items-center min-w-[170px]">
                        <span className="flex min-w-[42px] justify-center">
                          {vault.strategyInfo.protocols.map(
                            (protocol, index) => (
                              <img
                                className={`h-6 w-6 rounded-full ${
                                  vault.strategyInfo.protocols.length > 1 &&
                                  index &&
                                  "ml-[-8px]"
                                }`}
                                key={index}
                                src={protocol.logoSrc}
                                alt={protocol.name}
                                title={protocol.name}
                              />
                            )
                          )}
                        </span>
                        <span className="flex">
                          {vault.strategyInfo.features.map((feature, i) => (
                            <img
                              key={i}
                              title={feature.name}
                              alt={feature.name}
                              className="w-6 h-6 ml-1"
                              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                feature.svg
                              )}`}
                            />
                          ))}
                        </span>
                        {vault.strategySpecific && (
                          <span
                            className={
                              vault.strategySpecific.length > 10
                                ? `ml-0.5 lowercase font-bold text-[10px] pl-[6px] rounded-[4px] text-[#b6bdd7] inline`
                                : `ml-0.5 uppercase font-bold text-[11px] px-[6px] rounded-[4px] text-[#b6bdd7] inline`
                            }
                          >
                            {vault.strategySpecific}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex justify-between border-b border-[#4f5158] w-full text-[16px] text-[#8f8f8f]">
                  <p className="w-1/2 border-r border-[#4f5158]">APY</p>
                  <div className="w-1/2 flex items-center justify-end">
                    <p>{vault.apy}%</p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="mt-[4px] ml-1 cursor-pointer opacity-40 hover:opacity-100 transition delay-[40ms]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAprModal({
                          apr: vault.apr,
                          assetsWithApr: vault.assetsWithApr as any,
                          assetsAprs: vault.monthlyUnderlyingApr,
                          lastHardWork: vault.lastHardWork as any,
                          strategyApr: Number(vault.strategyApr),
                          state: true,
                        });
                      }}
                    >
                      <circle cx="8" cy="8" r="7.5" stroke="white" />
                      <path
                        d="M7.34516 9.37249V9.3266C7.35011 8.83967 7.39958 8.45216 7.49359 8.16408C7.58759 7.876 7.72117 7.64273 7.89433 7.46427C8.06749 7.28581 8.27528 7.12138 8.5177 6.97096C8.66365 6.87918 8.79476 6.77083 8.91103 6.64591C9.02729 6.51844 9.11882 6.37185 9.18561 6.20614C9.25487 6.04043 9.2895 5.85688 9.2895 5.65547C9.2895 5.40563 9.23261 5.18893 9.11882 5.00538C9.00503 4.82182 8.85289 4.68033 8.66242 4.5809C8.47194 4.48148 8.26044 4.43176 8.02791 4.43176C7.82506 4.43176 7.62964 4.4751 7.44164 4.56178C7.25364 4.64846 7.09655 4.78485 6.9704 4.97096C6.84424 5.15707 6.77126 5.40053 6.75147 5.70136H5.81641C5.8362 5.26797 5.94504 4.89703 6.14294 4.58855C6.34331 4.28007 6.60676 4.04426 6.93329 3.88109C7.26229 3.71793 7.62717 3.63635 8.02791 3.63635C8.46328 3.63635 8.84176 3.72558 9.16335 3.90404C9.4874 4.0825 9.73725 4.32724 9.91288 4.63826C10.091 4.94929 10.18 5.30366 10.18 5.70136C10.18 5.9818 10.138 6.23546 10.0539 6.46236C9.97225 6.68925 9.85351 6.89193 9.69767 7.07039C9.5443 7.24884 9.35877 7.40691 9.14108 7.54457C8.92339 7.68479 8.749 7.83266 8.61789 7.98817C8.48678 8.14113 8.39155 8.32341 8.33218 8.53501C8.27281 8.74661 8.24065 9.01048 8.2357 9.3266V9.37249H7.34516ZM7.82012 11.6364C7.63706 11.6364 7.47998 11.5688 7.34887 11.4337C7.21777 11.2986 7.15221 11.1367 7.15221 10.948C7.15221 10.7594 7.21777 10.5975 7.34887 10.4624C7.47998 10.3272 7.63706 10.2597 7.82012 10.2597C8.00317 10.2597 8.16025 10.3272 8.29136 10.4624C8.42247 10.5975 8.48802 10.7594 8.48802 10.948C8.48802 11.0729 8.4571 11.1877 8.39526 11.2922C8.33589 11.3967 8.25549 11.4808 8.15407 11.5446C8.05512 11.6058 7.9438 11.6364 7.82012 11.6364Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                  <p className="w-1/2 border-r border-[#4f5158]">PRICE</p>
                  <p className="w-1/2 text-end">
                    ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
                  </p>
                </div>
                <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                  <p className="w-1/2 border-r border-[#4f5158]">TVL</p>
                  <p className="w-1/2 text-end">
                    {formatNumber(
                      formatFromBigInt(vault.tvl, 18, "withFloor"),
                      "abbreviate"
                    )}
                  </p>
                </div>
                <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                  <p className="w-1/2 border-r border-[#4f5158]">IL</p>
                  <p
                    className="w-1/2 text-end uppercase font-bold text-[12px]"
                    style={{ color: vault.strategyInfo.il?.color }}
                  >
                    {vault.strategyInfo.il?.title}
                  </p>
                </div>
                <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                  <p className="w-1/2 border-r border-[#4f5158]">BALANCE</p>
                  <p className="w-1/2 text-end">
                    {formatNumber(
                      formatFromBigInt(vault.balance, 18),
                      "format"
                    )}
                  </p>
                </div>
                <a href={`/vault/${vault.address}`}>
                  <button className="bg-button px-3 py-2 rounded-md mt-3">
                    Manage
                  </button>
                </a>
              </div>
            </div>
          );
        })}
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
        <button className="bg-button px-3 py-2 rounded-md mt-3">
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
