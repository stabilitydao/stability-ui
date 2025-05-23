import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { ColumnSort } from "./components/ColumnSort";

import { DisplayType, FullPageLoader, Pagination, MetaVaultsTable } from "@ui";

import { cn, formatNumber, formatFromBigInt, dataSorter } from "@utils";

import { isVaultsLoaded, metaVaults, vaults } from "@store";

import { METAVAULT_TABLE, PROTOCOLS, PAGINATION_VAULTS } from "@constants";

import { TransactionTypes, DisplayTypes } from "@types";

import type { TAddress, TTableColumn, TVault, TEarningData } from "@types";

interface IProps {
  metavault: TAddress;
}

const Metavault: React.FC<IProps> = ({ metavault }) => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);
  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [localMetaVault, setLocalMetaVault] = useState(false);
  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [currentTab, setCurrentTab] = useState(1);
  const [actionType, setActionType] = useState<TransactionTypes>(
    TransactionTypes.Deposit
  );

  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  const [displayType, setDisplayType] = useState<DisplayTypes>(
    DisplayTypes.Rows
  );

  const [tableStates, setTableStates] = useState(METAVAULT_TABLE);

  // const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

  const [value, setValue] = useState("0.00");
  const balance = "0.00";

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(newValue)) {
      setValue(newValue);
    }
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    if (!$vaults) return;

    let sortedVaults = localVaults;

    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        if (state.keyName === "earningData") {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              a.earningData.apr.latest,
              b.earningData.apr.latest,
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

    // // pagination upd
    if (currentTab != 1) {
      const disponibleTabs = Math.ceil(sortedVaults.length / pagination);
      if (disponibleTabs < currentTab) {
        setCurrentTab(1);
      }
    }

    setFilteredVaults(sortedVaults);
    setTableStates(table);
  };

  const initVaults = async () => {
    if ($metaVaults) {
      const metaVault = $metaVaults.find(
        ({ address }) => address === metavault
      );

      if (metaVault) {
        let protocols = metaVault.protocols.map((name) =>
          Object.values(PROTOCOLS).find((protocol) => protocol.name === name)
        );

        const vaults = metaVault.endVaults
          .map((address) => $vaults[146][address])
          .sort((a, b) => Number((b as TVault).tvl) - Number((a as TVault).tvl))
          .map((vault) => {
            const tVault = vault as TVault;
            const balance = formatFromBigInt(tVault.balance, 18);

            return {
              ...tVault,
              balanceInUSD: balance * Number(tVault.shareprice),
            };
          });

        setLocalVaults(vaults);
        setFilteredVaults(vaults);
        setLocalMetaVault({ ...metaVault, protocols });
        setIsLocalVaultsLoaded(true);
      }
    }
  };

  useEffect(() => {
    initVaults();
  }, [$vaults, $metaVaults, $isVaultsLoaded]);

  const isLoading = useMemo(() => {
    return !$isVaultsLoaded || !isLocalVaultsLoaded;
  }, [$isVaultsLoaded, isLocalVaultsLoaded]);

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  return (
    <div className="mx-auto flex gap-6 pb-6">
      <div className="flex flex-col gap-10">
        <div className="mb-6">
          <h2 className="font-bold text-[40px] leading-[48px] text-start mb-4">
            USD Metavault
          </h2>
          <h3 className="text-[#97979a] font-medium text-[20px] leading-8">
            Create and deploy new yield farms using stablecoins and DeFi for
            <br /> consistent returns
          </h3>
        </div>
        <div className="flex items-center flex-wrap gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <span className="text-[#97979A] text-[14px] leading-5 font-medium">
              Total deposited
            </span>
            {!!localMetaVault && (
              <span className="font-semibold text-[18px] leading-6">
                ${formatNumber(localMetaVault.deposited, "withSpaces")}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#97979A] text-[14px] leading-5 font-medium">
              Historical APY
            </span>
            <span className="font-semibold text-[18px] leading-6">
              -- 4.35%
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#97979A] text-[14px] leading-5 font-medium">
              Daily returns
            </span>
            <span className="font-semibold text-[18px] leading-6">
              -- 1.41 USD
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#97979A] text-[14px] leading-5 font-medium">
              Protocols
            </span>
            {!!localMetaVault && (
              <div className="flex items-center">
                {localMetaVault.protocols.map(({ name, logoSrc }, index) => (
                  <img
                    className={cn(
                      "w-6 h-6 rounded-full",
                      index && "ml-[-6px]",
                      `z-[${50 - index}]`
                    )}
                    key={name + index}
                    src={logoSrc}
                    alt={name}
                    title={name}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#97979A] text-[14px] leading-5 font-medium">
              Chain
            </span>
            <div className="font-semibold text-[18px] leading-6 flex items-center gap-3">
              <img
                className="w-6 h-6"
                src="/sonic.png"
                alt="Sonic chain"
                title="Sonic chain"
              />
              <span>Sonic</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-[728px]">
          <span className="font-semibold text-[24px] leading-8">
            Yield Opportunities
          </span>
          <div className="flex items-center justify-end">
            {/* <div className="relative select-none w-[100px]">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDropDownSelector((prevState) => !prevState);
                }}
                className="flex items-center justify-between gap-1 px-5 py-[13px] h-[48px] bg-transparent border border-[#23252A] rounded-lg cursor-pointer"
              >
                <p className="w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px]">
                  Type
                </p>
                <img
                  className={`transition delay-[50ms] w-4 h-4 ${
                    dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                  }`}
                  src="/arrow-down.svg"
                  alt="arrowDown"
                />
              </div>
             <div
                    ref={dropDownRef}
                    className={`bg-accent-900 mt-2 rounded-2xl w-full z-20 ${
                      dropDownSelector
                        ? "absolute transition delay-[50ms]"
                        : "hidden"
                    } `}
                  >
                    <div className="flex flex-col items-start">
                      {filter.variants?.map(
                        (variant: TTAbleFiltersVariant, index: number) => (
                          <div
                            key={variant.name}
                            onClick={() =>
                              activeFiltersHandler(filter, variant.name)
                            }
                            className={`${!index ? "rounded-t-2xl" : ""} ${index === filter?.variants.length - 1 ? "rounded-b-2xl" : ""} py-[10px] px-4 cursor-pointer w-full flex items-center gap-2 ${
                              variant.state ? "bg-accent-800" : ""
                            }`}
                            data-testid="strategy"
                            title={variant.title}
                          >
                            <Checkbox
                              checked={variant.state}
                              onChange={() =>
                                activeFiltersHandler(filter, variant.name)
                              }
                            />
                            <span className="text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {variant.title}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div> 
            </div> */}
            <DisplayType type={displayType} setType={setDisplayType} />
          </div>
          <div>
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
                <MetaVaultsTable
                  vaults={currentTabVaults}
                  display={displayType}
                  setModalState={setAprModal}
                />
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
        </div>
      </div>
      <div className="bg-[#101012] border border-[#23252A] rounded-lg w-[352px] h-[410px]">
        <div className="p-6">
          <div className="flex items-center gap-2 text-[14px] mb-6">
            <span
              className={cn(
                "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
                actionType === "deposit" &&
                  "bg-[#22242A] text-white cursor-default"
              )}
              onClick={() => setActionType(TransactionTypes.Deposit)}
            >
              Deposit
            </span>

            <span
              className={cn(
                "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
                actionType === "withdraw" &&
                  "bg-[#22242A] text-white cursor-default"
              )}
              onClick={() => setActionType(TransactionTypes.Withdraw)}
            >
              Withdraw
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                My position
              </span>
              <span className="text-[24px] leading-8 font-semibold">0 USD</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                My wallet balance
              </span>
              <span className="text-[24px] leading-8 font-semibold">0 USD</span>
            </div>
          </div>
          <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] my-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={value}
                onChange={handleChange}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
              <div className="bg-[#151618] border border-[#23252A] rounded-lg cursor-pointer px-3 py-1 text-[14px]">
                USD
              </div>
            </div>
            <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
              Balance: {balance}
            </div>
          </label>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#97979A] text-[16px] leading-6">
                  Max Slippage
                </span>
                <img src="/icons/questionmark.svg" alt="Question mark" />
              </div>
              <span className="text-[16px] leading-6 font-semibold">0.50%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#97979A] text-[16px] leading-6">
                  Completion time
                </span>
                <img src="/icons/questionmark.svg" alt="Question mark" />
              </div>
              <span className="text-[16px] leading-6 font-semibold">
                ~ 48 hours
              </span>
            </div>
          </div>
          <button
            className={cn(
              "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
            )}
            type="button"
          >
            <p className="px-6 py-4">Deposit</p>
          </button>
        </div>
      </div>
    </div>
  );
};
export { Metavault };
