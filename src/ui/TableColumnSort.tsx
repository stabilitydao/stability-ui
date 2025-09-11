import { Dispatch, SetStateAction } from "react";

import { cn } from "@utils";

import type {
  TTableColumn,
  TSort,
  TTableData,
  TDispatchedTableData,
} from "@types";

type TProps = {
  index: number;
  value: string;
  sort: ({ table, setTable, tableData, setTableData }: TSort) => void;
  table: TTableColumn[];
  setTable: Dispatch<SetStateAction<TTableColumn[]>>;
  tableData: TTableData;
  setTableData: TDispatchedTableData;
};

const TableColumnSort: React.FC<TProps> = ({
  index,
  value,
  table,
  sort,
  setTable,
  tableData,
  setTableData,
}) => {
  const styles: Record<string, string> = {
    Rank: "hidden md:flex w-[10%] justify-start",
    Address: "w-[22.5%] hidden md:flex justify-start",
    Earned: "w-1/2 md:w-[22.5%] justify-end px-2 md:px-4",
    Deposit: "w-1/4 md:w-[22.5%] justify-end px-2 md:px-4",
    Status: "hidden lg:flex w-[10%] justify-start",
    Name: "w-[20%] justify-start",
    Dates: "hidden lg:flex w-[20%] justify-start",
    Task: "hidden lg:flex w-[20%] justify-end",
    Rewards: "w-full lg:w-[20%] justify-end",
    Quest: "hidden lg:flex w-[10%] justify-end",
    Points: "w-1/4 px-2 md:px-4 md:w-[22.5%] justify-end",
    "Earned in Metavaults":
      "hidden md:flex w-[40%] md:w-[20%] justify-center md:justify-end px-2 md:px-4",
    ID: "flex w-[10%] justify-start px-2 md:px-4",
    Chain: "flex w-[30%] md:w-[25%] justify-start px-2 md:px-4",
    TVL: "flex w-[15%] justify-start px-2 md:px-4",
  };

  const tabController = () => {
    if (table[index].unsortable) return;

    let nextCase: string = "";
    switch (table[index].sortType) {
      case "none":
        nextCase = "descendentic";
        break;
      case "ascendentic":
        nextCase = "descendentic";
        break;
      case "descendentic":
        nextCase = "ascendentic";
        break;
      default:
        break;
    }

    const updatedTable: TTableColumn[] = table.map(
      (column: TTableColumn, i: number) => {
        if (index === i) {
          return { ...column, sortType: nextCase };
        } else {
          return { ...column, sortType: "none" };
        }
      }
    );

    sort({ table: updatedTable, setTable, tableData, setTableData });
  };
  return (
    <div
      onClick={tabController}
      className={cn(
        "flex items-center justify-center text-[12px] font-manrope font-semibold px-4 py-2 whitespace-nowrap",
        !table[index].unsortable && "cursor-pointer",
        styles[value]
      )}
      data-testid="sort"
    >
      <p
        className={`${table[index].sortType !== "none" ? "text-white" : "text-[#97979A]"}`}
      >
        {value}
      </p>

      {!table[index].unsortable && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.8335 5.8995V7.00048H10.1668V5.8995L8.00016 3.56543L5.8335 5.8995ZM10.1668 10.1013V9.00032H5.8335V10.1013L8.00016 12.4354L10.1668 10.1013Z"
            fill="#97979A"
          />
        </svg>
      )}
    </div>
  );
};

export { TableColumnSort };
