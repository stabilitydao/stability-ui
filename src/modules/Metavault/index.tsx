import { useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { Form } from "./components/Form";
import { LendingMarkets } from "./components/LendingMarkets";
import { Table } from "./components/Table";
import { Contracts } from "./components/Contracts";
import { Chart } from "./components/Chart";

import { DisplayHandler } from "./components/DisplayHandler";
import { SectionHandler } from "./components/SectionHandler";

import { Modal } from "./components/Modals/Modal";
import { ProtocolModal } from "./components/Modals/ProtocolModal";

import { TextSkeleton } from "@ui";

import { getInitialStateFromUrl } from "./functions/getInitialStateFromUrl";

import { cn, formatNumber, dataSorter, updateQueryParams } from "@utils";

import { isVaultsLoaded, metaVaults, vaults } from "@store";

import {
  METAVAULT_TABLE,
  PROTOCOLS,
  PROTOCOLS_TABLE,
  CHAINS,
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
  MetaVaultDisplayTypes,
  MetaVaultSectionTypes,
} from "@types";

interface IProps {
  network: string;
  metavault: TAddress;
}

const Metavault: React.FC<IProps> = ({ network, metavault }) => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $isVaultsLoaded = useStore(isVaultsLoaded);

  const { display, section } = getInitialStateFromUrl();

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [localProtocols, setLocalProtocols] = useState<IProtocol[]>([]);

  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<IProtocol[]>([]);

  const [localMetaVault, setLocalMetaVault] = useState<TMetaVault>({});

  const [tableType, setTableType] = useState(MetaVaultTableTypes.Destinations);
  const [displayType, setDisplayType] = useState(display);
  const [activeSection, setActiveSection] = useState(section);

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

  const changeTables = (type: MetaVaultTableTypes) => {
    if (type === MetaVaultTableTypes.Destinations) {
      setTableStates(METAVAULT_TABLE);
    } else if (type === MetaVaultTableTypes.Protocols) {
      setTableStates(PROTOCOLS_TABLE);
    }
    setTableType(type);

    updateQueryParams({ table: type });
  };

  const changeDisplay = (type: MetaVaultDisplayTypes) => {
    if (type === MetaVaultDisplayTypes.Pro) {
      updateQueryParams({ display: type });
    } else {
      updateQueryParams({ display: null, section: null });
    }

    setDisplayType(type);
  };

  const changeSection = (section: MetaVaultSectionTypes) => {
    updateQueryParams({ section });
    setActiveSection(section);
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

    setTableStates(table);
  };

  const initMetavault = async () => {
    const metaVaultList = $metaVaults[network];

    if (!metaVaultList || !$vaults) return;

    const metaVault = metaVaultList.find(
      ({ address }: { address: TAddress }) => address === metavault
    );

    if (!metaVault) return;

    const protocols = ["Stability", ...metaVault.protocols]
      .filter((name) => !name.toLowerCase().includes("aave"))
      .map((name) =>
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

        const allocation = (Number(metaVault.tvl) / 100) * current;

        if (current <= 0.1 && !target) return null;

        if (isMetaVault) {
          const subMetaVault = metaVaultList.find(
            (v: TVault) => v.address === vaultAddr
          );

          if (!subMetaVault) return null;

          const vaultsData = entry.vaults
            .map((v) => {
              const addr = v.address.toLowerCase();
              const vault = $vaults[network][addr];
              const subProp = v.proportions;

              const current = subProp.current * 100;
              const target = subProp.target * 100;

              const allocation = (Number(metaVault.tvl) / 100) * current;

              return {
                ...vault,
                proportions: {
                  current,
                  target,
                  allocation,
                },
                APR: vault.earningData.apr.latest,
              };
            })
            .filter(({ proportions }) => proportions.current > 0.1);

          return {
            ...subMetaVault,
            proportions: { current, target, allocation: Number(metaVault.tvl) },
            vaults: vaultsData,
          };
        }

        const vault = $vaults[network][vaultAddr];

        return {
          ...vault,
          APR: vault.earningData.apr.latest,
          proportions: { current, target, allocation },
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

            const isEulerMatch =
              protocol?.name === "Euler V2" && strategy.includes("Euler");

            const isStrategyMatch = protocol?.name.includes(strategy);

            if (isEulerMatch || isSiloMatch || isStrategyMatch) {
              allocation += Number(v.proportions.allocation || 0);
            }
          });
        });

        if (protocol?.name.includes("Compound")) {
          protocol = PROTOCOLS.enclabs;
        }

        let creationDate = protocol?.creationDate ?? 0;

        let audits = protocol?.audits ?? [];

        if (protocol?.name.includes("Aave")) {
          creationDate = integrations.stability.protocols.stabilityMarket
            .creationDate as number;

          audits = integrations.stability.protocols.stabilityMarket.audits;
        }

        return { ...protocol, allocation, creationDate, audits };
      })
      .filter((protocol) => !!protocol.allocation);

    const totalAllocation = protocolsAllocation.reduce(
      (sum, p) => sum + p.allocation,
      0
    );

    const _protocols = protocolsAllocation
      .map((p) => ({
        ...p,
        value: totalAllocation > 0 ? (p.allocation / totalAllocation) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const checkedProtocols = protocols.map((protocol) =>
      protocol?.name.includes("Compound") ? PROTOCOLS.enclabs : protocol
    );

    setLocalVaults(cleanedVaults);
    setFilteredVaults(cleanedVaults);
    setLocalProtocols(_protocols);
    setFilteredProtocols(_protocols);
    setLocalMetaVault({ ...metaVault, protocols: checkedProtocols });
    setIsLocalVaultsLoaded(true);
  };

  useEffect(() => {
    if ($isVaultsLoaded) {
      initMetavault();
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

  const symbol = deployments?.[network]?.metaVaults?.find(
    (mv) => mv.address.toLowerCase() === metavault
  )?.symbol;

  const chain = CHAINS.find(({ id }) => id == network);

  return (
    <div className="mx-auto flex flex-col gap-6 pb-6 xl:min-w-[1230px]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-4 md:gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="page-title__font text-start">{symbol}</h2>
              <DisplayHandler
                displayType={displayType}
                changeDisplay={changeDisplay}
              />
            </div>

            <h3 className="text-[#97979a] page-description__font">
              {symbol === "metaUSD" ? "Stablecoins" : symbol?.slice(4)} deployed
              across protocols automatically <br className="xl:block hidden" />{" "}
              rebalanced for maximum returns on {chain?.name}
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
            {chain ? (
              <div className="flex flex-col gap-2 w-1/2 md:w-auto mt-2 md:mt-0">
                <span className="text-[#97979A] text-[14px] leading-5 font-medium">
                  Chain
                </span>
                <div className="font-semibold text-[18px] leading-6 flex items-center gap-3">
                  <img
                    className="w-6 h-6"
                    src={chain.logoURI}
                    alt={chain.name}
                    title={chain.name}
                  />
                  <span>{chain.name}</span>
                </div>
              </div>
            ) : null}

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

      <SectionHandler
        activeSection={activeSection}
        displayType={displayType}
        changeSection={changeSection}
      />

      {displayType === MetaVaultDisplayTypes.Lite ? (
        <div className="flex items-start justify-between flex-col-reverse xl:flex-row gap-6">
          <div className="flex flex-col gap-4 w-full xl:w-[850px]">
            <Table
              displayType={displayType}
              tableType={tableType}
              changeTables={changeTables}
              tableStates={tableStates}
              tableHandler={tableHandler}
              isLoading={isLoading}
              allVaults={localVaults}
              vaults={filteredVaults}
              protocols={filteredProtocols}
              setAPRModal={setAprModal}
              setProtocolModal={setProtocolModal}
            />

            <Chart
              network={network}
              symbol={symbol as string}
              display={displayType}
            />
          </div>

          <div className="flex flex-col gap-5 w-full xl:w-[352px] mt-0 xl:mt-[60px]">
            <Form
              network={network}
              metaVault={localMetaVault}
              displayType={displayType}
            />
            <Contracts network={network} metavault={metavault} />
            <LendingMarkets metavault={metavault} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {activeSection === MetaVaultSectionTypes.Operations ? (
            <div className="flex items-start flex-col md:flex-row gap-6 w-full">
              <Form
                network={network}
                metaVault={localMetaVault}
                displayType={displayType}
              />

              <div className="w-full flex flex-col gap-6">
                <Contracts network={network} metavault={metavault} />
                <LendingMarkets metavault={metavault} />
              </div>
            </div>
          ) : activeSection === MetaVaultSectionTypes.Allocations ? (
            <Table
              displayType={displayType}
              tableType={tableType}
              changeTables={changeTables}
              tableStates={tableStates}
              tableHandler={tableHandler}
              isLoading={isLoading}
              allVaults={localVaults}
              vaults={filteredVaults}
              protocols={filteredProtocols}
              setAPRModal={setAprModal}
              setProtocolModal={setProtocolModal}
            />
          ) : (
            <div className="w-full">
              <Chart
                network={network}
                symbol={symbol as string}
                display={displayType}
              />
            </div>
          )}
        </div>
      )}

      {modal && <Modal metaVault={localMetaVault} setModal={setModal} />}

      {protocolModal.state && (
        <ProtocolModal modal={protocolModal} setModal={setProtocolModal} />
      )}
    </div>
  );
};
export { Metavault };
