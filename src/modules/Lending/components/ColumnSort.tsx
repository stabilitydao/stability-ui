import { cn } from "@utils";

import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, sort }) => {
  const styles: Record<string, string> = {
    Market:
      "sticky left-0 z-10 lg:relative w-[150px] md:w-[20%] bg-[#151618] lg:bg-transparent",
    Asset: "w-[100px] md:w-[15%]",
    "Supply APR": "w-[100px] md:w-[13%] justify-end",
    "Borrow APR": "w-[100px] md:w-[13%] justify-end",
    "Supply TVL": "w-[100px] md:w-[13%] justify-end",
    Utilization: "w-[150px] md:w-[13%] text-center justify-end",
    "maxLTV / LT": "w-[150px] md:w-[13%] justify-end",
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
    <div
      onClick={tabController}
      className={cn(
        "whitespace-nowrap flex items-center text-[12px] font-manrope font-semibold px-2 md:px-4 py-2",
        !table[index].unsortable && "cursor-pointer",
        styles[value] || "text-center"
      )}
      data-testid="sort"
    >
      <p
        className={cn(
          table[index].sortType !== "none" ? "text-white" : "text-[#97979A]"
        )}
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
export { ColumnSort };
