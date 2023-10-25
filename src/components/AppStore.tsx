import type React from "react";
import { useEffect } from "react";
import { useAccount, usePublicClient, useNetwork, useWalletClient } from "wagmi";
import { account, network, platformData, publicClient, userBalance } from "../state/StabilityStore";
import { readContract } from "viem/actions";
import { platform } from "../constants";
import PlatformAbi from "../abi/PlatformAbi";

export function AppStore(props: React.PropsWithChildren) {
    const { address } = useAccount()
    const _publicClient = usePublicClient()
    const { chain } = useNetwork()


    useEffect(() => {
        async function getData() {
            if (address && chain?.id) {
                // console.log('GetData')
                let r = await readContract(
                    _publicClient,
                    {
                        address: platform,
                        abi: PlatformAbi,
                        functionName: 'getData',
                    }
                )
                console.log('Platform.getData', r)
                if (r && Array.isArray(r)) {
                    const buildingPrices: {[vaultType: string]: bigint} = {}
                    for (let i = 0; i < r[1].length; i++) {
                        const vaultType: string = r[1][i]
                        const buildingPrice = r[3][i]
                        buildingPrices[vaultType] = buildingPrice
                    }
                    platformData.set({
                        platform,
                        factory: r[0][0],
                        buildingPermitToken: r[0][3],
                        buildingPayPerVaultToken: r[0][4],
                        buildingPrices,
                    })
                }

                r = await readContract(
                    _publicClient,
                    {
                        address: platform,
                        abi: PlatformAbi,
                        functionName: 'getBalance',
                        args: [address],
                    }
                )
                
                console.log('Platform.getBalance', r)
                if (r && Array.isArray(r)) {
                    const buildingPayPerVaultTokenBalance: bigint = r[8]
                    const erc20Balance: {[token: string]: bigint} = {}
                    const erc721Balance: {[token: string]: bigint} = {}

                    for (let i = 0; i < r[1].length; i++) {
                        erc20Balance[r[1][i]] = r[3][i]
                    }

                    for (let i = 0; i < r[6].length; i++) {
                        erc721Balance[r[6][i]] = r[7][i]
                    }

                    userBalance.set({
                        buildingPayPerVaultTokenBalance,
                        erc20Balance,
                        erc721Balance,
                    })

                }



            }

        }

        account.set(address)
        publicClient.set(_publicClient)
        network.set(chain?.name)
        getData()
    }, [address, chain?.id])

    return <>{props.children}</>
}
