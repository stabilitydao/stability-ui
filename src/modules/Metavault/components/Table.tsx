import { ColumnSort } from "./ColumnSort";

import { FullPageLoader, MetaVaultsTable } from "@ui";

import { cn } from "@utils";

import {
  IProtocol,
  MetaVaultTableTypes,
  TTableColumn,
  TVault,
  TAPRModal,
  IProtocolModal,
  MetaVaultDisplayTypes,
} from "@types";

type TProps = {
  displayType: MetaVaultDisplayTypes;
  tableType: MetaVaultTableTypes;
  changeTables: (tableTypes: MetaVaultTableTypes) => void;
  tableStates: TTableColumn[];
  tableHandler: (columns: TTableColumn[]) => void;
  isLoading: boolean;
  allVaults: TVault[];
  vaults: TVault[];
  protocols: IProtocol[];
  setAPRModal: React.Dispatch<React.SetStateAction<TAPRModal>>;
  setProtocolModal: React.Dispatch<React.SetStateAction<IProtocolModal>>;
};

const Table: React.FC<TProps> = ({
  displayType,
  tableType,
  changeTables,
  tableStates,
  tableHandler,
  isLoading,
  allVaults,
  vaults,
  protocols,
  setAPRModal,
  setProtocolModal,
}) => {
  const isProDisplay = displayType === MetaVaultDisplayTypes.Pro;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
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
            onClick={() => changeTables(MetaVaultTableTypes.Destinations)}
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
            onClick={() => changeTables(MetaVaultTableTypes.Protocols)}
          >
            Protocols
          </span>
        </div>
      </div>
      <div
        className={cn(
          isProDisplay &&
            "overflow-x-auto md:overflow-x-visible overflow-y-hidden scrollbar-thin scrollbar-thumb-[#46484C] scrollbar-track-[#101012] lg:hide-scrollbar"
        )}
      >
        <div
          className={cn(
            "flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]",
            isProDisplay
              ? "min-[860px]:pl-[220px] w-[600px] md:w-full"
              : "md:pl-[220px]"
          )}
        >
          {tableStates.map((value: TTableColumn, index: number) => (
            <ColumnSort
              key={value.name + index}
              index={index}
              value={value.name}
              table={tableStates}
              displayType={displayType}
              sort={tableHandler}
            />
          ))}
        </div>

        <div>
          {isLoading ? (
            <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border rounded-b-lg border-[#23252A]">
              <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
                <FullPageLoader />
              </div>
            </div>
          ) : allVaults?.length ? (
            <MetaVaultsTable
              displayType={displayType}
              tableType={tableType}
              vaults={vaults}
              protocols={protocols}
              setAPRModalState={setAPRModal}
              setProtocolModalState={setProtocolModal}
            />
          ) : (
            <div className="text-start h-[60px] font-medium">No vaults</div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Table };
