export default [
  {
    type: "function",
    name: "USD_THRESHOLD",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addVault",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "newTargetProportions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "assets",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "assetsForDeposit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "assetsForWithdraw",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cachePrices",
    inputs: [
      {
        name: "clear",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "changeWhitelist",
    inputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
      {
        name: "addToWhitelist",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "currentProportions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositAssets",
    inputs: [
      {
        name: "assets_",
        type: "address[]",

        internalType: "address[]",
      },
      {
        name: "amountsMax",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minSharesOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emitAPR",
    inputs: [],
    outputs: [
      {
        name: "sharePrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "apr",
        type: "int256",
        internalType: "int256",
      },
      {
        name: "lastStoredSharePrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "duration",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "platform_",
        type: "address",
        internalType: "address",
      },
      {
        name: "type_",
        type: "string",
        internalType: "string",
      },
      {
        name: "pegAsset_",
        type: "address",
        internalType: "address",
      },
      {
        name: "name_",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol_",
        type: "string",
        internalType: "string",
      },
      {
        name: "vaults_",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "proportions_",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "internalSharePrice",
    inputs: [],
    outputs: [
      {
        name: "sharePrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "apr",
        type: "int256",
        internalType: "int256",
      },
      {
        name: "storedSharePrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "storedTime",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastBlockDefenseDisabled",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxDeposit",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "maxAmounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxWithdraw",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "mode",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxWithdraw",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "amount",

        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxWithdrawAmountTx",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxWithdrawUnderlying",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pegAsset",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewDepositAssets",
    inputs: [
      {
        name: "assets_",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "amountsMax",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "amountsConsumed",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "sharesOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "valueOut",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "price",
    inputs: [],
    outputs: [
      {
        name: "price_",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "trusted",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rebalance",
    inputs: [
      {
        name: "withdrawShares",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "depositAmountsProportions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "proportions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "cost",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recoveryToken",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeVault",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLastBlockDefenseDisabled",
    inputs: [
      {
        name: "isDisabled",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setLastBlockDefenseDisabledTx",
    inputs: [
      {
        name: "disableMode",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setName",
    inputs: [
      {
        name: "newName",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRecoveryToken",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
      {
        name: "recoveryToken_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setSymbol",
    inputs: [
      {
        name: "newSymbol",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTargetProportions",
    inputs: [
      {
        name: "newTargetProportions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetProportions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tvl",
    inputs: [],
    outputs: [
      {
        name: "tvl_",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "trusted",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultForDeposit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultForWithdraw",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaults",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "whitelisted",
    inputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawAssets",
    inputs: [
      {
        name: "assets_",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "amountShares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minAssetAmountsOut",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawAssets",
    inputs: [
      {
        name: "assets_",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "amountShares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minAssetAmountsOut",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawUnderlying",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minUnderlyingOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "underlyingOut",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawUnderlyingEmergency",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
      {
        name: "owners",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "amounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minUnderlyingOut",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "pausedRecoveryTokens",
        type: "bool[]",
        internalType: "bool[]",
      },
    ],
    outputs: [
      {
        name: "amountOut",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "recoveryAmountOut",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "APR",
    inputs: [
      {
        name: "sharePrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "apr",
        type: "int256",
        indexed: false,
        internalType: "int256",
      },
      {
        name: "lastStoredSharePrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "duration",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "tvl",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddVault",
    inputs: [
      {
        name: "vault",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DepositAssets",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "assets",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "amounts",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "mintAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LastBlockDefenseDisabled",
    inputs: [
      {
        name: "isDisabled",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MaxSupply",
    inputs: [
      {
        name: "maxShares",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Rebalance",
    inputs: [
      {
        name: "withdrawShares",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "depositAmountsProportions",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "cost",
        type: "int256",
        indexed: false,
        internalType: "int256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveVault",
    inputs: [
      {
        name: "vault",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TargetProportions",

    inputs: [
      {
        name: "proportions",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultName",
    inputs: [
      {
        name: "newName",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultSymbol",
    inputs: [
      {
        name: "newSymbol",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WhitelistChanged",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "whitelisted",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawAssets",
    inputs: [
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "assets",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "sharesAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountsOut",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ExceedMaxSupply",
    inputs: [
      {
        name: "maxSupply",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ExceedSlippage",
    inputs: [
      {
        name: "mintToUser",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minToMint",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "IncorrectProportions",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectRebalanceArgs",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectVault",
    inputs: [],
  },
  {
    type: "error",
    name: "MaxAmountForWithdrawPerTxReached",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "NotWhitelisted",
    inputs: [],
  },
  {
    type: "error",
    name: "RecoveryTokenNotSet",
    inputs: [
      {
        name: "cVault_",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",

    name: "TooHighAmount",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "UsdAmountLessThreshold",
    inputs: [
      {
        name: "amountUsd",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "threshold",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "VaultNotFound",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "WaitAFewBlocks",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroSharesToBurn",
    inputs: [
      {
        name: "amountToWithdraw",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
];
