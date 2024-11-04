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
  { name: "TVL", keyName: "tvl", sortType: "none", dataType: "number" },
  {
    name: "Balance",
    keyName: "balanceInUSD",
    sortType: "none",
    dataType: "number",
  },
];

const CHAINS_TABLE: TTableColumn[] = [
  {
    name: "ID",
    keyName: "chainId",
    sortType: "ascendentic",
    dataType: "number",
  },
  {
    name: "Chain",
    keyName: "name",
    sortType: "none",
    dataType: "string",
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
    name: "Strategies",
    keyName: "strategies",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Bridges",
    keyName: "bridges",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Protocols",
    keyName: "protocols",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Assets",
    keyName: "assets",
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
    name: "Price",
    keyName: "price",
    sortType: "none",
    dataType: "number",
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
    sortType: "descendentic",
    dataType: "number",
  },
  {
    name: "Deposit",
    keyName: "deposit",
    sortType: "none",
    dataType: "number",
  },
];

const CONTESTS_TABLE: TTableColumn[] = [
  {
    name: "Status",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Name",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Dates",
    keyName: "start",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Task",
    keyName: "minEarn",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Rewards",
    keyName: "rewardsLength",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Quest",
    keyName: "questsLength",
    sortType: "none",
    dataType: "number",
  },
];

const LEADERBOARD_TABLE: TTableColumn[] = [
  { name: "Rank", keyName: "rank", sortType: "none", dataType: "number" },
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
  CONTESTS_TABLE,
  LEADERBOARD_TABLE,
};
