import type { TTableFilters, TTableColumn } from "@types";
import {
  USDC,
  USDT,
  DAI,
  WMATIC,
  WETH,
  WBTC,
  PROFIT,
  SDIV,
  PM,
  MULTISIG,
  TREASURY,
  cbETH,
  CRV,
} from "./tokens";
import { deployments } from "@stabilitydao/stability";

const APRsType = ["latest", "24h", "week"];

const TABLE: TTableColumn[] = [
  { name: "Symbol", keyName: "name", sortType: "none", dataType: "string" },
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
    name: "IL RISK",
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

const TABLE_FILTERS: TTableFilters[] = [
  { name: "Stablecoins", type: "single", state: false },
  { name: "Strategy", type: "dropdown", state: true },
  { name: "My vaults", type: "sample", state: false },
  { name: "Active", type: "sample", state: true },
];

const STABLECOINS = [...USDC, ...USDT, ...DAI, ...CRV];

const PAGINATION_VAULTS = 20;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const TIMESTAMPS_IN_SECONDS = {
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
};

const CHAINLINK_STABLECOINS = {
  USDT: "https://data.chain.link/feeds/polygon/mainnet/usdt-usd",
  "USDC.e": "https://data.chain.link/feeds/polygon/mainnet/usdc-usd",
  DAI: "https://data.chain.link/feeds/polygon/mainnet/dai-usd",
};

const DEXes = [
  { name: "QuickSwap", algo: "AlgebraV1", img: "/protocols/QuickSwap.svg" },
  { name: "Retro", algo: "Uniswap V3", img: "/protocols/Retro.svg" },
  { name: "Curve", algo: "StableSwapNG", img: "/protocols/Curve.png" },
  { name: "UniswapV3", algo: "Uniswap V3", img: "/protocols/Uniswap.svg" },
];

const CHAINS = [
  {
    name: "Polygon",
    id: "137",
    logoURI:
      "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/polygon.jpg",
    explorer: "https://polygonscan.com/address/",
    active: true, // main page active networks
  },
  {
    name: "Base",
    id: "8453",
    logoURI: "https://www.base.org/document/favicon-32x32.png",
    explorer: "https://basescan.org/address/",
    active: true, // main page active networks
  },
];

const TRANSACTION_SETTINGS = {
  slippage: ["0.5", "1", "2"],
  approves: ["limited", "unlimited"],
  gasLimits: ["1", "1.1"],
};

const DEFAULT_TRANSACTION_SETTINGS = {
  slippage: "1",
  approves: "unlimited",
  gasLimit: "1.1",
};

const YEARN_PROTOCOLS = ["aave", "stargate", "stmatic", "compound"];

const PROTOCOLS = {
  quickSwap: {
    name: "QuickSwap",
    logoSrc: "/protocols/QuickSwap.svg",
  },
  gamma: {
    name: "Gamma",
    logoSrc: "/protocols/Gamma.png",
  },
  compound: {
    name: "Compound",
    logoSrc: "/protocols/Compound.png",
  },
  defiedge: {
    name: "DefiEdge",
    logoSrc: "/protocols/DefiEdge.svg",
  },
  merkl: {
    name: "Merkl",
    logoSrc: "/protocols/Merkl.svg",
  },
  ichi: {
    name: "Ichi",
    logoSrc: "/protocols/Ichi.png",
  },
  retro: {
    name: "Retro",
    logoSrc: "/protocols/Retro.svg",
  },
  curve: {
    name: "Curve",
    logoSrc: "/protocols/Curve.png",
  },
  convex: {
    name: "Convex",
    logoSrc: "/protocols/Convex.png",
  },
  lido: {
    name: "Lido",
    logoSrc: "/protocols/Lido.png",
  },
  aave: {
    name: "Aave",
    logoSrc: "/protocols/Aave.png",
  },
  stargate: {
    name: "Stargate",
    logoSrc: "/protocols/Stargate.svg",
  },
  yearn: {
    name: "Yearn",
    logoSrc: "/protocols/Yearn.svg",
  },
  uniswapV3: {
    name: "UniswapV3",
    logoSrc: "/protocols/Uniswap.svg",
  },
};

const STRATEGY_SPECIFIC_SUBSTITUTE: {
  [key: string]: string;
} = {
  "0x1cd577ca15bcf35950a3bbfbd127a0835ff2f051": "MINIMAL",
};

const GRAPH_ENDPOINTS: { [key: string]: string } = {
  137: deployments[137].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
  8453: deployments[8453].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
};

const STABILITY_API = "https://api.stabilitydao.org/";

export {
  APRsType,
  TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  CHAINS,
  TRANSACTION_SETTINGS,
  DEFAULT_TRANSACTION_SETTINGS,
  GRAPH_ENDPOINTS,
  PROTOCOLS,
  STABILITY_API,
  PROFIT,
  PM,
  SDIV,
  WBTC,
  WETH,
  WMATIC,
  MULTISIG,
  TREASURY,
  MONTHS,
  TIMESTAMPS_IN_SECONDS,
  DEXes,
  CHAINLINK_STABLECOINS,
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
};
