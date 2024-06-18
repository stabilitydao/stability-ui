import type { TVaultStatuses, TTableFilters, TTableColumn } from "@types";
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

const APRsType = ["latest", "24h", "week"];

const TABLE: TTableColumn[] = [
  { name: "Symbol", keyName: "name", sortType: "none", dataType: "string" },
  { name: "Status", keyName: "status", sortType: "none", dataType: "number" },
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

const TOKENS_ASSETS = [
  {
    symbol: "USDC",
    addresses: USDC,
    description:
      "USDC is a fully-reserved stablecoin, which is a type of cryptocurrency, or digital asset. Unlike other cryptocurrencies that fluctuate in price, USDC is designed to maintain price equivalence to the US dollar.",
    website: "https://www.circle.com/en/usdc",
    docs: "https://developers.circle.com/stablecoins/docs",
    color: "#3b87df",
  },
  {
    symbol: "USDT",
    addresses: USDT,
    description:
      "Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar. The idea was to create stable digital cash. Tether converts cash into digital currency, to anchor or “tether” the value of the coin to the price of national currencies like the US dollar, the Euro, and the Yen.",
    website: "https://tether.to/en/",
    docs: "https://tether.to/en/knowledge-base/",
    color: "#5bc7af",
  },
  {
    symbol: "DAI",
    addresses: DAI,
    description:
      "DAI is an algorithmic stablecoin issued by MakerDAO, an Ethereum-based protocol, that seeks to maintain an exact ratio of one-to-one with the U.S. dollar.",
    website: "https://makerdao.com/",
    docs: "https://docs.makerdao.com/smart-contract-modules/dai-module/dai-detailed-documentation",
    color: "#f3ba42",
  },
  {
    symbol: "WMATIC",
    addresses: WMATIC,
    description:
      "WMATIC is a wrapped version of MATIC that enables it to be easily used within DeFi.",
    website: "https://polygon.technology/",
    docs: "https://wiki.polygon.technology/",
    color: "#9663ee",
  },
  {
    symbol: "WETH",
    addresses: WETH,
    description:
      "WETH is an ERC-20 token on Ethereum that represents 1 Ether (ETH)",
    website: "https://ethereum.org/en/",
    docs: "https://ethereum.org/en/developers/docs/",
    color: "#6372a2",
  },
  {
    symbol: "WBTC",
    addresses: WBTC,
    description:
      "WBTC is an ERC-20 token on the Ethereum blockchain that is pegged to Bitcoin (BTC). WBTC is backed one-to-one with Bitcoin. Before WBTC, the only way to use Bitcoin in a financial transaction was through centralized entities, like centralized exchanges (CEXs).",
    website: "https://wbtc.network/",
    docs: "",
    color: "#f0a051",
  },
  {
    symbol: "PROFIT",
    addresses: PROFIT,
    description:
      "The native token PROFIT's primary purpose is to represent ownership shares of the Stability protocol. Given PROFIT holders are effectively owners of Stability. Holding the token also allows investors to manage the Stability protocol collectively.",
    website: "https://stabilitydao.org/tokens",
    docs: "https://book.stabilitydao.org/tokens.html#profit",
    color: "#886ac3",
  },
  {
    symbol: "SDIV",
    addresses: SDIV,
    description:
      "The SDIV token is intended to distribute the externally generated profit of the organization in the form of dividends.",
    website: "https://stabilitydao.org/tokens",
    docs: "https://book.stabilitydao.org/tokens.html#sdiv",
    color: "#232323",
  },
  {
    symbol: "crvUSD",
    addresses: CRV,
    description:
      "crvUSD is a collateralized-debt-position (CDP) stablecoin pegged to the US Dollar",
    website: "https://crvusd.curve.fi/",
    docs: "https://resources.curve.fi/",
    color: "#397949",
  },
  {
    symbol: "cbETH",
    addresses: cbETH,
    description: "Coinbase Wrapped Staked ETH",
    website: "https://www.coinbase.com/",
    docs: "https://www.coinbase.com/developer-platform",
    color: "#0454ff",
  },
];

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

const VAULT_STATUSES: TVaultStatuses = {
  0: "NOT_EXIST",
  1: "ACTIVE",
  2: "DEPRECATED",
  3: "EMERGENCY_EXIT",
  4: "DISABLED",
  5: "DEPOSITS_UNAVAILABLE",
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
  137: `https://gateway-arbitrum.network.thegraph.com/api/${
    import.meta.env.PUBLIC_GRAPH_API_KEY
  }/subgraphs/
id/7WgM7jRzoW7yiJCE8DMEwCxtN3KLisYrVVShuAL2Kz4N`,
  8453: `https://gateway-arbitrum.network.thegraph.com/api/${
    import.meta.env.PUBLIC_GRAPH_API_KEY
  }/subgraphs/id/8uU5LrpCLCP1P31GBCUXu8AdWKQ2aW6mKTKsr2ssUdJS`,
};

const GRAPH_QUERY = `
      {
        vaultEntities {
          id
          apr
          assetsProportions
          strategy
          strategyId
          created
          vaultType
          version
          underlying
          symbol
          strategySpecific
          strategyDescription
          name
          strategyAssets
          lastHardWork
          hardWorkOnDeposit
          vaultStatus
          AssetsPricesOnCreation
          gasReserve
          NFTtokenID
          vaultHistoryEntity(orderBy: timestamp, orderDirection: desc, where: { APR24H_not: null, APRWeekly_not: null },first: 1) {
            APR24H
            APRWeekly
            daysFromCreation
            lifetimeVsHoldAPR
            lifetimeTokensVsHoldAPR
          }
          almRebalanceHistoryEntity(orderBy: timestamp, orderDirection: desc, where: { APR24H_not: null, APRWeekly_not: null }) {
            timestamp
            APRFromLastEvent
            APR24H
            APRWeekly
          }
        }
        platformEntities {
          version
          bcAssets
          zap
          factory
          buildingPayPerVaultToken
          buildingPermitToken
        }
        vaultTypeEntities {
          version
          id
        }
        strategyEntities {
          strategyId
          version
          pool
          underlyingSymbol
          id
        }
        strategyConfigEntities {
          version
          id
        }
      }
      `;

const STABILITY_API = "https://api.stabilitydao.org/";

export {
  APRsType,
  TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  TOKENS_ASSETS,
  STABLECOINS,
  CHAINS,
  TRANSACTION_SETTINGS,
  DEFAULT_TRANSACTION_SETTINGS,
  GRAPH_ENDPOINTS,
  PROTOCOLS,
  GRAPH_QUERY,
  STABILITY_API,
  PROFIT,
  PM,
  SDIV,
  WBTC,
  WETH,
  WMATIC,
  VAULT_STATUSES,
  MULTISIG,
  TREASURY,
  MONTHS,
  TIMESTAMPS_IN_SECONDS,
  DEXes,
  CHAINLINK_STABLECOINS,
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
};
