import { chains, integrations } from "@stabilitydao/stability";

import {
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
} from "./tables";

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
  // cbETH,
  CRV,
  MORE,
  USTB,
  scUSD,
  STABILITY_TOKENS,
} from "./tokens";

const APRsType = ["latest", "24h", "week"];

const STABLECOINS = [
  ...USDC,
  ...USDT,
  ...DAI,
  ...CRV,
  ...MORE,
  ...USTB,
  ...scUSD,
];

const PAGINATIONS_VARIANTS = {
  rows: [5, 10, 15, 20, 30],
  grid: [4, 8, 12, 16, 20],
};

const PAGINATION_VAULTS = 5;

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

const DEXes = {
  quickswap: {
    name: "QuickSwap",
    algo: "AlgebraV1",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/QuickSwap.svg",
  },
  retro: {
    name: "Retro",
    algo: "Uniswap V3",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Retro.svg",
  },
  curve: {
    name: "Curve",
    algo: "StableSwapNG",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Curve.svg",
  },
  uniswapV3: {
    name: "UniswapV3",
    algo: "Uniswap V3",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Uniswap.svg",
  },
  pearlV2: {
    name: "Pearl V2",
    algo: "Pearl V2",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Pearl.png",
  },
  swapx: {
    name: "SwapX",
    algo: "",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/swapx.png",
  },
  shadow: {
    name: "Shadow",
    algo: "",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/shadow.png",
  },
  shadowExchange: {
    name: "Shadow Exchange",
    algo: "",
    img: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/shadow.png",
  },
};

const SILO_POINTS = {
  "0x709833e5b4b98aab812d175510f94bc91cfabd89": 25,
  "0x2fbeba931563feaab73e8c66d7499c49c8ada224": 42.4,
  "0xa51e7204054464e656b3658e7dbb63d9b0f150f1": 1,
  "0xd13369f16e11ae3881f22c1dd37957c241bd0662": 14,
  "0x4422117b942f4a87261c52348c36aefb0dcddb1a": 13.5,
  "0x908db38302177901b10ffa74fa80adaeb0351ff1": 13.5,
  "0x46bc0f0073ff1a6281d401cdc6cd56cec0495047": 9,
  "0x6bd40759e38ed47ef360a8618ac8fe6d3b2ea959": 10,
  "0x716ab48ec4054cf2330167c80a65b27cd57e09cf": 9,
  "0x59ab350ee281a24a6d75d789e0264f2d4c3913b5": 11.6,
  "0xade710c52cf4ab8be1ffd292ca266a6a4e49b2d2": 7,
  "0x376ddba57c649cee95f93f827c61af95ca519164": 7,
  "0x03645841df5f71dc2c86bbdb15a97c66b34765b6": 4.3,
  "0x425f26609e2309b9ab72cbf95092834e33b29a8a": 9.25,
};

const CHAINS = [
  {
    name: chains["137"].name,
    id: "137",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["137"].img}`,
    explorer: "https://polygonscan.com/address/",
    nativeCurrency: "POL",
    active: true, // main page active networks
  },
  {
    name: chains["8453"].name,
    id: "8453",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["8453"].img}`,
    explorer: "https://basescan.org/address/",
    nativeCurrency: "ETH",
    active: true, // main page active networks
  },
  {
    name: chains["146"].name,
    id: "146",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["146"].img}`,
    explorer: "https://sonicscan.org/address/",
    nativeCurrency: "S",
    active: true, // main page active networks
  },
];

const CHAINS_CONFIRMATIONS = {
  "137": 3,
  "146": 3,
  "8453": 3,
};

const YEARN_PROTOCOLS = ["aave", "stargate", "stmatic", "compound"];

const DEFAULT_TRANSACTION_SETTINGS = {
  slippage: "5",
  approves: "unlimited",
  gasLimit: "1.1",
};

const PROTOCOLS = Object.entries(integrations).reduce<
  Record<string, { name: string; logoSrc: string }>
>((acc, [integrationKey, value]) => {
  if (!acc[integrationKey]) {
    acc[integrationKey] = {
      name: value.name,
      logoSrc: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${value.img}`,
    };
  }

  Object.entries(value.protocols).forEach(([key, val]) => {
    const name = val.name;
    let logoSrc = `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${val.img ?? value.img}`;

    if (!acc[key])
      acc[key] = {
        name,
        logoSrc,
      };
  });

  return acc;
}, {});

const DEFAULT_ERROR = { state: false, type: "", description: "" };

const STRATEGY_SPECIFIC_SUBSTITUTE: {
  [key: string]: string;
} = {
  "0x1cd577ca15bcf35950a3bbfbd127a0835ff2f051": "MINIMAL",
};

const BIG_INT_VALUES = {
  ZERO: BigInt(0),
  LARGE: BigInt(10 ** 30),
};

const STABILITY_AAVE_POOLS = ["0x1f67..4ad8", "0xaa1c..1665", "0x4895..b094"];

const STABILITY_STRATEGY_LABELS: { [address: string]: string } = {
  [STABILITY_AAVE_POOLS[0]]: "Stream",
  [STABILITY_AAVE_POOLS[1]]: "Main",
  [STABILITY_AAVE_POOLS[2]]: "Stable Jack",
};

const PATHS = [
  // { name: "Dashboard", path: "dashboard" },
  { name: "All Vaults", path: "vaults" },
  { name: "Leveraged Farming", path: "leveraged-farming" },
  { name: "Meta Vaults", path: "metavaults" },
  { name: "ALM", path: "alm" },
  { name: "Users", path: "users" },
  { name: "xSTBL", path: "xstbl" },
  // { name: "Agents", path: "agents" },
  // { name: "Platform", path: "platform" },
];

export {
  APRsType,
  TABLE,
  TABLE_FILTERS,
  CHAINS_TABLE,
  PAGINATIONS_VARIANTS,
  PAGINATION_VAULTS,
  STABLECOINS,
  CHAINS,
  PROTOCOLS,
  PROFIT,
  PM,
  SDIV,
  WBTC,
  WETH,
  USDC,
  WMATIC,
  MULTISIG,
  TREASURY,
  MONTHS,
  TIMESTAMPS_IN_SECONDS,
  DEXes,
  CHAINLINK_STABLECOINS,
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
  DEFAULT_TRANSACTION_SETTINGS,
  DEFAULT_ERROR,
  BIG_INT_VALUES,
  ASSETS_TABLE,
  INTEGRATIONS_TABLE,
  STRATEGIES_TABLE,
  USERS_TABLE,
  CONTESTS_TABLE,
  LEADERBOARD_TABLE,
  CHAINS_CONFIRMATIONS,
  SONIC_TABLE,
  POOL_TABLE,
  BC_POOL_TABLE,
  DEFAULT_TABLE_PARAMS,
  SILO_POINTS,
  STABILITY_TOKENS,
  PATHS,
  METAVAULT_TABLE,
  STABILITY_AAVE_POOLS,
  STABILITY_STRATEGY_LABELS,
};
