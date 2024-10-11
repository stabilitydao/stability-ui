import { dataSorter } from "./dataSorter";

import type { TTableColumn, TSort } from "@types";

import type { Chain } from "@stabilitydao/stability";

const sortTable = ({
  table,
  setTable,
  tableData,
  setTableData,
}: TSort): void => {
  let sortedVaults = tableData;

  table.forEach((state: TTableColumn) => {
    if (state.sortType !== "none") {
      sortedVaults = [...sortedVaults].sort((a, b) =>
        dataSorter(
          String(a[state.keyName as keyof Chain]),
          String(b[state.keyName as keyof Chain]),
          state.dataType,
          state.sortType
        )
      );
    }
  });

  setTableData(sortedVaults);
  setTable(table);
};

export { sortTable };
