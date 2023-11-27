export default [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "AlreadyLastVersion",
    type: "error",
  },
  {
    inputs: [],
    name: "NotActiveVault",
    type: "error",
  },
  {
    inputs: [],
    name: "NotStrategy",
    type: "error",
  },
  {
    inputs: [],
    name: "StrategyImplementationIsNotAvailable",
    type: "error",
  },
  {
    inputs: [],
    name: "StrategyLogicNotAllowedToDeploy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "SuchVaultAlreadyDeployed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "UpgradeDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "VaultImplementationIsNotAvailable",
    type: "error",
  },
  {
    inputs: [],
    name: "VaultNotAllowedToDeploy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "userBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requireBalance",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payToken",
        type: "address",
      },
    ],
    name: "YouDontHaveEnoughTokens",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        indexed: false,
        internalType: "struct IFactory.Farm[]",
        name: "farms",
        type: "tuple[]",
      },
    ],
    name: "NewFarm",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "deployAllowed",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "upgradeAllowed",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "newStrategy",
        type: "bool",
      },
    ],
    name: "StrategyLogicConfigChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oldImplementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "StrategyProxyUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        indexed: false,
        internalType: "struct IFactory.Farm",
        name: "farm",
        type: "tuple",
      },
    ],
    name: "UpdateFarm",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "vaultType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "strategyId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "strategy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "deploymentKey",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "vaultManagerTokenId",
        type: "uint256",
      },
    ],
    name: "VaultAndStrategy",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "type_",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "deployAllowed",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "upgradeAllowed",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "newVaultType",
        type: "bool",
      },
    ],
    name: "VaultConfigChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oldImplementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "VaultProxyUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newStatus",
        type: "uint256",
      },
    ],
    name: "VaultStatus",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        internalType: "struct IFactory.Farm[]",
        name: "farms_",
        type: "tuple[]",
      },
    ],
    name: "addFarms",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "vaultType",
        type: "string",
      },
      {
        internalType: "string",
        name: "strategyId",
        type: "string",
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
      {
        internalType: "int24[]",
        name: "strategyInitTicks",
        type: "int24[]",
      },
    ],
    name: "deployVaultAndStrategy",
    outputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "strategy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "deployedVault",
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
    inputs: [],
    name: "deployedVaults",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deployedVaultsLength",
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
        internalType: "bytes32",
        name: "deploymentKey_",
        type: "bytes32",
      },
    ],
    name: "deploymentKey",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "farm",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        internalType: "struct IFactory.Farm",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "farms",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        internalType: "struct IFactory.Farm[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "farmsLength",
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
        internalType: "string",
        name: "vaultType",
        type: "string",
      },
      {
        internalType: "string",
        name: "strategyId",
        type: "string",
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
      {
        internalType: "int24[]",
        name: "strategyInitTicks",
        type: "int24[]",
      },
    ],
    name: "getDeploymentKey",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
    ],
    name: "getExchangeAssetIndex",
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
        internalType: "string",
        name: "vaultType",
        type: "string",
      },
      {
        internalType: "address",
        name: "strategyAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "bbAsset",
        type: "address",
      },
    ],
    name: "getStrategyData",
    outputs: [
      {
        internalType: "string",
        name: "strategyId",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        internalType: "string[]",
        name: "assetsSymbols",
        type: "string[]",
      },
      {
        internalType: "string",
        name: "specificName",
        type: "string",
      },
      {
        internalType: "string",
        name: "vaultSymbol",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "address_",
        type: "address",
      },
    ],
    name: "isStrategy",
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
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "address",
            name: "implementation",
            type: "address",
          },
          {
            internalType: "bool",
            name: "deployAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "upgradeAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "farming",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct IFactory.StrategyLogicConfig",
        name: "config",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "developer",
        type: "address",
      },
    ],
    name: "setStrategyLogicConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "vaultType",
            type: "string",
          },
          {
            internalType: "address",
            name: "implementation",
            type: "address",
          },
          {
            internalType: "bool",
            name: "deployAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "upgradeAllowed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "buildingPrice",
            type: "uint256",
          },
        ],
        internalType: "struct IFactory.VaultConfig",
        name: "vaultConfig_",
        type: "tuple",
      },
    ],
    name: "setVaultConfig",
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
        internalType: "uint256",
        name: "status",
        type: "uint256",
      },
    ],
    name: "setVaultStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "strategies",
    outputs: [
      {
        internalType: "string[]",
        name: "id",
        type: "string[]",
      },
      {
        internalType: "bool[]",
        name: "deployAllowed",
        type: "bool[]",
      },
      {
        internalType: "bool[]",
        name: "upgradeAllowed",
        type: "bool[]",
      },
      {
        internalType: "bool[]",
        name: "farming",
        type: "bool[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenId",
        type: "uint256[]",
      },
      {
        internalType: "string[]",
        name: "tokenURI",
        type: "string[]",
      },
      {
        internalType: "bytes32[]",
        name: "extra",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "idHash",
        type: "bytes32",
      },
    ],
    name: "strategyLogicConfig",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "address",
            name: "implementation",
            type: "address",
          },
          {
            internalType: "bool",
            name: "deployAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "upgradeAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "farming",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct IFactory.StrategyLogicConfig",
        name: "config",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "strategyLogicIdHashes",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "pool",
            type: "address",
          },
          {
            internalType: "string",
            name: "strategyLogicId",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "rewardAssets",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "nums",
            type: "uint256[]",
          },
          {
            internalType: "int24[]",
            name: "ticks",
            type: "int24[]",
          },
        ],
        internalType: "struct IFactory.Farm",
        name: "farm_",
        type: "tuple",
      },
    ],
    name: "updateFarm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "strategy",
        type: "address",
      },
    ],
    name: "upgradeStrategyProxy",
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
    ],
    name: "upgradeVaultProxy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "typeHash",
        type: "bytes32",
      },
    ],
    name: "vaultConfig",
    outputs: [
      {
        internalType: "string",
        name: "vaultType",
        type: "string",
      },
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bool",
        name: "deployAllowed",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "upgradeAllowed",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "buildingPrice",
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
    ],
    name: "vaultStatus",
    outputs: [
      {
        internalType: "uint256",
        name: "status",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultTypes",
    outputs: [
      {
        internalType: "string[]",
        name: "vaultType",
        type: "string[]",
      },
      {
        internalType: "address[]",
        name: "implementation",
        type: "address[]",
      },
      {
        internalType: "bool[]",
        name: "deployAllowed",
        type: "bool[]",
      },
      {
        internalType: "bool[]",
        name: "upgradeAllowed",
        type: "bool[]",
      },
      {
        internalType: "uint256[]",
        name: "buildingPrice",
        type: "uint256[]",
      },
      {
        internalType: "bytes32[]",
        name: "extra",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "week",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "builderPermitTokenId",
        type: "uint256",
      },
    ],
    name: "vaultsBuiltByPermitTokenId",
    outputs: [
      {
        internalType: "uint256",
        name: "vaultsBuilt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "whatToBuild",
    outputs: [
      {
        internalType: "string[]",
        name: "desc",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "vaultType",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "strategyId",
        type: "string[]",
      },
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
      {
        internalType: "uint256[]",
        name: "vaultInitNums",
        type: "uint256[]",
      },
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
      {
        internalType: "int24[]",
        name: "strategyInitTicks",
        type: "int24[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
