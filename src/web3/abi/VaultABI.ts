export default [
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
    name: "doHardWork",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "doHardWorkOnDeposit",
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
    name: "extra",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApr",
    inputs: [],
    outputs: [
      {
        name: "totalApr",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "strategyApr",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "assetsWithApr",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "assetsAprs",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUniqueInitParamLength",
    inputs: [],
    outputs: [
      {
        name: "uniqueInitAddresses",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "uniqueInitNums",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hardWorkMintFeeCallback",
    inputs: [
      {
        name: "revenueAssets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "revenueAmounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "vaultInitializationData",
        type: "tuple",
        internalType: "struct IVault.VaultInitializationData",
        components: [
          {
            name: "platform",
            type: "address",
            internalType: "address",
          },
          {
            name: "strategy",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "tokenId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vaultInitAddresses",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "vaultInitNums",
            type: "uint256[]",
            internalType: "uint256[]",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "maxSupply",
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
    name: "previewDepositAssetsWrite",
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
    stateMutability: "nonpayable",
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
    name: "setDoHardWorkOnDeposit",
    inputs: [
      {
        name: "value",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setMaxSupply",
    inputs: [
      {
        name: "maxShares",
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
    name: "strategy",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IStrategy",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
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
    name: "tokenId",
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
    name: "DoHardWorkOnDepositChanged",
    inputs: [
      {
        name: "oldValue",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "newValue",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HardWorkGas",
    inputs: [
      {
        name: "gasUsed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "gasCost",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "compensated",
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
    name: "MintFees",
    inputs: [
      {
        name: "vaultManagerReceiverFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "strategyLogicReceiverFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "ecosystemRevenueReceiverFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "multisigReceiverFee",
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
    name: "ExceedSlippageExactAsset",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
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
    name: "FuseTrigger",
    inputs: [],
  },
  {
    type: "error",
    name: "NotEnoughAmountToInitSupply",
    inputs: [
      {
        name: "mintAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "initialShares",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotEnoughBalanceToPay",
    inputs: [],
  },
  {
    type: "error",
    name: "NotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "StrategyZeroDeposit",
    inputs: [],
  },
  {
    type: "error",
    name: "WaitAFewBlocks",
    inputs: [],
  },
  {
    inputs: [],
    name: "lastBlockDefenseDisabled",
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
  {
    type: "function",
    name: "setLastBlockDefenseDisabled",
    inputs: [{ name: "isDisabled", type: "bool", internalType: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
