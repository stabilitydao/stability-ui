import { cn } from "@utils";

import { MetaVaultDisplayTypes, TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  displayType: MetaVaultDisplayTypes;
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({
  index,
  value,
  table,
  displayType,
  sort,
}) => {
  const liteStyles: Record<string, string> = {
    Name: "w-1/2 md:w-[40%]",
    Protocol: "w-1/2 md:w-[30%]",
    APR: "w-1/2 md:w-[15%] justify-end",
    Allocation:
      table.length === 6
        ? "w-1/2 md:w-[20%] justify-end"
        : "hidden md:flex w-[15%] justify-end",
    "Proportions (current / target)": "hidden md:flex w-[30%] justify-end",
    Proportion: "hidden md:flex md:w-[20%] justify-end",
    Audits: "hidden md:flex w-[10%] justify-start",
    Accidents: "hidden md:flex w-[10%] justify-start",
    Lifetime: "hidden md:flex w-[10%] justify-start",
  };

  const proStyles: Record<string, string> = {
    Name: "sticky left-0 z-10 lg:relative w-[200px] md:w-[40%] bg-[#151618] lg:bg-transparent",
    Protocol:
      "sticky left-0 z-10 lg:relative w-[100px] md:w-[30%] bg-[#151618] lg:bg-transparent",
    APR: "w-[100px] md:w-[15%] justify-end",
    Allocation:
      table.length === 6
        ? "w-[100px] md:w-[20%] justify-end"
        : "w-[100px] md:w-[15%] justify-end",
    "Proportions (current / target)": "w-[200px] md:w-[30%] justify-end",
    Proportion: "w-[100px] md:w-[20%] justify-end",
    Audits: "w-[100px] md:w-[10%] justify-start",
    Accidents: "w-[100px] md:w-[10%] justify-start",
    Lifetime: "w-[100px] md:w-[10%] justify-start",
  };

  const styles =
    displayType === MetaVaultDisplayTypes.Lite ? liteStyles : proStyles;

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
        "flex items-center text-[12px] font-manrope font-semibold px-4 py-2 whitespace-nowrap",
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
