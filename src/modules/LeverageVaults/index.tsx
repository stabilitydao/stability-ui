import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";
import { Filters } from "./components/Filters";

import {
  FullPageLoader,
  ErrorMessage,
  Pagination,
  FarmingTable,
  DisplayType,
  APRModal,
} from "@ui";

import { vaults, isVaultsLoaded, aprFilter, error } from "@store";

import { initFilters } from "./functions";

import { dataSorter, cn } from "@utils";

import {
  FARMING_TABLE_FILTERS,
  PAGINATION_LIMIT,
  DEFAULT_TABLE_PARAMS,
  LEVERAGE_FARMING_TABLE,
  CHAINS,
} from "@constants";

import {
  TVault,
  TTableColumn,
  TAPRPeriod,
  TTableActiveParams,
  TEarningData,
  DisplayTypes,
  VaultTypes,
} from "@types";

const LeverageVaults = (): JSX.Element => {
  const $vaults = useStore(vaults);

  const $isVaultsLoaded = useStore(isVaultsLoaded);
  const $aprFilter: TAPRPeriod = useStore(aprFilter);

  const $error = useStore(error);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  const [activeTableParams, setActiveTableParams] =
    useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);

  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  let urlTab = 1;

  let urlTableStates = LEVERAGE_FARMING_TABLE;

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
  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(urlTableStates);
  const [tableFilters, setTableFilters] = useState(FARMING_TABLE_FILTERS);
  const [displayType, setDisplayType] = useState<DisplayTypes>(
    DisplayTypes.Rows
  );
  const [activeNetworks, setActiveNetworks] = useState(
    CHAINS.filter(({ active }) => active)
  );

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

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

  const tableHandler = (
    table: TTableColumn[] = tableStates,
    tableParams = activeTableParams
  ) => {
    if (!$vaults) return;

    let activeNetworksVaults: { [key: string]: TVault[] } = {};

    activeNetworks.forEach((network) => {
      if (network.active) {
        activeNetworksVaults[network.id] = $vaults[network.id];
      }
    });

    let sortedVaults = localVaults.sort(
      (a: TVault, b: TVault) => Number(b.tvl) - Number(a.tvl)
    );

    //filter
    tableFilters.forEach((f) => {
      if (!f.state) return;
      switch (f.type) {
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
                strategiesToFilter.includes(vault?.strategyInfo?.shortId)
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
        if (state.key === "earningData") {
          sortedVaults = [...sortedVaults].sort((a, b) => {
            const aAPR =
              a?.type != VaultTypes.Vault
                ? Number(a?.totalAPR ?? 0)
                : Number(a.earningData?.apr?.[$aprFilter] ?? 0);

            const bAPR =
              b?.type != VaultTypes.Vault
                ? Number(b?.totalAPR ?? 0)
                : Number(b.earningData?.apr?.[$aprFilter] ?? 0);

            return dataSorter(aAPR, bAPR, state.dataType, state.sortType);
          });
        } else {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              String(a[state.key as keyof TVault]),
              String(b[state.key as keyof TVault]),
              state.dataType,
              state.sortType
            )
          );
        }
      }
    });

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
    if ($vaults && $isVaultsLoaded) {
      const allVaults = Object.values($vaults[146]) || [];

      const vaults: TVault[] = allVaults
        .filter((vault) => vault?.leverageLending)
        .sort((a, b) => Number((b as TVault).tvl) - Number((a as TVault).tvl))
        .map((vault) => {
          const tVault = vault as TVault;

          const leverage = Number(
            (1 / (1 - vault?.leverageLending?.maxLtv / 100)).toFixed(1)
          );

          return {
            ...tVault,
            leverage,
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

        <h2 className="page-title__font text-start mb-2 md:mb-5">
          Leverage Vaults
        </h2>
        <h3 className="text-[#97979a] page-description__font">
          Enables users to amplify yield by borrowing assets and farming with{" "}
          <br className="hidden md:block" /> higher capital exposure. Maximize
          returns through strategic leverage <br className="hidden md:block" />{" "}
          while managing risk with real-time metrics and automated position
        </h3>

        <div className="flex items-center justify-between gap-2 mt-6 md:mt-10 mb-4">
          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            setTableParams={setActiveTableParams}
          />

          <DisplayType type={displayType} setType={setDisplayType} />
        </div>
      </div>

      <div className="pb-5 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
        <div className="overflow-x-auto md:overflow-x-scroll lg:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar">
          <div
            className={cn(
              "flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] w-[762px] md:w-[960px] lg:w-full",
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
              <FarmingTable
                vaults={currentTabVaults}
                display={displayType}
                setModalState={setAprModal}
              />
            ) : (
              <div className="text-start h-[60px] font-medium">No vaults</div>
            )}
          </div>
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
      {aprModal.state && aprModal.type === "vault" && (
        <APRModal state={aprModal} setModalState={setAprModal} />
      )}
    </>
  );
};

export { LeverageVaults };
