import { useState, useEffect, useMemo, useRef } from "react";

import { useStore } from "@nanostores/react";

import { Form } from "./components/Form";
import { ColumnSort } from "./components/ColumnSort";
import { LendingMarkets } from "./components/LendingMarkets";
import { Contracts } from "./components/Contracts";

import {
  // DisplayType,
  FullPageLoader,
  Pagination,
  MetaVaultsTable,
  TextSkeleton,
} from "@ui";

import { getMetaVaultProportions } from "./functions/getMetaVaultProportions";

import { cn, formatNumber, dataSorter, useModalClickOutside } from "@utils";

import { isVaultsLoaded, metaVaults, vaults } from "@store";

import { METAVAULT_TABLE, PROTOCOLS, PAGINATION_VAULTS } from "@constants";

import { deployments } from "@stabilitydao/stability";

import { DisplayTypes } from "@types";

import type {
  TAddress,
  TTableColumn,
  TVault,
  TEarningData,
  TMetaVault,
} from "@types";

interface IProps {
  metavault: TAddress;
}

const Metavault: React.FC<IProps> = ({ metavault }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);
  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [localMetaVault, setLocalMetaVault] = useState<TMetaVault>({});
  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [currentTab, setCurrentTab] = useState(1);

  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  const [modal, setModal] = useState<boolean>(false);

  // const [displayType, setDisplayType] = useState<DisplayTypes>(
  //   DisplayTypes.Rows
  // );

  const displayType = DisplayTypes.Rows;

  const [tableStates, setTableStates] = useState(METAVAULT_TABLE);

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  // const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    if (!$vaults) return;

    let sortedVaults = localVaults;

    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        sortedVaults = [...sortedVaults].sort((a, b) =>
          dataSorter(
            String(a[state.keyName as keyof TVault]),
            String(b[state.keyName as keyof TVault]),
            state.dataType,
            state.sortType
          )
        );
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

  const initMetaVaults = async () => {
    const chainId = "146";
    const metaVaultList = $metaVaults[chainId];

    if (!metaVaultList || !$vaults) return;

    const metaVault = metaVaultList.find(
      ({ address }: { address: TAddress }) => address === metavault
    );

    if (!metaVault) return;

    const proportions = await getMetaVaultProportions(metavault);

    const protocols = ["Stability", "Aave", ...metaVault.protocols].map(
      (name) => Object.values(PROTOCOLS).find((p) => p.name === name)
    );

    const vaults = await Promise.all(
      metaVault.endVaults.map(async (entry, index: number) => {
        if (entry.isMetaVault) {
          const subMetaVault = metaVaultList.find(
            (v) => v.address === entry.metaVault
          );
          if (!subMetaVault) return null;

          const { current, target } = await getMetaVaultProportions(
            entry.metaVault as TAddress
          );

          const vaultsData = entry.vaults.map((address, i) => ({
            ...$vaults[chainId][address],
            proportions: { current: current[i], target: target[i] },
            APR: $vaults[chainId][address].earningData.apr.latest,
          }));

          return {
            ...subMetaVault,
            proportions: {
              current: proportions.current[index],
              target: proportions.target[index],
            },
            vaults: vaultsData,
            isMetaVault: true,
          };
        }

        return {
          ...$vaults[chainId][entry.vault],
          APR: $vaults[chainId][entry.vault].earningData.apr.latest,
          proportions: {
            current: proportions.current[index],
            target: proportions.target[index],
          },
          isMetaVault: false,
        };
      })
    );

    const cleanedVaults = vaults.filter(Boolean);

    setLocalVaults(cleanedVaults);
    setFilteredVaults(cleanedVaults);
    setLocalMetaVault({ ...metaVault, protocols });
    setIsLocalVaultsLoaded(true);
  };

  useEffect(() => {
    if ($isVaultsLoaded) {
      initMetaVaults();
      console.log(aprModal);
    }
  }, [$vaults, $metaVaults, $isVaultsLoaded]);

  const isLoading = useMemo(() => {
    return !$isVaultsLoaded || !isLocalVaultsLoaded;
  }, [$isVaultsLoaded, isLocalVaultsLoaded]);

  const TVL = useMemo(() => {
    if (localMetaVault.deposited) {
      if (["metaS", "metawS"].includes(localMetaVault?.symbol)) {
        return `${formatNumber(localMetaVault.deposited, "abbreviate").slice(1)} S`;
      } else {
        return formatNumber(localMetaVault.deposited, "abbreviate");
      }
    }
  }, [localMetaVault]);

  const symbol = deployments?.["146"]?.metaVaults?.find(
    (mv) => mv.address.toLowerCase() === metavault
  )?.symbol;

  useModalClickOutside(modalRef, () => setModal((prev) => !prev));

  return (
    <div className="mx-auto flex flex-col gap-6 pb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-4 md:gap-10">
          <div>
            <h2 className="page-title__font text-start mb-4">{symbol}</h2>

            <h3 className="text-[#97979a] page-description__font">
              {symbol === "metaUSD" ? "Stablecoins" : symbol?.slice(4)} deployed
              across protocols automatically <br className="lg:block hidden" />{" "}
              rebalanced for maximum returns on sonic
            </h3>
          </div>
          <div className="flex items-center flex-wrap md:gap-6">
            <div className="flex flex-col gap-2 w-1/2 md:w-auto">
              <span className="text-[#97979A] text-[14px] leading-5 font-medium">
                TVL
              </span>

              {isLoading ? (
                <TextSkeleton lineHeight={24} width={80} />
              ) : (
                <span className="font-semibold text-[18px] leading-6">
                  {!!localMetaVault?.address ? TVL : null}
                </span>
              )}
            </div>
            <div
              className="flex flex-col gap-2 w-1/2 md:w-auto cursor-help"
              onClick={() => {
                setModal(true);
              }}
            >
              <span className="text-[#97979A] text-[14px] leading-5 font-medium">
                TOTAL APR
              </span>
              {isLoading ? (
                <TextSkeleton lineHeight={24} width={80} />
              ) : (
                <span className="font-semibold text-[18px] leading-6 text-[#48c05c]">
                  {["metaUSD", "metaS"].includes(localMetaVault.symbol)
                    ? formatNumber(localMetaVault?.totalAPR, "formatAPR")
                    : formatNumber(localMetaVault?.APR, "formatAPR")}
                  %
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-1/2 md:w-auto mt-2 md:mt-0">
              <span className="text-[#97979A] text-[14px] leading-5 font-medium">
                Protocols
              </span>

              {isLoading ? (
                <TextSkeleton lineHeight={24} width={80} />
              ) : (
                <div className="flex items-center">
                  {!!localMetaVault?.protocols
                    ? localMetaVault?.protocols?.map(
                        ({ name, logoSrc }, index) => (
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
                        )
                      )
                    : null}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-1/2 md:w-auto mt-2 md:mt-0">
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

            {localMetaVault?.sonicPoints && (
              <div className="flex flex-col gap-2 w-1/2 md:w-auto mt-2 md:mt-0">
                <span className="text-[#97979A] text-[14px] leading-5 font-medium">
                  Sonic AP
                </span>
                <div className="font-semibold text-[18px] leading-6 flex items-center gap-3">
                  <img
                    className="w-6 h-6"
                    src="/sonic.png"
                    alt="Sonic chain"
                    title="Sonic chain"
                  />
                  <span>{localMetaVault?.sonicPoints}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <img
          className="w-[352px] hidden lg:block"
          src="/ui-stack-preview.png"
          alt="Representative icon"
        />
      </div>

      <div className="flex items-start justify-between flex-col-reverse lg:flex-row gap-6">
        <div className="flex flex-col gap-4 w-full lg:w-[850px]">
          <span className="font-semibold text-[24px] leading-8 hidden md:block">
            Yield Opportunities
          </span>
          <div className="flex items-center justify-between md:justify-end">
            <span className="font-semibold text-[18px] leading-6 block md:hidden">
              Yield Opportunities
            </span>

            {/* <DisplayType
              type={displayType}
              setType={setDisplayType}
              pagination={pagination}
              setPagination={setPagination}
            /> */}
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
              data={filteredVaults}
              tab={currentTab}
              display={displayType}
              setTab={setCurrentTab}
              setPagination={setPagination}
            />
          </div>
        </div>
        <div className="flex flex-col gap-5 w-full lg:w-[352px] mt-0 lg:mt-[64px]">
          <Form metaVault={localMetaVault} />
          <Contracts metavault={metavault} />
          {metavault === "0x1111111199558661bf7ff27b4f1623dc6b91aa3e" && (
            <LendingMarkets />
          )}
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div
            ref={modalRef}
            className="relative w-[90%] max-w-[400px] max-h-[80vh] overflow-y-auto bg-[#111114] border border-[#232429] rounded-lg"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#232429]">
              <h2 className="text-[18px] leading-6 font-semibold">Total APR</h2>
              <button onClick={() => setModal(false)}>
                <img src="/icons/xmark.svg" alt="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="leading-5 text-[#97979A] font-medium">APR</p>
                <p className="text-end font-semibold">
                  {formatNumber(localMetaVault?.APR, "formatAPR")}%
                </p>
              </div>
              <a
                className="flex items-center justify-between"
                href="https://app.merkl.xyz/users/"
                target="_blank"
              >
                <div className="flex items-center gap-2">
                  <p className="leading-5 text-[#97979A] font-medium">
                    Merkl APR
                  </p>
                  <img
                    src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Merkl.svg"
                    alt="Merkl"
                    className="w-6 h-6"
                  />
                </div>
                <p className="text-end font-semibold">
                  {formatNumber(localMetaVault?.merklAPR, "formatAPR")}%
                </p>
              </a>
              <div className="flex items-center justify-between">
                <p className="leading-5 text-[#97979A] font-medium">
                  sGEM1 APR
                </p>
                <p className="text-end font-semibold">
                  {formatNumber(localMetaVault?.gemsAPR, "formatAPR")}%
                </p>
              </div>
              <div className="flex items-center justify-between text-[#2BB656]">
                <p className="leading-5 font-medium">Total APR</p>
                <p className="text-end font-semibold">
                  {formatNumber(localMetaVault?.totalAPR, "formatAPR")}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export { Metavault };
