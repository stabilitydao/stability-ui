export default [
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "AlreadyExist", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "approver", type: "address" }],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  { inputs: [], name: "ETHTransferFailed", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "maxSupply", type: "uint256" }],
    name: "ExceedMaxSupply",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "mintToUser", type: "uint256" },
      { internalType: "uint256", name: "minToMint", type: "uint256" },
    ],
    name: "ExceedSlippage",
    type: "error",
  },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "IncorrectArrayLength", type: "error" },
  { inputs: [], name: "IncorrectInitParams", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "ltv", type: "uint256" }],
    name: "IncorrectLtv",
    type: "error",
  },
  { inputs: [], name: "IncorrectMsgSender", type: "error" },
  { inputs: [], name: "IncorrectProportions", type: "error" },
  { inputs: [], name: "IncorrectRebalanceArgs", type: "error" },
  { inputs: [], name: "IncorrectVault", type: "error" },
  { inputs: [], name: "IncorrectZeroArgument", type: "error" },
  { inputs: [], name: "InsufficientBalance", type: "error" },
  { inputs: [], name: "InvalidInitialization", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    name: "MaxAmountForWithdrawPerTxReached",
    type: "error",
  },
  { inputs: [], name: "NotExist", type: "error" },
  { inputs: [], name: "NotFactory", type: "error" },
  { inputs: [], name: "NotGovernance", type: "error" },
  { inputs: [], name: "NotGovernanceAndNotMultisig", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  { inputs: [], name: "NotMultisig", type: "error" },
  { inputs: [], name: "NotOperator", type: "error" },
  { inputs: [], name: "NotPlatform", type: "error" },
  { inputs: [], name: "NotSupported", type: "error" },
  { inputs: [], name: "NotTheOwner", type: "error" },
  { inputs: [], name: "NotVault", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "TooLowValue",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountUsd", type: "uint256" },
      { internalType: "uint256", name: "threshold", type: "uint256" },
    ],
    name: "UsdAmountLessThreshold",
    type: "error",
  },
  { inputs: [], name: "WaitAFewBlocks", type: "error" },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountToWithdraw",
        type: "uint256",
      },
    ],
    name: "ZeroSharesToBurn",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "sharePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "apr",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lastStoredSharePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tvl",
        type: "uint256",
      },
    ],
    name: "APR",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "AddVault",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
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
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256",
      },
    ],
    name: "DepositAssets",
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "maxShares",
        type: "uint256",
      },
    ],
    name: "MaxSupply",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "withdrawShares",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "depositAmountsProportions",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "cost",
        type: "int256",
      },
    ],
    name: "Rebalance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "proportions",
        type: "uint256[]",
      },
    ],
    name: "TargetProportions",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "newName",
        type: "string",
      },
    ],
    name: "VaultName",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "newSymbol",
        type: "string",
      },
    ],
    name: "VaultSymbol",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sharesAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "amountsOut",
        type: "uint256[]",
      },
    ],
    name: "WithdrawAssets",
    type: "event",
  },
  {
    inputs: [],
    name: "CONTROLLABLE_VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USD_THRESHOLD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      {
        internalType: "uint256[]",
        name: "newTargetProportions",
        type: "uint256[]",
      },
    ],
    name: "addVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "assets",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "assetsForDeposit",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "assetsForWithdraw",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "createdBlock",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentProportions",
    outputs: [
      {
        internalType: "uint256[]",
        name: "proportions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "assets_", type: "address[]" },
      {
        internalType: "uint256[]",
        name: "amountsMax",
        type: "uint256[]",
      },
      { internalType: "uint256", name: "minSharesOut", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "depositAssets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emitAPR",
    outputs: [
      { internalType: "uint256", name: "sharePrice", type: "uint256" },
      { internalType: "int256", name: "apr", type: "int256" },
      {
        internalType: "uint256",
        name: "lastStoredSharePrice",
        type: "uint256",
      },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "platform_", type: "address" },
      { internalType: "string", name: "type_", type: "string" },
      { internalType: "address", name: "pegAsset_", type: "address" },
      { internalType: "string", name: "name_", type: "string" },
      { internalType: "string", name: "symbol_", type: "string" },
      { internalType: "address[]", name: "vaults_", type: "address[]" },
      {
        internalType: "uint256[]",
        name: "proportions_",
        type: "uint256[]",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "internalSharePrice",
    outputs: [
      { internalType: "uint256", name: "sharePrice", type: "uint256" },
      { internalType: "int256", name: "apr", type: "int256" },
      {
        internalType: "uint256",
        name: "storedSharePrice",
        type: "uint256",
      },
      { internalType: "uint256", name: "storedTime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxWithdrawAmountTx",
    outputs: [{ internalType: "uint256", name: "maxAmount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pegAsset",
    outputs: [{ internalType: "address", name: "", type: "address" }],
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
      { internalType: "address[]", name: "assets_", type: "address[]" },
      { internalType: "uint256[]", name: "amountsMax", type: "uint256[]" },
    ],
    name: "previewDepositAssets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amountsConsumed",
        type: "uint256[]",
      },
      { internalType: "uint256", name: "sharesOut", type: "uint256" },
      { internalType: "uint256", name: "valueOut", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      { internalType: "uint256", name: "price_", type: "uint256" },
      { internalType: "bool", name: "trusted_", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "withdrawShares",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "depositAmountsProportions",
        type: "uint256[]",
      },
    ],
    name: "rebalance",
    outputs: [
      {
        internalType: "uint256[]",
        name: "proportions",
        type: "uint256[]",
      },
      { internalType: "int256", name: "cost", type: "int256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newName", type: "string" }],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newSymbol", type: "string" }],
    name: "setSymbol",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "newTargetProportions",
        type: "uint256[]",
      },
    ],
    name: "setTargetProportions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "targetProportions",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "_tvl", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tvl",
    outputs: [
      { internalType: "uint256", name: "tvl_", type: "uint256" },
      { internalType: "bool", name: "trusted_", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultForDeposit",
    outputs: [{ internalType: "address", name: "target", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultForWithdraw",
    outputs: [{ internalType: "address", name: "target", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultType",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaults",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "assets_", type: "address[]" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      {
        internalType: "uint256[]",
        name: "minAssetAmountsOut",
        type: "uint256[]",
      },
    ],
    name: "withdrawAssets",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "assets_", type: "address[]" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      {
        internalType: "uint256[]",
        name: "minAssetAmountsOut",
        type: "uint256[]",
      },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdrawAssets",
    outputs: [
      { internalType: "uint256[]", name: "amountsOut", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
