export default [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
    ],
    name: "ExceedMaxSupply",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "mintToUser",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minToMint",
        type: "uint256",
      },
    ],
    name: "ExceedSlippage",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "mintToUser",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minToMint",
        type: "uint256",
      },
    ],
    name: "ExceedSlippageExactAsset",
    type: "error",
  },
  {
    inputs: [],
    name: "FuseTrigger",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "initialShares",
        type: "uint256",
      },
    ],
    name: "NotEnoughAmountToInitSupply",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughBalanceToPay",
    type: "error",
  },
  {
    inputs: [],
    name: "WaitAFewBlocks",
    type: "error",
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
        internalType: "bool",
        name: "oldValue",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "newValue",
        type: "bool",
      },
    ],
    name: "DoHardWorkOnDepositChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "gasUsed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "compensated",
        type: "bool",
      },
    ],
    name: "HardWorkGas",
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
    inputs: [
      {
        internalType: "address[]",
        name: "assets_",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "amountsMax",
        type: "uint256[]",
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
    name: "depositAssets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "doHardWork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "doHardWorkOnDeposit",
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
    inputs: [],
    name: "extra",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getApr",
    outputs: [
      {
        internalType: "uint256",
        name: "totalApr",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strategyApr",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "assetsWithApr",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "assetsAprs",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUniqueInitParamLength",
    outputs: [
      {
        internalType: "uint256",
        name: "uniqueInitAddresses",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "uniqueInitNums",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "platform",
            type: "address",
          },
          {
            internalType: "address",
            name: "strategy",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "vaultInitAddresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "vaultInitNums",
            type: "uint256[]",
          },
        ],
        internalType: "struct IVault.VaultInitializationData",
        name: "vaultInitializationData",
        type: "tuple",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
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
        internalType: "address[]",
        name: "assets_",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "amountsMax",
        type: "uint256[]",
      },
    ],
    name: "previewDepositAssets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amountsConsumed",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "sharesOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "valueOut",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sharesToBurn",
        type: "uint256",
      },
    ],
    name: "previewWithdraw",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amountsOut",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "uint256",
        name: "price_",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "trusted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "value",
        type: "bool",
      },
    ],
    name: "setDoHardWorkOnDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxShares",
        type: "uint256",
      },
    ],
    name: "setMaxSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "strategy",
    outputs: [
      {
        internalType: "contract IStrategy",
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
  {
    inputs: [],
    name: "tokenId",
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
    inputs: [],
    name: "tvl",
    outputs: [
      {
        internalType: "uint256",
        name: "tvl_",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "trusted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultType",
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
    inputs: [
      {
        internalType: "address[]",
        name: "assets_",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "amountShares",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "minAssetAmountsOut",
        type: "uint256[]",
      },
    ],
    name: "withdrawAssets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
