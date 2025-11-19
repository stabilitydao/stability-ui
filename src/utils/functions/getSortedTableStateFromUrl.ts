import { TTableColumn } from "@types";

export const getSortedTableStateFromUrl = (
  defaultTable: TTableColumn[],
  sortType: string
): TTableColumn[] => {
  return defaultTable.map((col) => {
    if (sortType) {
      const [sortKey, sortDir] = sortType.split("-");
      const isMatch = col.name.toUpperCase() === sortKey.toUpperCase();
      if (isMatch) {
        return {
          ...col,
          sortType: sortDir === "desc" ? "descendentic" : "ascendentic",
        };
      }
    }

    return {
      ...col,
      sortType: "none",
    };
  });
};
