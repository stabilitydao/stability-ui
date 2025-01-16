export default [
  {
    inputs: [{ internalType: "address", name: "platform_", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "IncorrectParams", type: "error" },
  {
    inputs: [],
    name: "VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAccount", type: "address" },
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "pageSize", type: "uint256" },
    ],
    name: "getBalanceAssets",
    outputs: [
      { internalType: "uint256", name: "total", type: "uint256" },
      { internalType: "address[]", name: "asset", type: "address[]" },
      { internalType: "uint256[]", name: "assetPrice", type: "uint256[]" },
      {
        internalType: "uint256[]",
        name: "assetUserBalance",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAccount", type: "address" },
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "pageSize", type: "uint256" },
    ],
    name: "getBalanceVaults",
    outputs: [
      { internalType: "uint256", name: "total", type: "uint256" },
      { internalType: "address[]", name: "vault", type: "address[]" },
      { internalType: "uint256[]", name: "vaultSharePrice", type: "uint256[]" },
      {
        internalType: "uint256[]",
        name: "vaultUserBalance",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platform",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "pageSize", type: "uint256" },
    ],
    name: "vaults",
    outputs: [
      { internalType: "uint256", name: "total", type: "uint256" },
      { internalType: "address[]", name: "vaultAddress", type: "address[]" },
      { internalType: "string[]", name: "name", type: "string[]" },
      { internalType: "string[]", name: "symbol", type: "string[]" },
      { internalType: "string[]", name: "vaultType", type: "string[]" },
      { internalType: "uint256[]", name: "sharePrice", type: "uint256[]" },
      { internalType: "uint256[]", name: "tvl", type: "uint256[]" },
      { internalType: "address[]", name: "strategy", type: "address[]" },
      { internalType: "string[]", name: "strategyId", type: "string[]" },
      { internalType: "string[]", name: "strategySpecific", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "startStrategy", type: "uint256" },
      { internalType: "uint256", name: "step", type: "uint256" },
    ],
    name: "whatToBuild",
    outputs: [
      { internalType: "uint256", name: "totalStrategies", type: "uint256" },
      { internalType: "string[]", name: "desc", type: "string[]" },
      { internalType: "string[]", name: "vaultType", type: "string[]" },
      { internalType: "string[]", name: "strategyId", type: "string[]" },
      {
        internalType: "uint256[10][]",
        name: "initIndexes",
        type: "uint256[10][]",
      },
      {
        internalType: "address[]",
        name: "vaultInitAddresses",
        type: "address[]",
      },
      { internalType: "uint256[]", name: "vaultInitNums", type: "uint256[]" },
      {
        internalType: "address[]",
        name: "strategyInitAddresses",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "strategyInitNums",
        type: "uint256[]",
      },
      { internalType: "int24[]", name: "strategyInitTicks", type: "int24[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;