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

const IL = {
  ASFN: {
    rate: 8,
    title: "High",
    desc: "The preset of the Stability ALM provides liquidity in the narrow range, often re-balancing the position (when the price deviates from the average by approximately +-3%). Every rebalancing results in a loss. The higher the volatility of the pair, the more re-balancing and the greater the loss.",
    color: "#f55e11",
  },
  GQFS: {
    rate: 1,
    title: "Zero exp",
    desc: "The strategy of the underlying liquidity provider (Gamma Stable LP) can rebalance the position by expanding it, but this happens extremely rarely, only at times of high volatility of the assets in the pool.",
    color: "#7af996",
  },
  GQFN: {
    rate: 8,
    title: "High",
    desc: "The strategy of the underlying liquidity provider (Gamma Narrow LP) provides liquidity in the narrow range, often rebalancing the position (when the price deviates from the average by approximately +-3.7%). Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#f55e11",
  },
  GQFW: {
    rate: 5,
    title: "Medium",
    desc: "The strategy of the underlying liquidity provider (Gamma Wide LP) provides liquidity in the wide range, rebalancing the position infrequently (when the price deviates from the average by approximately +-10%). Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#F5DA5B",
  },
  QSF: {
    rate: 0,
    title: "None",
    desc: "Liquidity in the form of stablecoins is provided in a fixed range, there are no rebalances, so there are no impermanent losses.",
    color: "#4aff71",
  },
  CF: {
    rate: 0,
    title: "None",
    desc: "Providing assets to the landing protocol does not incur impermanent losses.",
    color: "#4aff71",
  },
  DQMFN: {
    rate: 8,
    title: "High",
    desc: "The strategy of the underlying liquidity provider DefiEdge provides liquidity in the narrow range, often rebalancing the position. Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#f55e11",
  },
  IQMF: {
    rate: 4,
    title: "Medium",
    desc: "The strategy of the underlying liquidity provider Ichi provides liquidity in the wide range, not often rebalancing the position.",
    color: "#F5DA5B",
  },
  CCF: {
    rate: 1,
    title: "Zero exp",
    desc: "If asset prices in StableSwap pool are kept pegged , there are no impermanent losses.",
    color: "#7af996",
  },
  Y: {
    rate: 0,
    title: "None",
    desc: "Providing assets to the landing protocol does not incur impermanent losses.",
    color: "#4aff71",
  },
  QSMF: {
    rate: 0,
    title: "None",
    desc: "Liquidity in the form of stablecoins is provided in a fixed range, there are no rebalances, so there are no impermanent losses.",
    color: "#4aff71",
  },
  LOW: {
    rate: 3,
    title: "Low",
    desc: "We expect low impermanent loss for pegged Gamma preset.",
    color: "#D7F55B",
  },
  TPF: {
    rate: 5,
    title: "MEDIUM",
    desc: "Significant impermanent loss was noted during rebalancing with this ALM in volatile pools.",
    color: "#F5DA5B",
  },
  TPF_STABLE: {
    rate: 5,
    title: "Medium",
    desc: "We catch significant IL in stablecoin pairs with this strategy when depeg become..",
    color: "#F5DA5B",
  },
  BSF: {
    rate: 1,
    title: "Zero exp",
    desc: "There are no impermanent loss in Balancer Stable pools while pool balanced and assets pegged.",
    color: "#7af996",
  },
  EF_vAMM: {
    rate: 3,
    title: "Low",
    desc: "Low impermanent loss is expected for UniswapV2-like and similar not CL AMMs.",
    color: "#D7F55B",
  },
};

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
  IL,
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
