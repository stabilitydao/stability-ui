const TABLE = [
  { name: "Name", keyName: "name", sortType: "none", dataType: "string" },
  {
    name: "Type",
    keyName: "type",
    sortType: "none",
    dataType: "string",
    cssAdd: "hidden lg:table-cell",
  },
  {
    name: "Strategy",
    keyName: "strategy",
    sortType: "none",
    dataType: "string",
    cssAdd: "hidden md:table-cell",
  },
  {
    name: "Balance",
    keyName: "balance",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Price",
    keyName: "shareprice",
    sortType: "none",
    dataType: "number",
  },
  { name: "TVL", keyName: "tvl", sortType: "none", dataType: "number" },
  { name: "APR", keyName: "apr", sortType: "none", dataType: "number" },
];
const PAGINATION_VAULTS = 20;

export { TABLE, PAGINATION_VAULTS };
