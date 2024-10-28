import { getChainsTotals, getStrategiesTotals } from "@stabilitydao/stability";

const TOTAL_CHAINS = getChainsTotals();

const TOTAL_STRATEGIES = getStrategiesTotals();

const CHAINS_INFO = [
  {
    name: "Supported",
    length: TOTAL_CHAINS.SUPPORTED,
    color: "text-green-400",
    bgColor: "#4FAE2D",
    active: true,
  },
  {
    name: "Awaiting deployment",
    length: TOTAL_CHAINS.AWAITING_DEPLOYMENT,
    color: "text-violet-400",
    bgColor: "#FDA73A",
    active: true,
  },
  {
    name: "Development",
    length: TOTAL_CHAINS.CHAINLIB_DEVELOPMENT,
    color: "text-blue-400",
    bgColor: "#4FAE2D",
    active: true,
  },
  {
    name: "Awaiting developer",
    length: TOTAL_CHAINS.AWAITING_DEVELOPER,
    color: "text-yellow-200",
    bgColor: "#FDA73A",
    active: true,
  },
  {
    name: "Awaiting issue",
    length: TOTAL_CHAINS.AWAITING_ISSUE_CREATION,
    color: "text-orange-300",
    bgColor: "#FDA73A",
    active: true,
  },
  {
    name: "Not supported",
    length: TOTAL_CHAINS.NOT_SUPPORTED,
    color: "text-gray-400",
    bgColor: "#E01A1A",
    active: true,
  },
];

const STRATEGIES_INFO = [
  { name: "Live", state: TOTAL_STRATEGIES.LIVE, color: "text-green-400" },
  {
    name: "Awaiting deployment",
    state: TOTAL_STRATEGIES.DEPLOYMENT,
    color: "text-violet-400",
  },
  {
    name: "Development",
    state: TOTAL_STRATEGIES.DEVELOPMENT,
    color: "text-blue-400",
  },
  {
    name: "Awaiting developer",
    state: TOTAL_STRATEGIES.AWAITING,
    color: "text-yellow-200",
  },
  { name: "Blocked", state: TOTAL_STRATEGIES.BLOCKED, color: "text-red-200" },
  {
    name: "Proposal",
    state: TOTAL_STRATEGIES.PROPOSAL,
    color: "text-orange-300",
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

export { CHAINS_INFO, STRATEGIES_INFO, STATE_COLORS, CHAIN_STATUSES };
