export type PlatformData = {
    platform: `0x${string}`,
    factory: `0x${string}`,
    buildingPermitToken: `0x${string}`,
    buildingPayPerVaultToken: `0x${string}`,
    buildingPrices: {[vaultType: string]: bigint},
}

export type UserBalance = {
    buildingPayPerVaultTokenBalance: bigint,
    erc20Balance: {[token: string]: bigint},
    erc721Balance: {[token: string]: bigint},


}

export type InitParams = {
    initVaultAddresses: string[]
    initVaultNums: bigint[]
    initStrategyAddresses: string[]
    initStrategyNums: bigint[]
    initStrategyTicks: number[]
}

export type AllowedBBTokenVaults = {
    [token: string]: number
}

export type TokenData = {
    address: string
    name: string
    symbol: string
    chainId: number
    decimals: number
    logoURI: string
}
