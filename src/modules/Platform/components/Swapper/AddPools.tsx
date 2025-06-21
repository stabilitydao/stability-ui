import { useState } from "react";
import { HeadingText } from "@ui";
import type { TAddress } from "@types";
import type { Address } from "viem";

import { useStore } from "@nanostores/react";
import { writeContract } from "@wagmi/core";
import { wagmiConfig, SwapperABI } from "@web3";
import { connected, account, publicClient } from "@store";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import WagmiLayout from "@layouts/WagmiLayout";
// TODO: Make a modal for selecting token and add search in the modal
// Make sure that the input selected for `tokenIn` and `tokenOut` is not the default `<option value="">Select a token</option>`
// But I think creating a special modal for selecting `tokenIn` and `tokenOut` should already prevent this
// Maybe show a modal when Txn is yet to be approved in wallet, when It is yet to be confirmed, when it has been confirmed and is successful
import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

const AMM_ADAPTERS = [
    { name: "Solidly (Equalizer, SwapX classic)", address: "0xE3374041F173FFCB0026A82C6EEf94409F713Cf9" },
    { name: "AlgebraV4 (SwapX CL)", address: "0xcb2dfcaec4F1a4c61c5D09100482109574E6b8C7" },
    { name: "UniswapV3 (Shadow)", address: "0xAf95468B1a624605bbFb862B0FB6e9C73Ad847b8" },
    { name: "ERC4626", address: "0xB7192f4b8f741E21b9022D2F8Fd19Ca8c94E7774" },
    { name: "BalancerV3Stable", address: "0xcd85425fF6C07cF09Ca6Ac8F683E8164F27C143c" },
    { name: "BalancerWeighted", address: "0x7D6641cf68E5169c11d91266D3E410130dE70B9E" },
    { name: "Pendle", address: "0x9fcE12c813fC2280A800e8683b918de121B2437B" },
];

