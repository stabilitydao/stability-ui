import { useState, useEffect, useMemo } from "react";

import { Vault, Protocol } from "./Rows";
import { Donut } from "./Donut";

import { cn } from "@utils";

import { strategies } from "@stabilitydao/stability";

import { TVault, TAPRModal, MetaVaultTableTypes, IProtocol } from "@types";

interface IProps {
  tableType: MetaVaultTableTypes;
  vaults: TVault[];
  protocols: IProtocol[];
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const MetaVaultsTable: React.FC<IProps> = ({
  tableType,
  vaults,
  protocols,
  setModalState,
}) => {
  const [activeSection, setActiveSection] = useState({});

  const donutData = useMemo(() => {
    switch (tableType) {
      case MetaVaultTableTypes.Protocols: {
        return protocols.map((protocol) => {
          const matchedStrategy = Object.values(strategies).find((strategy) =>
            strategy.id.includes(protocol.name.slice(0, -3))
          );

          return {
            ...protocol,
            color: matchedStrategy?.color ?? "#ccc",
          };
        });
      }

      case MetaVaultTableTypes.Destinations: {
        const flatVaults = vaults.flatMap((vault) => {
          const baseColor = vault.strategyInfo?.color ?? "#ccc";
          const baseImg = vault.assets?.[0]?.logo ?? "";

          const baseProps = {
            symbol: vault.symbol,
            color: baseColor,
            img: baseImg,
            isHovered: false,
          };

          if (vault.type != "Vault") {
            const currentAllocation = vault.proportions?.current ?? 0;

            return vault.vaults.map((subVault) => ({
              address: subVault.address,
              symbol: subVault.symbol,
              color: subVault.strategyInfo?.color ?? "#ccc",
              img: subVault.assets?.[0]?.logo ?? "",
              value:
                ((subVault.proportions?.current ?? 0) / 100) *
                currentAllocation,
              isHovered: false,
            }));
          }

          return [
            {
              address: vault.address,
              ...baseProps,
              value: vault.proportions?.current ?? 0,
            },
          ];
        });

        return flatVaults.sort((a, b) => Number(b.value) - Number(a.value));
      }

      default:
        return [];
    }
  }, [vaults, protocols, tableType, strategies]);

  const getVaultAPRs = (vault: TVault) => {
    if (vault.type != "Vault") {
      return {
        APR: Number(vault?.totalAPR ?? 0).toFixed(2),
      };
    }

    const apr = Number(vault?.earningData?.apr.latest ?? 0);
    const dailyAPR = (apr / 365).toFixed(2);
    const gemsAPR = Number(vault?.earningData?.gemsAPR.latest ?? 0).toFixed(2);

    return {
      APR: apr.toFixed(2),
      APY: vault.earningData.apy.latest,
      swapFees: vault.earningData.poolSwapFeesAPR.latest,
      strategyAPR: vault.earningData.farmAPR.latest,
      dailyAPR,
      gemsAPR,
    };
  };

  useEffect(() => {
    if (donutData?.length) {
      setActiveSection(donutData[0]);
    }
  }, [donutData]);

  return (
    <div
      className={cn(
        "bg-[#101012] flex flex-col md:flex-row md:border-l border-[#23252A]"
      )}
    >
      <div className="md:sticky top-[80px] xl3:top-10 h-[220px] border-t border-x md:border-x-0 border-[#23252A] shrink-0">
        <Donut
          data={donutData}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
      <div className="flex flex-col w-full min-h-full border-x border-[#23252A]">
        {tableType === MetaVaultTableTypes.Destinations
          ? vaults.map((vault: TVault, index: number) => {
              if (vault.type === "Vault") {
                return (
                  <Vault
                    key={`row/${vault.name + index}`}
                    APRs={getVaultAPRs(vault)}
                    vault={vault}
                    activeVault={activeSection}
                    setModalState={setModalState}
                  />
                );
              }
              return (
                <div key={`row/${vault.name + index}`}>
                  <Vault
                    APRs={getVaultAPRs(vault)}
                    vault={vault}
                    activeVault={activeSection}
                    setModalState={setModalState}
                  />
                  {vault?.vaults?.map((endVault) => {
                    return (
                      <Vault
                        key={`row/${endVault.name + index}`}
                        APRs={getVaultAPRs(endVault)}
                        vault={endVault}
                        activeVault={activeSection}
                        setModalState={setModalState}
                        inserted={true}
                      />
                    );
                  })}
                </div>
              );
            })
          : protocols.map((protocol: IProtocol, index: number) => (
              <Protocol
                key={`row/${protocol.name + index}`}
                protocol={protocol}
                activeProtocol={activeSection}
              />
            ))}
      </div>
    </div>
  );
};

export { MetaVaultsTable };
