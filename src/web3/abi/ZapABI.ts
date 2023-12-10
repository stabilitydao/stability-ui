export default [
  {
    inputs: [
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "AggSwapFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dexAggRouter",
        type: "address",
      },
    ],
    name: "NotAllowedDexAggregator",
    type: "error",
  },
  {
    inputs: [],
    name: "StrategyNotSupported",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "agg",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "swapData",
        type: "bytes[]",
      },
      {
        internalType: "uint256",
        name: "minSharesOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "getDepositSwapAmounts",
    outputs: [
      {
        internalType: "address[]",
        name: "tokensOut",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "swapAmounts",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        internalType: "address",
        name: "agg",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "swapData",
        type: "bytes[]",
      },
      {
        internalType: "uint256",
        name: "sharesToBurn",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "minAssetAmountsOut",
        type: "uint256[]",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
