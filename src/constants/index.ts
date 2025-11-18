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

import { VAULTS_META_TITLES } from "./meta";

import { IProtocol } from "@types";

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

const PAGINATION_LIMIT = 20;

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
    name: chains["146"].name,
    id: "146",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["146"].img}`,
    explorer: "https://sonicscan.org",
    nativeCurrency: "S",
    color: "#000000",
    active: true,
  },
  {
    name: chains["43114"].name,
    id: "43114",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["43114"].img}`,
    explorer: "https://snowtrace.io",
    nativeCurrency: "AVAX",
    color: "#E84142",
    active: true,
  },
  {
    name: chains["9745"].name,
    id: "9745",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["9745"].img}`,
    explorer: "https://plasmascan.to",
    nativeCurrency: "XPL",
    color: "#15322A",
    active: true,
  },
];

const CHAINS_CONFIRMATIONS = {
  "146": 3,
  "9745": 3,
  "43114": 3,
};

const YEARN_PROTOCOLS = ["aave", "stargate", "stmatic", "compound"];

const DEFAULT_TRANSACTION_SETTINGS = {
  slippage: "5",
  approves: "unlimited",
  gasLimit: "1.4",
};

const PROTOCOLS = Object.entries(integrations).reduce<
  Record<string, IProtocol>
>((acc, [integrationKey, integration]) => {
  const addProtocol = (key: string, data: any, fallbackImg: string) => {
    if (acc[key]) return;

    acc[key] = {
      name: data.name,
      logoSrc: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${data.img ?? fallbackImg}`,
      audits: data.audits ?? [],
      accidents: data.accidents ?? [],
      creationDate: data.creationDate ?? 0,
    };
  };

  addProtocol(integrationKey, integration, integration.img);

  Object.entries(integration.protocols ?? {}).forEach(([key, val]) =>
    addProtocol(key, val, integration.img)
  );

  return acc;
}, {});

const DEFAULT_ERROR = { state: false, type: "", description: "" };

