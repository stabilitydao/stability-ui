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
  // {
  //   name: "Treasury",
  //   keyName: "multisig",
  //   sortType: "none",
  //   dataType: "string",
  // },
  // {
  //   name: "Issue",
  //   keyName: "chainLibGithubId",
  //   sortType: "none",
  //   dataType: "number",
  // },
  { name: "Status", keyName: "status", sortType: "none", dataType: "string" },
  {
    name: "Bridges",
    keyName: "bridgesCount",
    sortType: "none",
    dataType: "number",
  },
];

const ASSETS_TABLE: TTableColumn[] = [
  {
    name: "Symbol",
    keyName: "symbol",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Website",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Addresses",
    keyName: "addresses",
    sortType: "none",
    dataType: "number",
  },
];
const INTEGRATIONS_TABLE: TTableColumn[] = [
  {
    name: "Organization",
    keyName: "name",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Links",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Protocols",
    keyName: "protocolsLength",
    sortType: "none",
    dataType: "number",
  },
];
const STRATEGIES_TABLE: TTableColumn[] = [
  {
    name: "Id",
    keyName: "shortId",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Name",
    keyName: "id",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "State",
    keyName: "state",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Issue",
    keyName: "contractGithubId",
    sortType: "none",
    dataType: "number",
  },
];

const USERS_TABLE: TTableColumn[] = [
  {
    name: "Rank",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Address",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Earned",
    keyName: "earned",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Deposit",
    keyName: "deposit",
    sortType: "none",
    dataType: "number",
  },
];

export {
  TABLE_FILTERS,
  TABLE,
  CHAINS_TABLE,
  ASSETS_TABLE,
  INTEGRATIONS_TABLE,
  STRATEGIES_TABLE,
  USERS_TABLE,
};
