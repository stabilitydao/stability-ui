import { useState, useEffect, useMemo, useRef } from "react";

import { useStore } from "@nanostores/react";

import { Form } from "./components/Form";
import { ColumnSort } from "./components/ColumnSort";
import { LendingMarkets } from "./components/LendingMarkets";
import { Contracts } from "./components/Contracts";

import { FullPageLoader, Pagination, MetaVaultsTable, TextSkeleton } from "@ui";

import { getMetaVaultProportions } from "./functions/getMetaVaultProportions";

import { cn, formatNumber, dataSorter, useModalClickOutside } from "@utils";

import { isVaultsLoaded, metaVaults, vaults } from "@store";

import {
  METAVAULT_TABLE,
  PROTOCOLS,
  PAGINATION_VAULTS,
  PROTOCOLS_TABLE,
} from "@constants";

import { deployments } from "@stabilitydao/stability";

import { MetaVaultTableTypes } from "@types";

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
  const [protocolsData, setProtocolsData] = useState([]);
  const [filteredProtocolsData, setFilteredProtocolsData] = useState([]);
  const [localMetaVault, setLocalMetaVault] = useState<TMetaVault>({});
  const [pagination, setPagination] = useState<number>(PAGINATION_VAULTS);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [currentTab, setCurrentTab] = useState(1);
  const [tableType, setTableType] = useState(MetaVaultTableTypes.Destinations);

  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  const [modal, setModal] = useState<boolean>(false);

  const [tableStates, setTableStates] = useState(METAVAULT_TABLE);

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  const changeTable = (type: MetaVaultTableTypes) => {
    if (type === MetaVaultTableTypes.Destinations) {
      setTableStates(METAVAULT_TABLE);
    } else if (type === MetaVaultTableTypes.Protocols) {
      setTableStates(PROTOCOLS_TABLE);
    }

    setCurrentTab(1);
    setTableType(type);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    if (tableType === MetaVaultTableTypes.Destinations) {
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
    } else if (tableType === MetaVaultTableTypes.Protocols) {
      let sortedProtocols = protocolsData;

      table.forEach((state: TTableColumn) => {
        if (state.sortType !== "none") {
          sortedProtocols = [...sortedProtocols].sort((a, b) =>
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
      // if (currentTab != 1) {
      //   const disponibleTabs = Math.ceil(sortedVaults.length / pagination);
      //   if (disponibleTabs < currentTab) {
      //     setCurrentTab(1);
      //   }
      // }

      setFilteredProtocolsData(sortedProtocols);
    }

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

    const protocols = ["Stability", ...metaVault.protocols].map((name) =>
      Object.values(PROTOCOLS).find((p) => p.name === name)
    );

    const vaults = await Promise.all(
      metaVault.endVaults.map(async (entry, index: number) => {
        const isMeta = entry.isMetaVault;
        const vaultAddr = isMeta ? entry.metaVault : entry.vault;

        const current = proportions.current[index];
        const target = proportions.target[index];

        if (current <= 0.1 && !target) return null;

        if (isMeta) {
          const subMetaVault = metaVaultList.find(
            (v: TVault) => v.address === vaultAddr
          );

          if (!subMetaVault) return null;

          const { current: subCurrent, target: subTarget } =
            await getMetaVaultProportions(vaultAddr as TAddress);

          const vaultsData = entry.vaults
            .map((address: TAddress, i: number) => {
              const vault = $vaults[chainId][address];
              return {
                ...vault,
                proportions: {
                  current: subCurrent[i],
                  target: subTarget[i],
                },
                APR: vault.earningData.apr.latest,
              };
            })
            .filter(({ proportions }) => proportions.current > 0.1);

          return {
            ...subMetaVault,
            proportions: { current, target },
            vaults: vaultsData,
            isMetaVault: true,
          };
        }

        const vault = $vaults[chainId][vaultAddr];

        return {
          ...vault,
          APR: vault.earningData.apr.latest,
          proportions: { current, target },
          isMetaVault: false,
        };
      })
    );

    const cleanedVaults = vaults.filter(Boolean);

    const protocolsAllocation = protocols.slice(1).map((protocol) => {
      let allocation = 0;

      cleanedVaults.forEach((vault) => {
        if (vault?.isMetaVault) {
          vault.vaults.forEach((v) => {
            if (
              protocol.name.includes(v.strategy) ||
              (protocol.name === "Silo V2" &&
                v.strategy === "Silo Managed Farm")
            ) {
              allocation += Number(v.tvl);
            }
          });
        } else if (
          protocol.name.includes(vault.strategy) ||
          (protocol.name === "Silo V2" &&
            vault.strategy === "Silo Managed Farm")
        ) {
          allocation += Number(vault.tvl);
        }
      });

      return { ...protocol, allocation };
    });

    const totalAllocation = protocolsAllocation.reduce(
      (sum, p) => sum + p.allocation,
      0
    );

    const allocationsWithPercent = protocolsAllocation.map((p) => ({
      ...p,
      value: totalAllocation > 0 ? (p.allocation / totalAllocation) * 100 : 0,
    }));

    setLocalVaults(cleanedVaults);
    setFilteredVaults(cleanedVaults);
    setProtocolsData(allocationsWithPercent);
    setFilteredProtocolsData(allocationsWithPercent);
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
        return `${String(formatNumber(localMetaVault.deposited, "abbreviate"))?.slice(1)} S`;
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
              across protocols automatically <br className="xl:block hidden" />{" "}
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

            {!!localMetaVault?.sonicPoints && (
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
                  <span>x{localMetaVault?.sonicPoints}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <img
          className="w-[352px] hidden xl:block"
          src="/ui-stack-preview.png"
          alt="Representative icon"
        />
      </div>

      <div className="flex items-start justify-between flex-col-reverse xl:flex-row gap-6">
        <div className="flex flex-col gap-4 w-full xl:w-[850px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[24px] leading-8 hidden md:block">
              Allocations
            </span>
            <div className="flex items-center justify-between md:justify-end">
              <span className="font-semibold text-[18px] leading-6 block md:hidden">
                Allocations
              </span>
            </div>
            <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429]">
              <span
                className={cn(
                  "px-4 h-10 text-center rounded-lg flex items-center justify-center",
                  tableType != MetaVaultTableTypes.Destinations
                    ? "text-[#6A6B6F] cursor-pointer"
                    : "bg-[#232429] border border-[#2C2E33]"
                )}
                onClick={() => changeTable(MetaVaultTableTypes.Destinations)}
              >
                Destinations
              </span>
              <span
                className={cn(
                  "px-4 h-10 text-center rounded-lg flex items-center justify-center",
                  tableType != MetaVaultTableTypes.Protocols
                    ? "text-[#6A6B6F] cursor-pointer"
                    : "bg-[#232429] border border-[#2C2E33]"
                )}
                onClick={() => changeTable(MetaVaultTableTypes.Protocols)}
              >
                Protocols
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
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
                <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]">
                  <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                    <FullPageLoader />
                  </div>
                </div>
              ) : localVaults?.length ? (
                <MetaVaultsTable
                  tableType={tableType}
                  vaults={currentTabVaults}
                  protocols={filteredProtocolsData}
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
              setTab={setCurrentTab}
              setPagination={setPagination}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full xl:w-[352px] mt-0 xl:mt-[64px]">
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
