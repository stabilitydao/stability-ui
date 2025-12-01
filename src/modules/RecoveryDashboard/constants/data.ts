export const tokenData = [
  {
    name: "Recovery Stability USD",
    symbol: "RECmetaUSD",
    address: "0x000078392f3cF4262500FFeB7d803F90477ECC11" as `0x${string}`,
    initialSupply: 300836932902619695422070n,
    decimals: 18,
  },
  {
    name: "Recovery Wrapped Stability USD",
    symbol: "RECwmetaUSD",
    address: "0x00001b2c60cD041a478521008CE6efeC475bb9Aa" as `0x${string}`,
    initialSupply: 1571426158089874911823524n,
    decimals: 18,
  },
  {
    name: "Recovery Wrapped Stability USDC",
    symbol: "RECwmetaUSDC",
    address: "0x0000a59C549b4250a2931ac6054e1426a87DA0EE" as `0x${string}`,
    initialSupply: BigInt(101603724905),
    decimals: 6,
  },
  {
    name: "Recovery Wrapped Stability scUSD",
    symbol: "RECwmetascUSD",
    address: "0x0000c3b22bbD290588361E4B5C424F3AB0d0a3cc" as `0x${string}`,
    initialSupply: BigInt(1033496932628),
    decimals: 6,
  },
  {
    name: "Recovery Stability S",
    symbol: "RECmetaS",
    address: "0x000006539BA0B4f5452186Af40aAB959bDEa4344" as `0x${string}`,
    initialSupply: 1101293369505074707160718n,
    decimals: 18,
  },
  {
    name: "Recovery Wrapped Stability S",
    symbol: "RECwmetaS",
    address: "0x0000Dd8cEa00EA3336f5849590d69bbfc93A85bb" as `0x${string}`,
    initialSupply: 3166187266373775158998584n,
    decimals: 18,
  },
];

export const poolData = [
  {
    name: "Shadow RECmetaUSD/wmetaUSD",
    url: "https://www.shadow.so/liquidity/manage/0x1e2edba99efd08578460bd9a66f4f521ec861eb9",
    pair: "RECmetaUSD/wmetaUSD",
    address: "0x1e2edBa99efd08578460BD9A66f4f521EC861eb9" as `0x${string}`,
    price: 2345.67,
  },
  {
    name: "Shadow RECwmetaUSD/wmetaUSD",
    url: "https://www.shadow.so/liquidity/manage/0xd473a0f23f61f63f4e736b16f6133317f0ae4c0a",
    pair: "RECwmetaUSD/wmetaUSD",
    address: "0xd473A0F23f61F63F4e736b16f6133317F0ae4c0a" as `0x${string}`,
    price: 2345.67,
  },
  {
    name: "Shadow RECwmetaUSDC/wmetaUSD",
    url: "https://www.shadow.so/liquidity/manage/0x41fc91524e97678f81362f3703b16b07ace0ae23",
    pair: "RECwmetaUSDC/wmetaUSD",
    address: "0x41FC91524E97678F81362f3703B16b07Ace0ae23" as `0x${string}`,
    price: 2345.67,
  },
  {
    name: "Shadow RECwmetascUSD/wmetaUSD",
    url: "https://www.shadow.so/liquidity/manage/0x64c52e6c35c77150b58dc947672c4da606528f85",
    pair: "RECwmetascUSD/wmetaUSD",
    address: "0x64c52E6C35C77150B58DC947672c4dA606528F85" as `0x${string}`,
    price: 2345.67,
  },
  {
    name: "Shadow RECmetaS/wmetaS",
    url: "https://www.shadow.so/liquidity/manage/0xb7b6a318621eb0fda0893549ea4ee5da4cecf19e",
    pair: "RECmetaS/wmetaS",
    address: "0xB7B6A318621eb0FDA0893549Ea4eE5DA4CecF19E" as `0x${string}`,
    price: 2345.67,
  },
  {
    name: "Shadow RECwmetaS/wmetaS",
    url: "https://www.shadow.so/liquidity/manage/0xc68fac41bfc940fb5126ba1e790456ae273de9e7",
    pair: "RECwmetaS/wmetaS",
    address: "0xc68FaC41Bfc940FB5126Ba1E790456ae273de9E7" as `0x${string}`,
    price: 2345.67,
  },
];

export const dashboardData = [
  {
    title: "Total Tokens",
    value: tokenData.length,
    subtitle: "Recovery tokens",
    change: null,
    changeType: null,
  },
  {
    title: "Average Burn Rate",
    value: null,
    subtitle: null,
    change: null,
    changeType: null,
  },
  {
    title: "Total Pools",
    value: poolData.length,
    subtitle: "Recovery pools",
    change: null,
    changeType: null,
  },
  {
    title: "Total Value Locked",
    value: "$3.42M", // 3421290.8208
    subtitle: null,
    change: "-12.3% from last month",
    changeType: "negative",
  },
];
