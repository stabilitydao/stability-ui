import { EmptyTable } from "../EmptyTable";
import { Grid } from "./Grid";
import { Row } from "./Row";

import { cn } from "@utils";

import { TVault, DisplayTypes, TAPRModal } from "@types";

interface IProps {
  vaults: TVault[];
  display: DisplayTypes;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const FarmingTable: React.FC<IProps> = ({ vaults, display, setModalState }) => {
  if (!vaults?.length) {
    return <EmptyTable display={display} />;
  }

  return (
    <div
      key={display}
      className={cn(
        display === DisplayTypes.Rows &&
          "overflow-x-auto lg:overflow-x-visible hide-scrollbar",
        display === DisplayTypes.Grid &&
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
      )}
    >
      {vaults.map((vault: TVault, index: number) => {
        const aprValue = Number(vault?.earningData?.apr.latest);

        const apyValue = vault?.earningData?.apy.latest;

        const swapFeesAPRValue = vault?.earningData?.poolSwapFeesAPR.latest;

        const strategyAPRValue = vault?.earningData?.farmAPR.latest;

        const dailyAPRValue = (
          Number(vault?.earningData?.apr.latest) / 365
        ).toFixed(2);

        const gemsAprValue = Number(vault?.earningData?.gemsAPR.latest);

        const APR_DATA = {
          APR: aprValue.toFixed(2),
          APY: apyValue,
          swapFees: swapFeesAPRValue,
          strategyAPR: strategyAPRValue,
          dailyAPR: dailyAPRValue,
          gemsAPR: gemsAprValue.toFixed(2),
        };

        if (display === DisplayTypes.Grid) {
          return (
            <Grid
              key={`grid/${vault.name + index}`}
              APRs={APR_DATA}
              vault={vault}
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

export { FarmingTable };
