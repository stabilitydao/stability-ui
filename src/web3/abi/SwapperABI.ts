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
    { inputs: [], name: "ETHTransferFailed", type: "error" },
    { inputs: [], name: "FailedInnerCall", type: "error" },
    { inputs: [], name: "IncorrectArrayLength", type: "error" },
    { inputs: [], name: "IncorrectInitParams", type: "error" },
    { inputs: [], name: "IncorrectMsgSender", type: "error" },
    { inputs: [], name: "IncorrectZeroArgument", type: "error" },
    { inputs: [], name: "InvalidInitialization", type: "error" },
    {
        inputs: [
            { internalType: "uint256", name: "minimumAmount", type: "uint256" },
        ],
        name: "LessThenThreshold",
        type: "error",
    },
    { inputs: [], name: "NoRouteFound", type: "error" },
    { inputs: [], name: "NoRoutesForAssets", type: "error" },
    { inputs: [], name: "NotExist", type: "error" },
    { inputs: [], name: "NotFactory", type: "error" },
    { inputs: [], name: "NotGovernance", type: "error" },
    { inputs: [], name: "NotGovernanceAndNotMultisig", type: "error" },
    { inputs: [], name: "NotInitializing", type: "error" },
    { inputs: [], name: "NotMultisig", type: "error" },
    { inputs: [], name: "NotOperator", type: "error" },
    { inputs: [], name: "NotPlatform", type: "error" },
    { inputs: [], name: "NotTheOwner", type: "error" },
    { inputs: [], name: "NotVault", type: "error" },
    {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "SafeERC20FailedOperation",
        type: "error",
    },
    { inputs: [], name: "UnknownAMMAdapter", type: "error" },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                indexed: false,
                internalType: "struct ISwapper.PoolData",
                name: "poolData",
                type: "tuple",
            },
        ],
        name: "BlueChipAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
        ],
        name: "BlueChipPoolRemoved",
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
            { indexed: false, internalType: "uint256", name: "ts", type: "uint256" },
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
        anonymous: false,
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                indexed: false,
                internalType: "struct ISwapper.PoolData",
                name: "poolData",
                type: "tuple",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "assetAdded",
                type: "bool",
            },
        ],
        name: "PoolAdded",
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
        name: "PoolRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "Swap",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "tokenIn",
                type: "address[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "thresholdAmount",
                type: "uint256[]",
            },
        ],
        name: "ThresholdChanged",
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
        name: "ROUTE_LENGTH_MAX",
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
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "string", name: "ammAdapterId", type: "string" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.AddPoolData[]",
                name: "pools_",
                type: "tuple[]",
            },
            { internalType: "bool", name: "rewrite", type: "bool" },
        ],
        name: "addBlueChipsPools",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData[]",
                name: "pools_",
                type: "tuple[]",
            },
            { internalType: "bool", name: "rewrite", type: "bool" },
        ],
        name: "addBlueChipsPools",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "string", name: "ammAdapterId", type: "string" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.AddPoolData[]",
                name: "pools_",
                type: "tuple[]",
            },
            { internalType: "bool", name: "rewrite", type: "bool" },
        ],
        name: "addPools",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData[]",
                name: "pools_",
                type: "tuple[]",
            },
            { internalType: "bool", name: "rewrite", type: "bool" },
        ],
        name: "addPools",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "allAssets",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
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
        name: "bcAssets",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
        ],
        name: "blueChipsPools",
        outputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData",
                name: "poolData",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
        ],
        name: "buildRoute",
        outputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData[]",
                name: "route",
                type: "tuple[]",
            },
            { internalType: "string", name: "errorMessage", type: "string" },
        ],
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
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "getPrice",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData[]",
                name: "route",
                type: "tuple[]",
            },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "getPriceForRoute",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "platform_", type: "address" }],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
        ],
        name: "isRouteExist",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
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
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
        ],
        name: "removeBlueChipPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "removePool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address[]", name: "tokenIn", type: "address[]" },
            { internalType: "uint256[]", name: "thresholdAmount", type: "uint256[]" },
        ],
        name: "setThresholds",
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
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            {
                internalType: "uint256",
                name: "priceImpactTolerance",
                type: "uint256",
            },
        ],
        name: "swap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "pool", type: "address" },
                    { internalType: "address", name: "ammAdapter", type: "address" },
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                ],
                internalType: "struct ISwapper.PoolData[]",
                name: "route",
                type: "tuple[]",
            },
            { internalType: "uint256", name: "amount", type: "uint256" },
            {
                internalType: "uint256",
                name: "priceImpactTolerance",
                type: "uint256",
            },
        ],
        name: "swapWithRoute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "threshold",
        outputs: [{ internalType: "uint256", name: "threshold_", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;
