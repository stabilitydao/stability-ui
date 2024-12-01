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
    name: "Awaiting deployment",
    length: TOTAL_CHAINS.AWAITING_DEPLOYMENT,
    bgColor: chainStatusInfo.AWAITING_DEPLOYMENT.color,
    active: false,
  },
  {
    name: "Development",
    length: TOTAL_CHAINS.CHAINLIB_DEVELOPMENT,
    bgColor: chainStatusInfo.CHAINLIB_DEVELOPMENT.color,

    active: false,
  },
  {
    name: "Awaiting developer",
    length: TOTAL_CHAINS.AWAITING_DEVELOPER,
    bgColor: chainStatusInfo.AWAITING_DEVELOPER.color,
    active: false,
  },
  {
    name: "Awaiting issue",
    length: TOTAL_CHAINS.AWAITING_ISSUE_CREATION,
    bgColor: chainStatusInfo.AWAITING_ISSUE_CREATION.color,
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
    name: "Awaiting deployment",
    length: TOTAL_STRATEGIES.DEPLOYMENT,
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
    name: "Awaiting developer",
    length: TOTAL_STRATEGIES.AWAITING,
    bgColor: "#E1E114",
    active: false,
  },
  {
    name: "Blocked",
    length: TOTAL_STRATEGIES.BLOCKED,
    bgColor: "#E01A1A",
    active: false,
  },
  {
    name: "Proposal",
    length: TOTAL_STRATEGIES.PROPOSAL,
    bgColor: "#FB8B13",
    active: false,
  },
];

const STATE_COLORS = {
  LIVE: "bg-green-800",
  DEPLOYMENT: "bg-violet-800",
  DEVELOPMENT: "bg-blue-700",
  AWAITING: "bg-orange-900",
  BLOCKED: "bg-red-900",
  PROPOSAL: "bg-yellow-800",
};

const CHAIN_STATUSES = {
  Supported: "SUPPORTED",
  "Awaiting deployment": "AWAITING_DEPLOYMENT",
  Development: "CHAINLIB_DEVELOPMENT",
  "Awaiting developer": "AWAITING_DEVELOPER",
  "Awaiting issue": "AWAITING_ISSUE_CREATION",
  "Not supported": "NOT_SUPPORTED",
};

const STRATEGY_STATUSES = {
  Live: "LIVE",
  "Awaiting deployment": "DEPLOYMENT",
  Development: "DEVELOPMENT",
  "Awaiting developer": "AWAITING",
  Blocked: "BLOCKED",
  Proposal: "PROPOSAL",
};

export {
  CHAINS_INFO,
  STRATEGIES_INFO,
  STATE_COLORS,
  CHAIN_STATUSES,
  STRATEGY_STATUSES,
};