const STRATEGY_SPECIFIC_SUBSTITUTE: {
  [key: string]: string;
} = {
  "0x1cd577ca15bcf35950a3bbfbd127a0835ff2f051": "MINIMAL",
  "0x9040643a179157ea835706ee31c492680fb3ab3e": "K3",
  "0x0e5b52afa8acda11f2996a2094afe73fd5503d81": "Re7",
  "0x2c51d2c9857f7b52daee8cc3540487daa249e605": "Keyring",
  "0xe5019af6e2db85229a7572a01f3714a2fb70f607": "MEV",
  "0x0afe245a43f6a3914aa0dc8435457734c6edb971": "MEV",
  "0x7b5fffe819871f2127e4884798d83adb5db1be64": "Varlamore",
  "0xda57af45bf0b7c4de4a5bc66ca993cab704aa6a1": "Varlamore",
  "0x058779961ae874d29f9cecfd29df7456164a0f64": "Mainstreet",
  "0x2120a3159df9f3b6276f276e4cee8f47cf548c2f": "Mainstreet Greenhouse",
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

const VAULTS_WITH_NAME = {
  "0xa51e7204054464e656b3658e7dbb63d9b0f150f1": "Silo USDC (53)",
  "0x86a4a379d9a2a3b3f0e1f8aa477c82f646344458": "Silo (54)",
  "0xa70f074ee09df3c0ab7e9eb0c058941ff65b8efe": "Valmore S",
  "0xf6fc4ea6c1e6dcb68c5ffab82f6c0ad2d4c94df9": "Valmore",
  "0x9443c25624c8ab74fade003bc76d2ac35244b925": "Greenhouse",
  "0xd627ed348569ff34750a1fb5fd13ea849ccf3440": "Stability Credix USDC",
  "0x25a2e994deb1009b0b6bb7cba30bc25afe8be016": "Stability Credix scUSD",
  "0xa6f8bc82ab88f74ce6c69feb8a4d2f5181a49647": "Stability Credix WS",
  "0x7bcec157a1d10f00391e9e782de5998fabcc1aa7": "Credix USDC",
  "0xf63614b859c9e8103d73bb49e002e27f3776af93": "Credix scUSD",
  "0x561c88552a9379246bc5bdd82f9f196231c435f3": "Credix WS",
  "0x0c8ce5afc38c94e163f0ddeb2da65df4904734f3": "Stability Stream USDC",
  "0x7fc269e8a80d4cfbbcfab99a6bceac06227e2336": "Stability Stablejack USDC",
  "0x402ae122caece6ce57203e3bd4af7d1e9ac446cb": "Stability USDC",
  "0xfbb02d242527f3b56af3f087acddaa25d5e8acc4": "scUSD mev Capital",
  "0xb94b31f3dedaadbda6aa1cec4f49749273929972": "scUSD re7 Labs",
  "0x14d17757e88df8f59069ffa573570a50ed652866": "Silo scUSD 46",
  "0x2ebb3c7808b86f94df9731ae830ab6ea8cb431d8": "Silo USDC 27",
  "0xc33568559c8338581bb6914d6f2d024a063886e8": "Silo USDC 49",
  "0x8913582701b7c80e883f9e352c1653a16769b173": "Silo xUSD",
  "0x96a8055090e87bfe18bdf3794e9d676f196efd80": "Silo USDC 8",
  "0xd248c4b6ec709feed32851a9f883afeac294ad30": "SIlo USDC 34",
  "0x38274302e0dd5779b4e0a3e401023cfb48ff5c23": "Silo USDC 36",
  "0x449bf92ec47985c452081ecf5e89aa7075b6e8b2": "Greenhouse S",
  "0xefdf0f2b8d056009bd50125b76567110ad52ec91": "Enclabs USDC",
  "0xc7efc499c2fed657251455443cd0767607e8e45e": "Enclabs wS",
  "0x396ebcaa1005a5bf1829cba82e853a5ea51ab937": "Enclabs scUSD",
  "0x8c0476605302b153792a3c2bd55ec4e70eb8482a":
    "Stability smsUSD Silo Leverage 141 USDC x6.5",
  "0xdde1d0db47ed76abbef5a9b7f1851f6015bc2f67": "Mainstreet Greenhouse",
  "0x2120a3159df9f3b6276f276e4cee8f47cf548c2f": "Mainstreet Greenhouse",
  "0x058779961ae874d29f9cecfd29df7456164a0f64": "Mainstreet",
  "0xbe73b6d42fd26bcd0ce3c02585d4a5fe9fea2fd4": "smsUSD, 138",
  "0xb1e87223f5b080f687b298df4fc8acabd3d1797b": "PT-smsUSD (30 Oct), 141",
  "0xff8bd2d55304bfb3a685374a5c20ecdb2a67cab3": "wmetaUSD",
  "0xde4b29e64e5e5ec5290df2888df5b4565836085f": "STBL",
};

const META_VAULTS_EXCEPTIONS = [
  "0x1111836d0ff66770f9d9a22fdb7e1f0349501111",
  "0xa881fa6e4d7a338abff52bc3232bf684c2ebc041",
  "0x1111111199558661bf7ff27b4f1623dc6b91aa3e",
];

const PATHS = [
  { name: "Lending", path: "lending" },
  { name: "Meta Vaults", path: "metavaults" },
  { name: "Leverage Vaults", path: "leverage-vaults" },
  { name: "All Vaults", path: "vaults" },
  { name: "Staking", path: "staking" },
  { name: "DAO", path: "dao" },
  // { name: "ALM", path: "alm" },
  // { name: "Dashboard", path: "dashboard" },
  // { name: "Agents", path: "agents" },
];

const ROUTES = {
  basic: [
    "staking",
    "dashboard",
    "leverage-vaults",
    "alm",
    "agents",
    "lending",
    "dao",
  ],
  platform: [
    "platform",
    "strategies",
    "chains",
    "integrations",
    "assets",
    "factory",
    "network",
    "swapper",
    "metavaults-management",
  ],
};

const LENDING_MARKETS = {
  "0x1111111199558661bf7ff27b4f1623dc6b91aa3e": [
    {
      logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Stability.svg`,
      symbol: "Stability wmetaUSD",
      link: "/lending/146/wmetaUSD-gen2",
      isBlank: false,
    },
    // {
    //   logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png`,
    //   symbol: "Silo wmetaUSD - USDC",
    //   link: "https://v2.silo.finance/markets/sonic/wmetausd-usdc-121?action=deposit",
    // },
    // {
    //   logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png`,
    //   symbol: "Silo wmetaUSD - scUSD",
    //   link: "https://v2.silo.finance/markets/sonic/wmetausd-scusd-125?action=deposit",
    // },
    // {
    //   logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/enclabs.svg`,
    //   symbol: "Enclabs wmetaUSD",
    //   link: "https://www.enclabs.finance/#/core-pool/market/0x1D801dC616C79c499C5d38c998Ef2D0D6Cf868e8?chainId=146",
    // },
    // {
    //   logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/euler.svg`,
    //   symbol: "Euler wmetaUSD",
    //   link: "https://app.euler.finance/vault/0x6F11663766bB213003cD74EB09ff4c67145023c5?network=sonic",
    // },
    // {
    //   logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/euler.svg`,
    //   symbol: "Euler wmetaUSD - USDC (looper)",
    //   link: "https://app.euler.finance/positions/0x6F11663766bB213003cD74EB09ff4c67145023c5/0x196F3C7443E940911EE2Bb88e019Fd71400349D9?network=sonic&tab=multiply",
    // },
  ],
  // "0x4444444420d9de54d69b3997b7d6a31d2bf63f32": [
  //   {
  //     logo: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png",
  //     symbol: "Silo wmetaS - S",
  //     link: "https://v2.silo.finance/markets/sonic/wmetas-s-128?action=deposit",
  //   },
  //   {
  //     logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/euler.svg`,
  //     symbol: "Euler wmetaS",
  //     link: "https://app.euler.finance/vault/0xC37fa1c70D77bdEd373C551a92bAbcee44a9d04E?network=sonic",
  //   },
  //   {
  //     logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/euler.svg`,
  //     symbol: "Euler wmetaS - wS (looper)",
  //     link: "https://app.euler.finance/positions/0xC37fa1c70D77bdEd373C551a92bAbcee44a9d04E/0x9144C0F0614dD0acE859C61CC37e5386d2Ada43A?network=sonic&tab=multiply",
  //   },
  // ],
};

const SPACE_ID = "stabilitydao.eth";

const SNAPSHOT_API = "https://hub.snapshot.org/graphql";

const SOCIALS = [
  {
    name: "Stability X",
    logo: "/socials/x.png",
    link: "https://x.com/stabilitydao",
  },
  {
    name: "Stability Discord",
    logo: "/socials/discord.png",
    link: "https://discord.com/invite/R3nnetWzC9",
  },
  {
    name: "Stability Github",
    logo: "/socials/github.png",
    link: "https://github.com/stabilitydao",
  },
  {
    name: "Stability Telegram",
    logo: "/socials/telegram.png",
    link: "https://t.me/stabilitydao",
  },
  {
    name: "Stability GitBook",
    logo: "/socials/gitbook.svg",
    link: "https://stabilitydao.gitbook.io/stability",
  },
];

const PRICES_ORDER = ["STBL", "BTC", "ETH", "AVAX", "S"];

export {
  APRsType,
  TABLE,
  TABLE_FILTERS,
  CHAINS_TABLE,
  PAGINATIONS_VARIANTS,
  PAGINATION_LIMIT,
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
  POOL_TABLE,
  BC_POOL_TABLE,
  DEFAULT_TABLE_PARAMS,
  SILO_POINTS,
  STABILITY_TOKENS,
  PATHS,
  VAULTS_WITH_NAME,
  STABILITY_STRATEGY_LABELS,
  STABILITY_AAVE_POOLS,
  METAVAULT_TABLE,
  PROTOCOLS_TABLE,
  LEVERAGE_FARMING_TABLE,
  FARMING_TABLE_FILTERS,
  SOCIALS,
  LENDING_MARKETS,
  VAULTS_META_TITLES,
  ROUTES,
  MARKET_TABLE,
  METAVAULTS_FILTERS,
  PRICES_ORDER,
  MARKET_USERS_TABLE,
  MARKET_LIQUIDATIONS_TABLE,
  META_VAULTS_EXCEPTIONS,
  HOLDERS_TABLE,
  MARKETS_TABLE_FILTERS,
  SPACE_ID,
  SNAPSHOT_API,
};
