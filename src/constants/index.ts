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
    keyName: "sortAPR",
    sortType: "none",
    dataType: "number",
  },
  {
    name: "VS HODL APR",
    keyName: "holdYearPercentDiff",
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
];

const DEXes = [
  { name: "QuickSwap", algo: "AlgebraV1", img: "/protocols/QuickSwap.svg" },
  { name: "Retro", algo: "Uniswap V3", img: "/protocols/Retro.svg" },
  { name: "Curve", algo: "StableSwapNG", img: "/protocols/Curve.png" },
];

const CHAINS = [
  {
    name: "Polygon",
    logoURI:
      "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/polygon.jpg",
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
};

const STRATEGYES_ASSETS_AMOUNTS = {
  "0x4753a6245cacf41187febfcb493a23784d859aca": {
    assets: [
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [49799582136499343n, 23067283n],
  },
  "0x68d482f2e1115281e8f83a567bd771327eae7f16": {
    assets: [
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [1143571n, 1153212712722401n],
  },
  "0xaa2746b88378fc51e1dd3c3c79d5cb6a7095c98f": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [65477369209952275375n, 68602052n],
  },
  "0xeeb0c8505e7f45051fa7c8469a2f19475887857f": {
    assets: [
      "0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [4228094213891775832n, 792002n],
  },
  "0xd7fa169c3d278d962e16d5eb9ce90bdcaebdda1d": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [95353275688642101855n, 8900892600803868n],
  },
  "0x81bff21784d8611a4996502ab3868a81b3feb582": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    ],
    assetsAmounts: [49949990n, 49737057n],
  },
  "0x88391344bd50f31963f68625a90cf820eed5bd76": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [45886038453386433708n, 68157687n],
  },
  "0x35d7e11445be6dd195863aa90891cc8152b6b0cd": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [57368904439019235515n, 22653379925211307n],
  },
  "0xb7552987d59ca0b2b6943dcb116302f2688171f2": {
    assets: [
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [0n, 0n],
  },
  "0x52e20af2296972070d18525d49b58ac9d2018bf4": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [30379595398340884103n, 65544612n],
  },
  "0x71d5e61def8174d0721c3343d39bb1ddc8e2f6bf": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [42257484n, 33104378n],
  },
  "0x534c1432e29496a8c79db1d4a1f01af89b85a5ee": {
    assets: [
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [18163n, 12295843n],
  },
  "0x81238acd1a45a14cce83e09f3da751030d0a5d05": {
    assets: [
      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [12873341n, 3256151330192553n],
  },
  "0xff2a917dd0b4c6cb2ccfa2a3fc036e04058318db": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [1025610938483551304904n, 109419513213926533n],
  },
  "0x74a12603ea995a03185c1427f3b34d17a8356697": {
    assets: ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"],
    assetsAmounts: [1997215n],
  },
  "0x505d0a2142912af3abd6f67f7ee194ec06226a0b": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [36987899905417201898n, 36603606751767167n],
  },
  "0x65309e558ab1bf30c85efb1b697875a618a47697": {
    assets: [
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [73213287331127769573n, 106781039n],
  },
  "0xdf2a496f4a5c440b143070e543a15c1469332327": {
    assets: [
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [124896n, 43640060641073631n],
  },
  "0xad0acf37c66a58cd74c435ebfc85057dfac353da": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [0n, 0n],
  },
  "0x5a1961581a4dadd2ea8d2de60783bd1417e74d8a": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [240679025032641135138n, 1317498569n],
  },
  "0xac24ef3010d35c4229dbeb7c6be9a48ce83ee76f": {
    assets: [
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [19531128208216297n, 55665664n],
  },
  "0x7c0a4247d3c287051cd824da13197cb1d7383787": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [53276952n, 50410905n],
  },
  "0x0b3baa3af6bd72578cc3c9b8c3f46b0b83806058": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [53276952n, 50410905n],
  },
  "0x205d754fb58f5c1c8376c3a69093becec3e8f2fd": {
    assets: [
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [500618n, 139500740374042124n],
  },
  "0x8f65a1a347064f2602387503fbabc401442a3f06": {
    assets: [
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
    assetsAmounts: [79809293360053011743n, 74527618n],
  },
  "0xb295f889740a1d5143558ba395a3477bac4ca028": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    ],
    assetsAmounts: [550000000n, 474244280207167612714n],
  },
  "0x2c9b5da9c33c9846061c4785a852ec86719f1620": {
    assets: [
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ],
    assetsAmounts: [0n, 0n],
  },
  "0xc2700292d94466df768c5d7448a9700722f4136f": {
    assets: [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ],
    assetsAmounts: [105542532n, 4894750034226052n],
  },
};

const GRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${
  import.meta.env.PUBLIC_GRAPH_API_KEY
}/subgraphs/id/3ZoXLL5NpCo7FxY5wNzVYuNAA7qF6AHsyhZLrEAensJG`;

const GRAPH_QUERY = `
      {
        vaultEntities {
          id
          apr
          assetsProportions
          strategy
          strategyId
          totalSupply
          created
          color
          upgradeAllowed
          vaultType
          version
          colorBackground
          deployAllowed
          vaultBuildingPrice
          underlying
          symbol
          strategySpecific
          strategyDescription
          name
          strategyAssets
          lastHardWork
          hardWorkOnDeposit
          assetsWithApr
          assetsAprs
          vaultStatus
          AssetsPricesOnCreation
          gasReserve
          NFTtokenID
          vaultHistoryEntity(orderBy: timestamp, orderDirection: desc, where: { APR24H_not: null, APRWeekly_not: null },first: 1) {
            APR24H
            APRWeekly
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
        assetHistoryEntities {
          id
          price
          timestamp
          address
        }
        lastFeeAMLEntities {
          id
          timestamps
          APRS
        }
      }
      `;

// vaultHistoryEntity {
//   APR24H
//   APRWeekly
// }

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
  GRAPH_ENDPOINT,
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
  STRATEGYES_ASSETS_AMOUNTS,
};
