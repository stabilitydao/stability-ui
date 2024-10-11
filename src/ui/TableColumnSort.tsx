import { Dispatch, SetStateAction } from "react";

import type { TTableColumn, IChainData, TSort } from "@types";

type TProps = {
  index: number;
  value: string;
  sort: ({ table, setTable, tableData, setTableData }: TSort) => void;
  table: TTableColumn[];
  setTable: Dispatch<SetStateAction<TTableColumn[]>>;
  tableData: IChainData[];
  setTableData: Dispatch<SetStateAction<IChainData[]>>;
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
  const tabController = () => {
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
    <th
      onClick={tabController}
      className="text-[12px] font-manrope font-semibold cursor-pointer"
    >
      <p
        className={`inline-block ${table[index].sortType !== "none" ? "text-neutral-50" : "text-neutral-600"}`}
      >
        {value}
      </p>

      <svg
        width="15"
        height="14"
        viewBox="0 0 15 14"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ml-1 transition duration-300 ease-in-out ${
          table[index].sortType === "ascendentic" && "rotate-[180deg]"
        }`}
      >
        <path
          d="M7.50008 2.91669V11.0834M7.50008 11.0834L11.5834 7.00002M7.50008 11.0834L3.41675 7.00002"
          stroke={table[index].sortType !== "none" ? "#F9F8FA" : "#958CA1"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </th>
  );
};

export { TableColumnSort };
