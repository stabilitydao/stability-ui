import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, sort }) => {
  const styles: Record<string, string> = {
    Assets: "min-w-[180px] text-left",
    Strategy: "w-[190px]",
    "Total APR": "min-w-[130px] text-right",
    "Extra rewards APR": "min-w-[100px] text-right",
    Price: "min-w-[80px]",
    TVL: "min-w-[95px] text-right",
    Balance: "min-w-[100px] text-end",
  };

  const tabController = () => {
    if (table[index].unsortable) return;

    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);

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
          const URLSortCase = nextCase === "descendentic" ? "desc" : "asc";

          const sortParam = `${column.name.toLowerCase()}-${URLSortCase}`;

          if (sortParam === "tvl-desc") {
            params.delete("sort");
          } else {
            params.set("sort", sortParam);
          }

          newUrl.search = `?${params.toString()}`;
          window.history.pushState({}, "", newUrl.toString());

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
      className={`text-[12px] font-manrope font-semibold ${table[index].unsortable ? "" : "cursor-pointer"} ${
        index < 5
          ? "px-2 min-[1130px]:px-4"
          : "pl-0 md:px-2  min-[1130px]:px-3 text-right"
      } py-2 whitespace-nowrap ${styles[value] || "text-center"}`}
      data-testid="sort"
    >
      <p
        className={`inline-block ${table[index].sortType !== "none" ? "text-neutral-50" : "text-neutral-600"}`}
      >
        {value}
      </p>

      {!table[index].unsortable && (
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
      )}
    </th>
  );
};
export { ColumnSort };
