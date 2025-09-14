import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, sort }) => {
  const styles: Record<string, string> = {
    Name: "w-1/2 min-[860px]:w-[40%]",
    Protocol: "w-1/2 min-[860px]:w-[30%]",
    APR: "w-1/2 min-[860px]:w-[15%] justify-end",
    Allocation:
      table.length === 6
        ? "w-1/2 min-[860px]:w-[20%] justify-end"
        : "hidden min-[860px]:flex w-[15%] justify-end",
    "Proportions (current / target)":
      "hidden min-[860px]:flex w-[30%] justify-end",
    Proportion: "hidden min-[860px]:flex md:w-[20%] justify-end",
    Audits: "hidden min-[860px]:flex w-[10%] justify-start",
    Accidents: "hidden min-[860px]:flex w-[10%] justify-start",
    Lifetime: "hidden min-[860px]:flex w-[10%] justify-start",
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
      className={`flex items-center text-[12px] font-manrope font-semibold ${table[index].unsortable ? "" : "cursor-pointer"} px-4 py-2 whitespace-nowrap ${styles[value] || "text-center"}`}
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

export { ColumnSort };
