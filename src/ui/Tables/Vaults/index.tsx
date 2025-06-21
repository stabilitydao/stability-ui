import { EmptyTable } from "./EmptyTable";
import { Grid } from "./Grid";
import { Row } from "./Row";

import { cn } from "@utils";

import { TVault, TAPRModal, TAPRPeriod, DisplayTypes } from "@types";

interface IProps {
  vaults: TVault[];
  display: DisplayTypes;
  isUserVaults: boolean;
  period: TAPRPeriod;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const VaultsTable: React.FC<IProps> = ({
  vaults,
  display,
  isUserVaults,
  period,
  setModalState,
}) => {
  if (!vaults?.length) {
    return <EmptyTable isUserVaults={isUserVaults} display={display} />;
  }

  return (
    <div
      key={display}
      className={cn(
        display === "grid" &&
          "flex items-center gap-3 md:gap-6 flex-wrap justify-between"
      )}
    >
      {vaults.map((vault: TVault, index: number) => {
        const aprValue = vault?.isMetaVault
          ? Number(vault?.totalAPR)
          : Number(vault?.earningData?.apr[period]);

        const apyValue = vault?.earningData?.apy[period];

        const swapFeesAPRValue = vault?.earningData?.poolSwapFeesAPR[period];

        const strategyAPRValue = vault?.earningData?.farmAPR[period];

        const dailyAPRValue = (
          Number(vault?.earningData?.apr[period]) / 365
        ).toFixed(2);

        const gemsAprValue = Number(vault?.earningData?.gemsAPR[period]);

        const APR_DATA = {
          APR: aprValue.toFixed(2),
          APY: apyValue,
          swapFees: swapFeesAPRValue,
          strategyAPR: strategyAPRValue,
          dailyAPR: dailyAPRValue,
          gemsAPR: gemsAprValue.toFixed(2),
        };

        if (display === "grid") {
          return (
            <Grid
              key={`grid/${vault.name + index}`}
              APRs={APR_DATA}
              vault={vault}
              setModalState={setModalState}
            />
          );
        }

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

export { VaultsTable };
