export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyExist",
    type: "error",
  },
  {
    inputs: [],
    name: "ETHTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectArrayLength",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectInitParams",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectMsgSender",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectZeroArgument",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
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
    name: "NotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFactory",
    type: "error",
  },
  {
    inputs: [],
    name: "NotGovernance",
    type: "error",
  },
  {
    inputs: [],
    name: "NotGovernanceAndNotMultisig",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "NotMultisig",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOperator",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPlatform",
    type: "error",
  },
  {
    inputs: [],
    name: "NotTheOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "NotVault",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "RewardIsTooBig",
    type: "error",
  },
  {
    inputs: [],
    name: "RewardIsTooSmall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [],
    name: "StrategyNotSupported",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "platform",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ts",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "block",
        type: "uint256",
      },
    ],
    name: "ContractInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "CONTROLLABLE_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "createdBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
        name: "platform_",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "platform",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
