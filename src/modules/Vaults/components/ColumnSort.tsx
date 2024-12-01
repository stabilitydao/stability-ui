import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  sort: (table: TTableColumn[]) => void;
};

const styles: Record<string, string> = {
  Vault: "sticky left-0 md:relative z-10 min-w-[150px] w-[250px] bg-accent-950",
  "Income APR": "min-w-[130px]",
  "VS HODL APR": "min-w-[130px]",
  RISK: "text-center pl-2",
  TVL: "min-w-[95px]",
  Balance: "min-w-[100px]",
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, sort }) => {
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
      className={`text-[12px] font-manrope font-semibold px-2 min-[1130px]:px-4 py-2 text-center cursor-pointer whitespace-nowrap ${styles[value] || ""}`}
      data-testid="sort"
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
export { ColumnSort };
