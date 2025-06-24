import { useState, useEffect, useMemo } from "react";

import { Row } from "./Row";
import { ProtocolRow } from "./ProtocolRow";
import { Donut } from "./Donut";

import { cn } from "@utils";

import { strategies } from "@stabilitydao/stability";

import { TVault, TAPRModal } from "@types";

interface IProps {
  tableType: any;
  vaults: TVault[];
  protocols: any;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const MetaVaultsTable: React.FC<IProps> = ({
  tableType,
  vaults,
  protocols,
  setModalState,
}) => {
  const [activeVault, setActiveVault] = useState({});

  const donutVaults = useMemo(() => {
    if (tableType === "protocols") {
      return protocols.map((protocol) => {
        const color =
          Object.values(strategies).find((_) =>
            _.id.includes(protocol.name.slice(0, -3))
          )?.color || "#ccc";

        return { ...protocol, color };
      });
    }

    if (tableType === "destinations") {
      const flatVaults = vaults.flatMap((vault) => {
        const baseProps = {
          symbol: vault.symbol,
          color: vault.strategyInfo?.color ?? "#ccc",
          img: vault.assets?.[0]?.logo ?? "",
          isHovered: false,
        };

        if (vault?.isMetaVault) {
          const currentAllocation = vault.proportions?.current ?? 0;

          return vault.vaults.map((v) => ({
            address: v.address,
            symbol: v.symbol,
            color: v.strategyInfo?.color ?? "#ccc",
            img: v.assets?.[0]?.logo ?? "",
            value: ((v.proportions?.current ?? 0) / 100) * currentAllocation,
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
  }, [vaults, protocols, tableType]);

  useEffect(() => {
    if (donutVaults?.length) {
      setActiveVault(donutVaults[0]);
    }
  }, [donutVaults]);

  return (
    <div
      className={cn(
        "bg-[#101012] flex flex-col md:flex-row md:border-l border-[#23252A]"
      )}
    >
      <div className="md:sticky top-[80px] xl3:top-10 h-[220px] border-t border-x md:border-x-0 border-[#23252A] shrink-0">
        <Donut
          vaults={donutVaults}
          activeVault={activeVault}
          setActiveVault={setActiveVault}
        />
      </div>
      <div className="flex flex-col w-full min-h-full">
        {tableType === "destinations"
          ? vaults.map((vault: TVault, index: number) => {
              if (vault?.isMetaVault) {
                const APRs_DATA = { APR: Number(vault.APR).toFixed(2) };

                return (
                  <div key={`row/${vault.name + index}`}>
                    <Row
                      APRs={APRs_DATA}
                      vault={vault}
                      activeVault={activeVault}
                      setModalState={setModalState}
                    />
                    {vault.vaults.map((endVault) => {
                      const aprValue = Number(
                        endVault?.earningData?.apr.latest
                      );

                      const apyValue = endVault.earningData.apy.latest;

                      const swapFeesAPRValue =
                        endVault.earningData.poolSwapFeesAPR.latest;

                      const strategyAPRValue =
                        endVault.earningData.farmAPR.latest;

                      const dailyAPRValue = (
                        Number(endVault?.earningData?.apr.latest) / 365
                      ).toFixed(2);

                      const gemsAprValue = Number(
                        endVault.earningData.gemsAPR.latest
                      );

                      const APR_DATA = {
                        APR: aprValue.toFixed(2),
                        APY: apyValue,
                        swapFees: swapFeesAPRValue,
                        strategyAPR: strategyAPRValue,
                        dailyAPR: dailyAPRValue,
                        gemsAPR: gemsAprValue.toFixed(2),
                      };

                      return (
                        <Row
                          key={`row/${endVault.name + index}`}
                          APRs={APR_DATA}
                          vault={endVault}
                          activeVault={activeVault}
                          setModalState={setModalState}
                          inserted={true}
                        />
                      );
                    })}
                  </div>
                );
              }

              const aprValue = Number(vault?.earningData?.apr.latest);

              const apyValue = vault.earningData.apy.latest;

              const swapFeesAPRValue = vault.earningData.poolSwapFeesAPR.latest;

              const strategyAPRValue = vault.earningData.farmAPR.latest;

              const dailyAPRValue = (
                Number(vault?.earningData?.apr.latest) / 365
              ).toFixed(2);

              const gemsAprValue = 0;
              Number(vault.earningData.gemsAPR.latest);

              const APR_DATA = {
                APR: aprValue.toFixed(2),
                APY: apyValue,
                swapFees: swapFeesAPRValue,
                strategyAPR: strategyAPRValue,
                dailyAPR: dailyAPRValue,
                gemsAPR: gemsAprValue.toFixed(2),
              };

              return (
                <Row
                  key={`row/${vault.name + index}`}
                  APRs={APR_DATA}
                  vault={vault}
                  activeVault={activeVault}
                  setModalState={setModalState}
                />
              );
            })
          : protocols.map((protocol: any, index: number) => {
              return (
                <ProtocolRow
                  key={`row/${protocol.name + index}`}
                  protocol={protocol}
                  activeProtocol={activeVault}
                />
              );
            })}
      </div>
    </div>
  );
};

export { MetaVaultsTable };
