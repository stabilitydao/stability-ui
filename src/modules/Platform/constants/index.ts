import {
  chainStatusInfo,
  getChainsTotals,
  getStrategiesTotals,
} from "@stabilitydao/stability";

const TOTAL_CHAINS = getChainsTotals();

const TOTAL_STRATEGIES = getStrategiesTotals();

const CHAINS_INFO = [
  {
    name: "Supported",
    length: TOTAL_CHAINS.SUPPORTED,
    bgColor: chainStatusInfo.SUPPORTED.color,
    active: false,
  },
  {
    name: "Development",
    length: TOTAL_CHAINS.DEVELOPMENT,
    bgColor: chainStatusInfo.DEVELOPMENT.color,
    active: false,
  },
  {
    name: "Not supported",
    length: TOTAL_CHAINS.NOT_SUPPORTED,
    bgColor: chainStatusInfo.NOT_SUPPORTED.color,
    active: false,
  },
];

const STRATEGIES_INFO = [
  {
    name: "Live",
    length: TOTAL_STRATEGIES.LIVE,
    bgColor: "#4FAE2D",
    active: false,
  },
  {
    name: "Ready",
    length: TOTAL_STRATEGIES.READY,
    bgColor: "#612FFB",
    active: false,
  },
  {
    name: "Development",
    length: TOTAL_STRATEGIES.DEVELOPMENT,
    bgColor: "#2D67FB",
    active: false,
  },
  {
    name: "Cancelled",
    length: TOTAL_STRATEGIES.CANCELLED,
    bgColor: "#E01A1A",
    active: false,
  },
];

const STATE_COLORS = {
  LIVE: "bg-green-800",
  DEVELOPMENT: "bg-blue-700",
  READY: "bg-orange-900",
  CANCELLED: "bg-red-900",
};

const CHAIN_STATUSES = {
  Supported: "SUPPORTED",
  Development: "DEVELOPMENT",
  "Not supported": "NOT_SUPPORTED",
};

const STRATEGY_STATUSES = {
  Live: "LIVE",
  Ready: "READY",
  Development: "DEVELOPMENT",
  Cancelled: "CANCELED",
};

export {
  CHAINS_INFO,
  STRATEGIES_INFO,
  STATE_COLORS,
  CHAIN_STATUSES,
  STRATEGY_STATUSES,
};
