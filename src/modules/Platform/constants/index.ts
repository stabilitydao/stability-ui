import { chains, getChainsTotals } from "@stabilitydao/stability";

const TOTAL_CHAINS = getChainsTotals();

const CHAINS_INFO = [
  {
    name: "Total",
    length: Object.keys(chains).length,
    color: "text-gray-400",
  },

  {
    name: "Supported",
    length: TOTAL_CHAINS.SUPPORTED,
    color: "text-green-400",
  },
  {
    name: "Awaiting deployment",
    length: TOTAL_CHAINS.AWAITING_DEPLOYMENT,
    color: "text-violet-400",
  },
  {
    name: "Development",
    length: TOTAL_CHAINS.CHAINLIB_DEVELOPMENT,
    color: "text-blue-400",
  },
  {
    name: "Awaiting developer",
    length: TOTAL_CHAINS.AWAITING_DEVELOPER,
    color: "text-yellow-200",
  },
  {
    name: "Awaiting issue",
    length: TOTAL_CHAINS.AWAITING_ISSUE_CREATION,
    color: "text-orange-300",
  },
];

export { CHAINS_INFO };
