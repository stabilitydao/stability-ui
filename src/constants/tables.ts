import type { TTableColumn, TTableFilters } from "@types";

const TABLE_FILTERS: TTableFilters[] = [
  { name: "Stablecoins", type: "single", state: false },
  { name: "Strategy", type: "dropdown", state: true },
  { name: "My vaults", type: "sample", state: false },
  { name: "Active", type: "sample", state: true },
];

const TABLE: TTableColumn[] = [
  { name: "Symbol", keyName: "symbol", sortType: "none", dataType: "string" },
  {
    name: "Assets",
    keyName: "assetsSymbol",
    sortType: "none",
    dataType: "string",
  },
  // { name: "Status", keyName: "status", sortType: "none", dataType: "number" },
  // {
  //   name: "Type",
  //   keyName: "type",
  //   sortType: "none",
  //   dataType: "string",
  // },
  {
    name: "Strategy",
    keyName: "strategy",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Income APR",
    keyName: "earningData",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "VS HODL APR",
    keyName: "lifetimeVsHoldAPR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "RISK",
    keyName: "il",
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
  {
    name: "Balance",
    keyName: "balance",
    sortType: "none",
    dataType: "number",
  },
];

const CHAINS_TABLE: TTableColumn[] = [
  {
    name: "Chain",
    keyName: "name",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "ID",
    keyName: "chainId",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "TVL",
    keyName: "tvl",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Treasury",
    keyName: "multisig",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Issue",
    keyName: "chainLibGithubId",
    sortType: "none",
    dataType: "number",
  },
  { name: "Status", keyName: "status", sortType: "none", dataType: "string" },
  {
    name: "Bridges",
    keyName: "chainId", //temp
    sortType: "none",
    dataType: "number",
  },
];

export { TABLE_FILTERS, TABLE, CHAINS_TABLE };
