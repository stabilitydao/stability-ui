import { useState, useEffect, useMemo } from "react";

import { Row } from "./Row";
import { Donut } from "./Donut";

import { cn } from "@utils";

import { META_VAULTS_COLORS } from "@constants";

import { TVault, TAPRModal, DisplayTypes } from "@types";

interface IProps {
  vaults: TVault[];
  display: DisplayTypes;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const MetaVaultsTable: React.FC<IProps> = ({
  vaults,
  display,
  setModalState,
}) => {
  const [defaultVault, setDefaultVault] = useState({});
  const [activeVault, setActiveVault] = useState({});

  const donutVaults = useMemo(() => {
    const flatVaults = vaults.flatMap((vault) => {
      const mainImg = vault?.isMetaVault
        ? `/features/${vault.symbol}.png`
        : vault.assets[0]?.logo;

      const result = [
        {
          address: vault.address,
          symbol: vault.symbol,
          color:
            META_VAULTS_COLORS?.[
              vault.address as keyof typeof META_VAULTS_COLORS
            ],
          img: mainImg,
          value: Number(vault.tvl),
          isHovered: false,
        },
      ];

      if (vault?.vaults?.length) {
        const subVaults = vault.vaults.map((v) => ({
          address: v.address,
          symbol: v.symbol,
          color: v.strategyInfo.color,
          img: v.assets[0]?.logo,
          value: Number(v.tvl),
          isHovered: false,
        }));

        result.push(...subVaults);
      }

      return result;
    });

    const total = flatVaults.reduce((sum, v) => sum + v.value, 0);

    const withPercentage = flatVaults.map((v) => ({
      ...v,
      percentage: total > 0 ? ((v.value / total) * 100).toFixed(2) : "0.00",
    }));

    return withPercentage.sort((a, b) => b.value - a.value);
  }, [vaults]);

  useEffect(() => {
    if (donutVaults?.length) {
      setDefaultVault(donutVaults[0]);
      setActiveVault(donutVaults[0]);
    }
  }, [donutVaults]);

  return (
    <div
      key={display}
      className={cn("bg-[#101012] flex border-l border-[#23252A]")}
    >
      <div className="sticky top-[80px] xl3:top-10 w-[220px]  h-[220px] border-t border-[#23252A] shrink-0">
        <Donut
          vaults={donutVaults}
          activeVault={activeVault}
          setActiveVault={setActiveVault}
        />
      </div>
      <div className="flex flex-col">
        {vaults.map((vault: TVault, index: number) => {
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
                  const aprValue = Number(endVault?.earningData?.apr.latest);

                  const apyValue = endVault.earningData.apy.latest;

                  const swapFeesAPRValue =
                    endVault.earningData.poolSwapFeesAPR.latest;

                  const strategyAPRValue = endVault.earningData.farmAPR.latest;

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
              setModalState={setModalState}
            />
          );
        })}
      </div>
    </div>
  );
};

export { MetaVaultsTable };
