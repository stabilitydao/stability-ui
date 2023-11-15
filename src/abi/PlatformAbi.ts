export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "dexAggRouter",
        type: "address",
      },
    ],
    name: "AggregatorNotExists",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyAnnounced",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxFee",
        type: "uint256",
      },
    ],
    name: "IncorrectFee",
    type: "error",
  },
  {
    inputs: [],
    name: "NoNewVersion",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughAllowedBBToken",
    type: "error",
  },
  {
    inputs: [],
    name: "SameVersion",
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
    name: "TokenAlreadyExistsInSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "TimerTimestamp",
        type: "uint256",
      },
    ],
    name: "UpgradeTimerIsNotOver",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "AddAllowedBoostRewardToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "allowedBoostRewardToken",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "defaultBoostRewardToken",
        type: "address[]",
      },
    ],
    name: "AddBoostTokens",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "AddDefaultBoostRewardToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "AddDexAggregator",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "multisig_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "factory_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "priceReader_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "swapper_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buildingPermitToken_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "vaultManager_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "strategyLogic_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "aprOracle_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "hardWorker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "zap",
        type: "address",
      },
    ],
    name: "Addresses",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "bbToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "vaultToUse",
        type: "uint256",
      },
    ],
    name: "AllowedBBTokenVaultUsed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "oldVersion",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newVersion",
        type: "string",
      },
    ],
    name: "CancelUpgrade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "EcosystemRevenueReceiver",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeShareVaultManager",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeShareStrategyLogic",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeShareEcosystem",
        type: "uint256",
      },
    ],
    name: "FeesChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "minInitialBoostPerDay",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minInitialBoostDuration",
        type: "uint256",
      },
    ],
    name: "MinInitialBoostChanged",
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
        name: "proxy",
        type: "address",
      },
    ],
    name: "NewAmmAdapter",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "OperatorAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "OperatorRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "version",
        type: "string",
      },
    ],
    name: "PlatformVersion",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "oldContractVersion",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newContractVersion",
        type: "string",
      },
    ],
    name: "ProxyUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "bbToken",
        type: "address",
      },
    ],
    name: "RemoveAllowedBBToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "RemoveAllowedBoostRewardToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "RemoveDefaultBoostRewardToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "RemoveDexAggregator",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "bbToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "vaultsToBuild",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "firstSet",
        type: "bool",
      },
    ],
    name: "SetAllowedBBTokenVaults",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "oldVersion",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newVersion",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "proxies",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "newImplementations",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timelock",
        type: "uint256",
      },
    ],
    name: "UpgradeAnnounce",
    type: "event",
  },
  {
    inputs: [],
    name: "PLATFORM_VERSION",
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
    name: "TIME_LOCK",
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
        name: "token",
        type: "address",
      },
    ],
    name: "addAllowedBoostRewardToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    name: "addAmmAdapter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "allowedBoostRewardToken",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "defaultBoostRewardToken",
        type: "address[]",
      },
    ],
    name: "addBoostTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "addDefaultBoostRewardToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "dexAggRouter",
        type: "address[]",
      },
    ],
    name: "addDexAggregators",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "addOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "allowedBBTokenVaults",
    outputs: [
      {
        internalType: "uint256",
        name: "vaultsLimit",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allowedBBTokenVaults",
    outputs: [
      {
        internalType: "address[]",
        name: "bbToken",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "vaultsLimit",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allowedBBTokenVaultsFiltered",
    outputs: [
      {
        internalType: "address[]",
        name: "bbToken",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "vaultsLimit",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allowedBBTokens",
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
    name: "allowedBoostRewardTokens",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "ammAdapterIdHash",
        type: "bytes32",
      },
    ],
    name: "ammAdapter",
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
            name: "proxy",
            type: "address",
          },
        ],
        internalType: "struct IPlatform.AmmAdapter",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newVersion",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "proxies",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "newImplementations",
        type: "address[]",
      },
    ],
    name: "announcePlatformUpgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "aprOracle",
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
    name: "buildingPayPerVaultToken",
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
    name: "buildingPermitToken",
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
    name: "cancelUpgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "defaultBoostRewardTokens",
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
    inputs: [
      {
        internalType: "address",
        name: "addressToRemove",
        type: "address",
      },
    ],
    name: "defaultBoostRewardTokensFiltered",
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
    name: "dexAggregators",
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
    name: "ecosystemRevenueReceiver",
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
    name: "factory",
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
    name: "getAmmAdapters",
    outputs: [
      {
        internalType: "string[]",
        name: "id",
        type: "string[]",
      },
      {
        internalType: "address[]",
        name: "proxy",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "yourAccount",
        type: "address",
      },
    ],
    name: "getBalance",
    outputs: [
      {
        internalType: "address[]",
        name: "token",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenPrice",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenUserBalance",
        type: "uint256[]",
      },
      {
        internalType: "address[]",
        name: "vault",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "vaultSharePrice",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "vaultUserBalance",
        type: "uint256[]",
      },
      {
        internalType: "address[]",
        name: "nft",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "nftUserBalance",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "buildingPayPerVaultTokenBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getData",
    outputs: [
      {
        internalType: "address[]",
        name: "platformAddresses",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "bcAssets",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "dexAggregators_",
        type: "address[]",
      },
      {
        internalType: "string[]",
        name: "vaultType",
        type: "string[]",
      },
      {
        internalType: "bytes32[]",
        name: "vaultExtra",
        type: "bytes32[]",
      },
      {
        internalType: "uint256[]",
        name: "vaultBulldingPrice",
        type: "uint256[]",
      },
      {
        internalType: "string[]",
        name: "strategyId",
        type: "string[]",
      },
      {
        internalType: "bool[]",
        name: "isFarmingStrategy",
        type: "bool[]",
      },
      {
        internalType: "string[]",
        name: "strategyTokenURI",
        type: "string[]",
      },
      {
        internalType: "bytes32[]",
        name: "strategyExtra",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFees",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeShareVaultManager",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeShareStrategyLogic",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeShareEcosystem",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlatformSettings",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "networkName",
            type: "string",
          },
          {
            internalType: "bytes32",
            name: "networkExtra",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "fee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeShareVaultManager",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeShareStrategyLogic",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeShareEcosystem",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minInitialBoostPerDay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minInitialBoostDuration",
            type: "uint256",
          },
        ],
        internalType: "struct IPlatform.PlatformSettings",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "governance",
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
    name: "hardWorker",
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
        internalType: "address",
        name: "dexAggRouter",
        type: "address",
      },
    ],
    name: "isAllowedDexAggregatorRouter",
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
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isOperator",
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
    name: "minInitialBoostDuration",
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
    name: "minInitialBoostPerDay",
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
    name: "multisig",
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
    name: "networkExtra",
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
    name: "networkName",
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
    name: "pendingPlatformUpgrade",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "newVersion",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "proxies",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "newImplementations",
            type: "address[]",
          },
        ],
        internalType: "struct IPlatform.PlatformUpgrade",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceReader",
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
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "removeAllowedBoostRewardToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "removeDefaultBoostRewardToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dexAggRouter",
        type: "address",
      },
    ],
    name: "removeDexAggregator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "removeOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bbToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "vaultsToBuild",
        type: "uint256",
      },
    ],
    name: "setAllowedBBTokenVaults",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "strategyLogic",
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
    name: "swapper",
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
    name: "targetExchangeAsset",
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
    name: "upgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bbToken",
        type: "address",
      },
    ],
    name: "useAllowedBBTokenVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultManager",
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
    name: "zap",
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
];
