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
    name: chains["111188"].name,
    id: "111188",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["111188"].img}`,
    explorer: "https://explorer.re.al/address/",
    nativeCurrency: "reETH",
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
  "111188": 1,
};

const YEARN_PROTOCOLS = ["aave", "stargate", "stmatic", "compound"];

const DEFAULT_TRANSACTION_SETTINGS = {
  slippage: "1",
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

export {
  APRsType,
  TABLE,
  TABLE_FILTERS,
  CHAINS_TABLE,
  PAGINATION_VAULTS,
  STABLECOINS,
  CHAINS,
  PROTOCOLS,
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
};
