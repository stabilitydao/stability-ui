import { useState, useEffect, useMemo } from "react";

import { Vault, Protocol } from "./Rows";
import { Donut } from "./Donut";

import { cn } from "@utils";

import { strategies } from "@stabilitydao/stability";

import {
  TVault,
  MetaVaultTableTypes,
  IProtocol,
  VaultTypes,
  IProtocolModal,
  MetaVaultDisplayTypes,
} from "@types";

interface IProps {
  displayType: MetaVaultDisplayTypes;
  hide: boolean;
  tableType: MetaVaultTableTypes;
  vaults: TVault[];
  protocols: IProtocol[];
  setProtocolModalState: React.Dispatch<React.SetStateAction<IProtocolModal>>;
}

const MetaVaultsTable: React.FC<IProps> = ({
  displayType,
  hide,
  tableType,
  vaults,
  protocols,
  setProtocolModalState,
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

          if (vault.type != VaultTypes.Vault) {
            const currentAllocation = vault.proportions?.current ?? 0;

            return vault?.vaults.map((subVault) => ({
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
    if (vault.type != VaultTypes.Vault) {
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

  const isProDisplay = displayType === MetaVaultDisplayTypes.Pro;

  return (
    <div
      className={cn(
        "bg-[#101012] flex flex-col md:flex-row md:border-l border-b rounded-b-lg border-[#23252A]",
        isProDisplay && "w-[600px] md:w-full"
      )}
    >
      <div
        className={cn(
          "md:sticky top-[80px] xl3:top-10 h-[220px] md:h-auto md:min-h-[220px] border-t border-x md:border-x-0 border-[#23252A] shrink-0",
          isProDisplay && "hidden min-[860px]:block"
        )}
      >
        <Donut
          data={donutData}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      <div className="flex flex-col w-full min-h-full border-x border-[#23252A]">
        {tableType === MetaVaultTableTypes.Destinations
          ? vaults.map((vault: TVault, index: number) => {
              const vaultProportion = vault.proportions;
              const current = Number(vaultProportion?.current) * 100;
              const target = Number(vaultProportion?.target) * 100;

              const showInPro = isProDisplay ? !hide || current > 0.1 : false;

              const showInDefault = !isProDisplay && current > 0.1 && target;

              if (!showInPro && !showInDefault) return null;

              const renderVault = (
                vaultData: TVault,
                inserted = false,
                keySuffix = ""
              ) => (
                <Vault
                  key={`vault-${vaultData.name}-${index}-${keySuffix}`}
                  isProDisplay={isProDisplay}
                  APRs={getVaultAPRs(vaultData)}
                  vault={vaultData}
                  activeVault={activeSection}
                  inserted={inserted}
                />
              );

              return (
                <div key={`row-${vault.name}-${index}`}>
                  {renderVault(vault)}

                  {vault.vaults?.map((endVault, i) => {
                    const endCurrent =
                      Number(endVault.proportions?.current ?? 0) * 100;

                    const shouldRenderEnd = isProDisplay
                      ? !hide || endCurrent > 0.1
                      : endCurrent > 0.1;

                    return shouldRenderEnd
                      ? renderVault(endVault, true, `sub-${i}`)
                      : null;
                  })}
                </div>
              );
            })
          : protocols.map((protocol: IProtocol, index: number) => {
              const showInPro = isProDisplay
                ? !hide || Number(protocol.allocation) > 0.1
                : false;

              const showInDefault =
                !isProDisplay && Number(protocol.allocation) > 0.1;

              if (!showInPro && !showInDefault) return null;
              return (
                <Protocol
                  key={`row/${protocol.name + index}`}
                  isProDisplay={isProDisplay}
                  protocol={protocol}
                  activeProtocol={activeSection}
                  setModalState={setProtocolModalState}
                />
              );
            })}
      </div>
    </div>
  );
};

export { MetaVaultsTable };
