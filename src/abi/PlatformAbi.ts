export default [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "multisig_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "factory_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "priceReader_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "swapper_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "buildingPermitToken_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "vaultManager_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "strategyLogic_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "aprOracle_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "hardWorker",
        "type": "address"
      }
    ],
    "name": "Addresses",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeShareVaultManager",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeShareStrategyLogic",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeShareEcosystem",
        "type": "uint256"
      }
    ],
    "name": "FeesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minInitialBoostPerDay",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minInitialBoostDuration",
        "type": "uint256"
      }
    ],
    "name": "MinInitialBoostChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "proxy",
        "type": "address"
      }
    ],
    "name": "NewDexAdapter",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "OperatorAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "OperatorRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "proxy",
        "type": "address"
      }
    ],
    "name": "ProxyAnnounceRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "proxy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "ProxyUpgradeAnnounced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "proxy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "ProxyUpgraded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "PLATFORM_VERSION",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TIME_LOCK",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addAllowedBoostRewardToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addDefaultBoostRewardToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "proxy",
        "type": "address"
      }
    ],
    "name": "addDexAdapter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "addOperator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "allowedBBTokenVaults",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "vaultsLimit",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allowedBBTokenVaults",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "bbToken",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "vaultsLimit",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allowedBBTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allowedBoostRewardTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "proxies",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "implementations",
        "type": "address[]"
      }
    ],
    "name": "announceProxyUpgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "aprOracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buildingPayPerVaultToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buildingPermitToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultBoostRewardTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "dexAdapterIdHash",
        "type": "bytes32"
      }
    ],
    "name": "dexAdapter",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "proxy",
            "type": "address"
          }
        ],
        "internalType": "struct IPlatform.DexAdapter",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ecosystemRevenueReceiver",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "yourAccount",
        "type": "address"
      }
    ],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "token",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "tokenPrice",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "tokenUserBalance",
        "type": "uint256[]"
      },
      {
        "internalType": "address[]",
        "name": "vault",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "vaultSharePrice",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "vaultUserBalance",
        "type": "uint256[]"
      },
      {
        "internalType": "address[]",
        "name": "nft",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "nftUserBalance",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "buildingPayPerVaultTokenBalance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getData",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "platformAddresses",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "vaultType",
        "type": "string[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "vaultExtra",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256[]",
        "name": "vaultBulldingPrice",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "strategyId",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "isFarmingStrategy",
        "type": "bool[]"
      },
      {
        "internalType": "string[]",
        "name": "strategyTokenURI",
        "type": "string[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "strategyExtra",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDexAdapters",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "id",
        "type": "string[]"
      },
      {
        "internalType": "address[]",
        "name": "proxy",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeShareVaultManager",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeShareStrategyLogic",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeShareEcosystem",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformSettings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "networkName",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "networkExtra",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "fee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeShareVaultManager",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeShareStrategyLogic",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeShareEcosystem",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minInitialBoostPerDay",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minInitialBoostDuration",
            "type": "uint256"
          }
        ],
        "internalType": "struct IPlatform.PlatformSettings",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governance",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hardWorker",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isOperator",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minInitialBoostDuration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minInitialBoostPerDay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "multisig",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "networkExtra",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "networkName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "priceReader",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "removeAllowedBoostRewardToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "removeDefaultBoostRewardToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "removeOperator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "bbToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "vaultsToBuild",
        "type": "uint256"
      }
    ],
    "name": "setAllowedBBTokenVaults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "strategyLogic",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "swapper",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "targetExchangeAsset",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "proxies",
        "type": "address[]"
      }
    ],
    "name": "upgradeProxy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "bbToken",
        "type": "address"
      }
    ],
    "name": "useAllowedBBTokenVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vaultManager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