const AddPools = (): JSX.Element => {
    const { open } = useWeb3Modal();
    const $connected = useStore(connected);
    const $publicClient = useStore(publicClient);
    const $account = useStore(account);

    const [poolAddress, setPoolAddress] = useState("");
    const [selectedAdapter, setSelectedAdapter] = useState("");
    const [selectedTokenIn, setSelectedTokenIn] = useState("");
    const [selectedTokenOut, setSelectedTokenOut] = useState("");
    const [manualTokenIn, setManualTokenIn] = useState("");
    const [manualTokenOut, setManualTokenOut] = useState("");
    const [rewrite, setRewrite] = useState(false);

    const [simulationStatus, setSimulationStatus] = useState<"idle" | "loading" | "success" | "fail">("idle");
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);

    const finalTokenIn = selectedTokenIn || manualTokenIn;
    const finalTokenOut = selectedTokenOut || manualTokenOut;

    const handleSubmit = async () => {
        if (!poolAddress || !selectedAdapter || !finalTokenIn || !finalTokenOut) {
            setSimulationStatus("fail");
            return;
        }

        try {
            setSimulationStatus("loading");

            const contractAddress = "0xe52Fcf607A8328106723804De1ef65Da512771Be";
            const functionName = "addPools";

            const args = [
                [
                    {
                        pool: poolAddress as Address,
                        ammAdapter: selectedAdapter as Address,
                        tokenIn: finalTokenIn as Address,
                        tokenOut: finalTokenOut as Address,
                    }
                ],
                rewrite
            ];

            // 1. Simulate the contract interaction
            await $publicClient.simulateContract({
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                account: $account as TAddress, // account.get() -> $account
            });

            // 2. Estimate gas based on simulation request
            const gasEstimate = await $publicClient.estimateContractGas({
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                account: $account as TAddress,
            });

            setGasEstimate(gasEstimate.toString());
            setSimulationStatus("success");

            // 3. Write transaction
            const gasLimit = BigInt(Number(gasEstimate) * 1.2); // add 20% buffer

            const txHash = await writeContract(wagmiConfig, {
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                gas: gasLimit,
            });

            console.log("Tx sent: ", txHash);
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            setSimulationStatus("fail");
        }
    };

    return (
        <WagmiLayout>
            <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
                <HeadingText text="Add Pools" scale={1} />

                <div className="w-full max-w-[420px] mx-auto p-6 rounded-2xl bg-accent-950 text-white shadow-xl">
                    {/* Pool Address */}
                    <div className="mt-6">
                        <label className="block text-sm mb-2">Pool Address:</label>
                        <input
                            className="min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            placeholder="0x..."
                            value={poolAddress}
                            onChange={(e) => setPoolAddress(e.target.value)}
                        />
                    </div>

                    {/* AMM Adapter */}
                    <div className="mt-6">
                        <label className="block text-sm mb-2">AMM Adapter:</label>
                        <select
                            className="min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            value={selectedAdapter}
                            onChange={(e) => setSelectedAdapter(e.target.value)}
                        >
                            <option value="">Select an adapter</option>
                            {AMM_ADAPTERS.map((adapter) => (
                                <option key={adapter.address} value={adapter.address}>
                                    {adapter.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Token In */}
                    <div className="mt-6">
                        <label className="block text-sm mb-2">Token In:</label>
                        <select
                            className="min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            value={selectedTokenIn}
                            onChange={(e) => {
                                setSelectedTokenIn(e.target.value);
                                setManualTokenIn("");
                            }}
                        >
                            <option value="">Select a token</option>
                            {tokenlist.tokens.map((token) => (
                                <option key={token.address} value={token.address}>
                                    {token.symbol}
                                </option>
                            ))}
                        </select>
                        <input
                            className="mt-3 min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            placeholder="Or enter TokenIn address"
                            value={manualTokenIn}
                            onChange={(e) => {
                                setManualTokenIn(e.target.value);
                                setSelectedTokenIn("");
                            }}
                        />
                    </div>

                    {/* Token Out */}
                    <div className="mt-6">
                        <label className="block text-sm mb-2">Token Out:</label>
                        <select
                            className="min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            value={selectedTokenOut}
                            onChange={(e) => {
                                setSelectedTokenOut(e.target.value);
                                setManualTokenOut("");
                            }}
                        >
                            <option value="">Select a token</option>
                            {tokenlist.tokens.map((token) => (
                                <option key={token.address} value={token.address}>
                                    {token.symbol}
                                </option>
                            ))}
                        </select>
                        <input
                            className="mt-3 min-w-full p-3 rounded-2xl bg-accent-900 hover:bg-accent-800 outline-none border-[2px] border-accent-800 hover:border-accent-500 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300"
                            placeholder="Or enter TokenOut address"
                            value={manualTokenOut}
                            onChange={(e) => {
                                setManualTokenOut(e.target.value);
                                setSelectedTokenOut("");
                            }}
                        />
                    </div>

                    {/* Rewrite Checkbox */}
                    <div className="mt-6 flex flex-row items-center gap-2">
                        <input
                            type="checkbox"
                            checked={rewrite}
                            onChange={() => setRewrite(!rewrite)}
                        />
                        <label className="text-sm">Rewrite</label>
                    </div>

                    {/* Simulation Feedback */}
                    <div className="mt-4 text-sm">
                        {simulationStatus === "loading" && <span>🔄 Simulating transaction...</span>}
                        {simulationStatus === "success" && (
                            <span className="text-green-400">✅ Simulation successful. Gas: {gasEstimate}</span>
                        )}
                        {simulationStatus === "fail" && (
                            <span className="text-red-400">❌ Simulation failed. Please check inputs.</span>
                        )}
                    </div>

                    {/* Add Pool */}
                    {$connected ? (
                        <button
                            type="button"
                            className="w-full bg-accent-500 transition text-neutral-500 hover:text-neutral-50 text-[20px] font-semibold py-3 rounded-2xl"
                            onClick={handleSubmit}
                        >
                            Add Pool
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="w-full flex items-center text-[20px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl h-[50px]"
                            onClick={() => open()}
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </WagmiLayout>
    );
};

export { AddPools };
