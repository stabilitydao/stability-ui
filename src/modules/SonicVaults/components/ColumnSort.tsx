import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, sort }) => {
  const styles: Record<string, string> = {
    // Type: "hidden xl:table-cell",
    Assets: "min-w-[180px]",
    Strategy: "hidden min-[1340px]:table-cell w-[190px]",
    "Income APR": "min-w-[130px]",
    "VS HODL APR": "min-w-[130px]",
    // Status: "table-cell",
    RISK: "text-center pl-2",
    Price: "min-w-[80px]",
    TVL: "min-w-[95px]",
    Balance: "min-w-[100px]",
  };

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
    sort(updatedTable);
  };
  return (
    <th
      onClick={tabController}
      className={`text-[12px] font-manrope font-semibold ${
        index < 5
          ? `px-2 min-[1130px]:px-4 ${
              value === "Symbol" &&
              "sticky left-0 md:relative z-10 min-w-[150px] w-[200px] bg-accent-950"
            }`
          : "pl-0 md:px-2  min-[1130px]:px-3 text-right"
      } py-2 text-center cursor-pointer whitespace-nowrap ${
        styles[value] || ""
      }`}
      data-testid="sort"
    >
      {value !== "APR / APY" ? (
        <p
          className={`inline-block ${table[index].sortType !== "none" ? "text-neutral-50" : "text-neutral-600"}`}
        >
          {value}
        </p>
      ) : (
        <p
          className={`inline-block ${table[index].sortType !== "none" ? "text-neutral-50" : "text-neutral-600"}`}
        >
          {window.innerWidth > 915 || window.innerWidth < 767 ? value : "APR"}
        </p>
      )}
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
export { ColumnSort };
