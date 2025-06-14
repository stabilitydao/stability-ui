import type { TTableColumn, TTableFilters } from "@types";

const TABLE_FILTERS: TTableFilters[] = [
  { name: "Strategies", type: "dropdown", state: true },
  { name: "Stablecoins", type: "single", state: false },
  { name: "My vaults", type: "sample", state: false },
  { name: "Active", type: "sample", state: true },
];

const SONIC_TABLE: TTableColumn[] = [
  {
    name: "Assets",
    keyName: "assetsSymbol",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Strategy",
    keyName: "strategy",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "APR",
    keyName: "earningData",
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

const TABLE: TTableColumn[] = [
  { name: "Symbol", keyName: "symbol", sortType: "none", dataType: "string" },
  {
    name: "Assets",
    keyName: "assetsSymbol",
    sortType: "none",
    dataType: "string",
  },
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
    keyName: "vsHoldAPR",
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
    name: "Earned in Metavaults",
    keyName: "metaVaultsEarned",
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

const POOL_TABLE: TTableColumn[] = [
  {
    name: "ID",
    keyName: "id",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "AMM ADAPTER",
    keyName: "ammAdapter",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN IN",
    keyName: "tokenIn",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN OUT",
    keyName: "tokenOut",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];
const BC_POOL_TABLE: TTableColumn[] = [
  {
    name: "ID",
    keyName: "id",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "AMM ADAPTER",
    keyName: "ammAdapter",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "POOL",
    keyName: "pool",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN IN",
    keyName: "tokenIn",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN OUT",
    keyName: "tokenOut",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];

const METAVAULT_TABLE: TTableColumn[] = [
  {
    name: "Name",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "APR",
    keyName: "APR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Allocation (current / target)",
    keyName: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  // {
  //   name: "TVL",
  //   keyName: "tvl",
  //   sortType: "none",
  //   dataType: "number",
  // },
  // {
  //   name: "Deposit",
  //   keyName: "balanceInUSD",
  //   sortType: "none",
  //   dataType: "number",
  // },
];

const DEFAULT_TABLE_PARAMS = {
  search: 0,
  sort: 0,
  filters: 0,
};

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
  SONIC_TABLE,
  DEFAULT_TABLE_PARAMS,
  POOL_TABLE,
  BC_POOL_TABLE,
  METAVAULT_TABLE,
};
