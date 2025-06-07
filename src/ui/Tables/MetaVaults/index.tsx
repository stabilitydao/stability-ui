import { Grid } from "./Grid";
import { Row } from "./Row";

import { cn } from "@utils";

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
  return (
    <div
      key={display}
      className={cn(
        display === "grid" &&
          "flex items-center gap-3 md:gap-6 flex-wrap justify-between"
      )}
    >
      {vaults.map((vault: TVault, index: number) => {
        if (vault?.isMetaVault) {
          const APRs_DATA = { APR: Number(vault.APR).toFixed(2) };

          return (
            <div key={`row/${vault.name + index}`}>
              <Row
                APRs={APRs_DATA}
                vault={vault}
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

        // if (display === "grid") {
        //   return (
        //     <Grid
        //       key={`grid/${vault.name + index}`}
        //       APRs={APR_DATA}
        //       vault={vault}
        //       setModalState={setModalState}
        //     />
        //   );
        // }

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
  );
};

export { MetaVaultsTable };
