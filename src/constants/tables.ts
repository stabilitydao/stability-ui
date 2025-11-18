import type { TTableColumn, TTableFilters } from "@types";

const TABLE_FILTERS: TTableFilters[] = [
  { name: "Strategies", type: "dropdown", state: true },
  { name: "Stablecoins", type: "single", state: false },
  { name: "Meta Vaults", type: "single", state: false },
  { name: "My vaults", type: "sample", state: false },
  { name: "Active", type: "sample", state: true },
];

const FARMING_TABLE_FILTERS: TTableFilters[] = [
  { name: "Strategies", type: "dropdown", state: true },
];

const METAVAULTS_FILTERS: TTableFilters[] = [
  { name: "Flagships", type: "sample", state: true },
];

const MARKETS_TABLE_FILTERS: TTableFilters[] = [
  { name: "Active", type: "sample", state: true },
];

const TABLE: TTableColumn[] = [
  {
    name: "Strategy",
    key: "strategy",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "APR",
    key: "earningData",
    sortType: "none",
    dataType: "number",
  },

  { name: "TVL", key: "tvl", sortType: "none", dataType: "number" },
  {
    name: "Balance",
    key: "balanceInUSD",
    sortType: "none",
    dataType: "number",
  },
];

const CHAINS_TABLE: TTableColumn[] = [
  {
    name: "ID",
    key: "chainId",
    sortType: "ascendentic",
    dataType: "number",
  },
  {
    name: "Chain",
    key: "name",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "TVL",
    key: "tvl",
    sortType: "none",
    dataType: "number",
  },
  { name: "Status", key: "status", sortType: "none", dataType: "string" },
  {
    name: "Strategies",
    key: "strategies",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Bridges",
    key: "bridges",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Protocols",
    key: "protocols",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Assets",
    key: "assets",
    sortType: "none",
    dataType: "number",
  },
];

const ASSETS_TABLE: TTableColumn[] = [
  {
    name: "Symbol",
    key: "symbol",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Price",
    key: "price",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Tags",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Website",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];

const INTEGRATIONS_TABLE: TTableColumn[] = [
  {
    name: "Organization",
    key: "name",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Links",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Protocols",
    key: "protocolsLength",
    sortType: "none",
    dataType: "number",
  },
];

const STRATEGIES_TABLE: TTableColumn[] = [
  {
    name: "Id",
    key: "shortId",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Name",
    key: "id",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "State",
    key: "state",
    sortType: "none",
    dataType: "string",
  },
  {
    name: "Issue",
    key: "contractGithubId",
    sortType: "none",
    dataType: "number",
  },
];

const USERS_TABLE: TTableColumn[] = [
  {
    name: "Rank",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Address",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Earned",
    key: "earned",
    sortType: "descendentic",
    dataType: "number",
  },
  {
    name: "Points",
    key: "points",
    sortType: "descendentic",
    dataType: "number",
  },
  {
    name: "Deposit",
    key: "deposit",
    sortType: "none",
    dataType: "number",
  },
];

const HOLDERS_TABLE: TTableColumn[] = [
  {
    name: "Rank",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Address",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Power",
    key: "balance",
    sortType: "descendentic",
    dataType: "number",
  },
  {
    name: "Percentage",
    key: "percentage",
    sortType: "descendentic",
    dataType: "number",
  },
];

const CONTESTS_TABLE: TTableColumn[] = [
  {
    name: "Status",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Name",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Dates",
    key: "start",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Task",
    key: "minEarn",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Rewards",
    key: "rewardsLength",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Quest",
    key: "questsLength",
    sortType: "none",
    dataType: "number",
  },
];

const LEADERBOARD_TABLE: TTableColumn[] = [
  { name: "Rank", key: "rank", sortType: "none", dataType: "number" },
  {
    name: "Address",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },

  {
    name: "Earned",
    key: "earned",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Deposit",
    key: "deposit",
    sortType: "none",
    dataType: "number",
  },
];

const POOL_TABLE: TTableColumn[] = [
  {
    name: "Pool",
    key: "id",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "AMM ADAPTER",
    key: "ammAdapter",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN IN",
    key: "tokenIn",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN OUT",
    key: "tokenOut",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "ACTIONS",
    key: "actions",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];

const BC_POOL_TABLE: TTableColumn[] = [
  {
    name: "ID",
    key: "id",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "AMM ADAPTER",
    key: "ammAdapter",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "POOL",
    key: "pool",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN IN",
    key: "tokenIn",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "TOKEN OUT",
    key: "tokenOut",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];

const METAVAULT_TABLE: TTableColumn[] = [
  {
    name: "Name",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "APR",
    key: "APR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Allocation",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Proportions (current / target)",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
];

const PROTOCOLS_TABLE: TTableColumn[] = [
  {
    name: "Protocol",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Lifetime",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Audits",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Accidents",
    key: "",
    sortType: "none",
    dataType: "",
    unsortable: true,
  },
  {
    name: "Allocation",
    key: "allocation",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Proportion",
    key: "value",
    sortType: "none",
    dataType: "number",
  },
];

const LEVERAGE_FARMING_TABLE: TTableColumn[] = [
  {
    name: "Name",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },
  {
    name: "Lending Platform",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },
  {
    name: "Leverage",
    key: "leverage",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "LTV / Max LTV",
    key: "",
    sortType: "none",
    dataType: "number",
    unsortable: true,
  },
  {
    name: "APR",
    key: "earningData",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "TVL",
    key: "tvl",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Deposit",
    key: "balanceInUSD",
    sortType: "none",
    dataType: "number",
  },
];

const MARKET_TABLE: TTableColumn[] = [
  {
    name: "Market",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },
  {
    name: "Asset",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },
  {
    name: "Supply APR",
    key: "supplyAPR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Borrow APR",
    key: "borrowAPR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Supply TVL",
    key: "supplyTVLInUSD",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Utilization",
    key: "utilization",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "maxLTV / LT",
    key: "LTV",
    sortType: "none",
    dataType: "number",
  },
];

const MARKET_USERS_TABLE: TTableColumn[] = [
  {
    name: "User",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },

  {
    name: "Collateral",
    key: "collateral",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Debt",
    key: "debt",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Health Factor",
    key: "healthFactor",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Liquidation Price",
    key: "liquidationPrice",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "LTV",
    key: "LTV",
    sortType: "none",
    dataType: "number",
  },
];

const MARKET_LIQUIDATIONS_TABLE: TTableColumn[] = [
  {
    name: "User",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },

  {
    name: "Liquidator",
    key: "",
    sortType: "none",
    dataType: "string",
    unsortable: true,
  },
  {
    name: "Liquidated",
    key: "liquidated",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Debt coverred",
    key: "debt",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "Date",
    key: "timestamp",
    sortType: "none",
    dataType: "number",
  },
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
  DEFAULT_TABLE_PARAMS,
  POOL_TABLE,
  BC_POOL_TABLE,
  METAVAULT_TABLE,
  PROTOCOLS_TABLE,
  LEVERAGE_FARMING_TABLE,
  FARMING_TABLE_FILTERS,
  MARKET_TABLE,
  METAVAULTS_FILTERS,
  MARKET_USERS_TABLE,
  MARKET_LIQUIDATIONS_TABLE,
  HOLDERS_TABLE,
  MARKETS_TABLE_FILTERS,
};
