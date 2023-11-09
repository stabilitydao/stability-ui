export default [
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
    inputs: [],
    name: "VAULT_TYPE",
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
        internalType: "uint256[]",
        name: "amountsMax",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "minSharesOut",
        type: "uint256",
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
    inputs: [
      {
        internalType: "address",
        name: "platform_",
        type: "address",
      },
      {
        internalType: "address",
        name: "strategy_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
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
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "uint256",
        name: "price",
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
];