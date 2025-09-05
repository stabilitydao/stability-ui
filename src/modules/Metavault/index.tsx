import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { Form } from "./components/Form";
import { ColumnSort } from "./components/ColumnSort";
// import { LendingMarkets } from "./components/LendingMarkets";
import { Contracts } from "./components/Contracts";
import { Chart } from "./components/Chart";

import { Modal } from "./components/Modals/Modal";
import { ProtocolModal } from "./components/Modals/ProtocolModal";

import { FullPageLoader, Pagination, MetaVaultsTable, TextSkeleton } from "@ui";

import { cn, formatNumber, dataSorter } from "@utils";

import { isVaultsLoaded, metaVaults, vaults } from "@store";

import {
  METAVAULT_TABLE,
  PROTOCOLS,
  PAGINATION_LIMIT,
  PROTOCOLS_TABLE,
} from "@constants";

import { deployments, integrations } from "@stabilitydao/stability";

import {
  TAddress,
  TTableColumn,
  TVault,
  TEarningData,
  TMetaVault,
  MetaVaultTableTypes,
  VaultTypes,
  IProtocolModal,
  IProtocol,
} from "@types";

interface IProps {
  metavault: TAddress;
}

const Metavault: React.FC<IProps> = ({ metavault }) => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [localProtocols, setLocalProtocols] = useState<IProtocol[]>([]);

  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<IProtocol[]>([]);

  const [localMetaVault, setLocalMetaVault] = useState<TMetaVault>({});

  const [pagination, setPagination] = useState<number>(PAGINATION_LIMIT);

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

  const [protocolModal, setProtocolModal] = useState<IProtocolModal>({
    name: "",
    logoSrc: "",
    value: 0,
    allocation: 0,
    creationDate: 0,
    audits: [],
    accidents: [],
    state: false,
    type: "",
  });

  const [modal, setModal] = useState<boolean>(false);

  const [tableStates, setTableStates] = useState(METAVAULT_TABLE);

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
    const sortData = (
      data: any[],
      key: string,
      dataType: string,
      sortType: string
    ) => {
      return [...data].sort((a, b) =>
        dataSorter(String(a[key]), String(b[key]), dataType, sortType)
      );
    };

    let sortedList: any[] = [];

    switch (tableType) {
      case MetaVaultTableTypes.Destinations:
        if (!$vaults) return;

        sortedList = table.reduce((acc, state) => {
          if (state.sortType !== "none") {
            return sortData(acc, state.keyName, state.dataType, state.sortType);
          }
          return acc;
        }, localVaults);

        setFilteredVaults(sortedList);
        break;

      case MetaVaultTableTypes.Protocols:
        sortedList = table.reduce((acc, state) => {
          if (state.sortType !== "none") {
            return sortData(acc, state.keyName, state.dataType, state.sortType);
          }
          return acc;
        }, localProtocols);

        setFilteredProtocols(sortedList);
        break;

      default:
        return;
    }

    if (currentTab !== 1 && sortedList.length) {
      const totalTabs = Math.ceil(sortedList.length / pagination);
      if (totalTabs < currentTab) {
        setCurrentTab(1);
      }
    }

    setTableStates(table);
  };

  const init = async () => {
    const chainId = "146";
    const metaVaultList = $metaVaults[chainId];

    if (!metaVaultList || !$vaults) return;

    const metaVault = metaVaultList.find(
      ({ address }: { address: TAddress }) => address === metavault
    );

    if (!metaVault) return;

    const protocols = ["Stability", ...metaVault.protocols].map((name) =>
      Object.values(PROTOCOLS).find(
        (p) =>
          p.name.replace(" ", "").toLowerCase() ===
          name.replace(" ", "").toLowerCase()
      )
    );

    const vaults = await Promise.all(
      metaVault.vaultsData.map(async (entry) => {
        const isMetaVault = entry.type != VaultTypes.Vault;

        const vaultAddr = entry.address;

        const vaultProportion = entry.proportions;

        const current = vaultProportion?.current * 100;

        const target = vaultProportion?.target * 100;

        if (current <= 0.1 && !target) return null;

        if (isMetaVault) {
          const subMetaVault = metaVaultList.find(
            (v: TVault) => v.address === vaultAddr
          );

          if (!subMetaVault) return null;

          const vaultsData = entry.vaults
            .map((v) => {
              const addr = v.address.toLowerCase();
              const vault = $vaults[chainId][addr];
              const subProp = v.proportions;

              return {
                ...vault,
                proportions: {
                  current: subProp.current * 100,
                  target: subProp.target * 100,
                },
                APR: vault.earningData.apr.latest,
              };
            })
            .filter(({ proportions }) => proportions.current > 0.1);

          return {
            ...subMetaVault,
            proportions: { current, target },
            vaults: vaultsData,
          };
        }

        const vault = $vaults[chainId][vaultAddr];

        return {
          ...vault,
          APR: vault.earningData.apr.latest,
          proportions: { current, target },
        };
      })
    );

    const cleanedVaults = vaults.filter(Boolean);

    const protocolsAllocation = protocols
      .slice(1)
      .map((protocol) => {
        let allocation = 0;

        cleanedVaults.forEach((vault) => {
          const vaultsToCheck =
            vault?.type != VaultTypes.Vault ? vault.vaults : [vault];

          vaultsToCheck.forEach((v) => {
            const strategy = v.strategy;

            const isSiloMatch =
              protocol?.name === "Silo V2" && strategy.includes("Silo");

            const isStrategyMatch = protocol?.name.includes(strategy);

            if (isSiloMatch || isStrategyMatch) {
              allocation += Number(v.tvl || 0);
            }
          });
        });

        let creationDate = protocol?.creationDate ?? 0;

        let audits = protocol?.audits ?? [];

        if (protocol?.name.includes("Aave")) {
          creationDate =
            integrations.stability.protocols.stabilityMarket.creationDate;

          audits = integrations.stability.protocols.stabilityMarket.audits;
        }

        return { ...protocol, allocation, creationDate, audits };
      })
      .filter((protocol) => !!protocol.allocation);

    const totalAllocation = protocolsAllocation.reduce(
      (sum, p) => sum + p.allocation,
      0
    );

    const allocationsWithPercent = protocolsAllocation
      .map((p) => ({
        ...p,
        value: totalAllocation > 0 ? (p.allocation / totalAllocation) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    setLocalVaults(cleanedVaults);
    setFilteredVaults(cleanedVaults);
    setLocalProtocols(allocationsWithPercent);
    setFilteredProtocols(allocationsWithPercent);
    setLocalMetaVault({ ...metaVault, protocols });
    setIsLocalVaultsLoaded(true);
  };

  useEffect(() => {
    if ($isVaultsLoaded) {
      init();
      console.log(aprModal);
    }
  }, [$vaults, $metaVaults, $isVaultsLoaded]);

  const isLoading = useMemo(() => {
    return !$isVaultsLoaded || !isLocalVaultsLoaded;
  }, [$isVaultsLoaded, isLocalVaultsLoaded]);

  const TVL = useMemo(() => {
    if (localMetaVault.tvl) {
      return formatNumber(localMetaVault.tvl, "abbreviate");
    }
  }, [localMetaVault]);

  const symbol = deployments?.["146"]?.metaVaults?.find(
    (mv) => mv.address.toLowerCase() === metavault
  )?.symbol;

  const lastTabIndex = currentTab * pagination;
  const firstTabIndex = lastTabIndex - pagination;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  return (
    <div className="mx-auto flex flex-col gap-6 pb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-4 md:gap-10">
          <div>
            <h2 className="page-title__font text-start mb-4">{symbol}</h2>

            <h3 className="text-[#97979a] page-description__font">
              {symbol === "metaUSD" ? "Stablecoins" : symbol?.slice(4)} deployed
              across protocols automatically <br className="xl:block hidden" />{" "}
              rebalanced for maximum returns on Sonic
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
                  {formatNumber(localMetaVault?.totalAPR, "formatAPR")}%
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
            <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px] md:pl-[220px]">
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
                  protocols={filteredProtocols}
                  setAPRModalState={setAprModal}
                  setProtocolModalState={setProtocolModal}
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
          <Chart symbol={symbol as string} />
        </div>

        <div className="flex flex-col gap-5 w-full xl:w-[352px] mt-0 xl:mt-[64px]">
          <Form metaVault={localMetaVault} />
          <Contracts metavault={metavault} />
          {/* <LendingMarkets metavault={metavault} /> */}
        </div>
      </div>

      {modal && <Modal metaVault={localMetaVault} setModal={setModal} />}

      {protocolModal.state && (
        <ProtocolModal modal={protocolModal} setModal={setProtocolModal} />
      )}
    </div>
  );
};
export { Metavault };
