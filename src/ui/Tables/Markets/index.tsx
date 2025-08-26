// import { EmptyTable } from "../EmptyTable";
// import { Grid } from "./Grid";
import { Row } from "./Row";

interface IProps {
  markets: any;
  //   display: DisplayTypes;
  //   isUserVaults: boolean;
  //   period: TAPRPeriod;
  //   setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const MarketsTable: React.FC<IProps> = ({
  markets,
  //   display,
  //   isUserVaults,
  //   period,
  //   setModalState,
}) => {
  //   if (!vaults?.length) {
  //     return <EmptyTable isUserVaults={isUserVaults} display={display} />;
  //   }

  return (
    <div
      // key={display}
      // className={cn(
      //   display === "grid" &&
      //     "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
      // )}
      className="flex flex-col gap-2"
    >
      {markets.map((market: any, index: number) => {
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
            key={`row/${market.name + index}`}
            market={market}
            // setModalState={setModalState}
          />
        );
      })}
    </div>
  );
};

export { MarketsTable };
