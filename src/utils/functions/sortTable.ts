import { dataSorter } from "./dataSorter";

import type { TTableColumn, TSort } from "@types";

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
          String(a[state.keyName]),
          String(b[state.keyName]),
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
