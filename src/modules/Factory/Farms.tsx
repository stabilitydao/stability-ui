import { useEffect, useState } from "react";

import { HeadingText, FullPageLoader } from "@ui";
import type { Address, Hash, TransactionReceipt } from "viem";
import { getShortAddress } from "@utils";
import { useStore } from "@nanostores/react";
import { readContract, writeContract, waitForTransactionReceipt, simulateContract } from "@wagmi/core";
import { wagmiConfig, FactoryABI } from "@web3";
import { connected, account, publicClient } from "@store";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

type Farm = {
    status: bigint;
    pool: Address;
    strategyLogicId: string;
    rewardAssets: Address[];
    addresses: Address[];
    nums: bigint[];
    ticks: number[];
};

const FARMS_FACTORY_ADDRESS: Address = "0xc184a3ECcA684F2621c903A7943D85fA42F56671";

const defaultFarm: Farm = {
    status: 0n,
    pool: "0x0000000000000000000000000000000000000000",
    strategyLogicId: "",
    rewardAssets: [],
    addresses: [],
    nums: [],
    ticks: [],
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Helper UI components – no external UI libraries required                */
/* ────────────────────────────────────────────────────────────────────────── */

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};
/** Generic centre‑screen modal */
const Modal = ({ open, onClose, children }: ModalProps) =>
    open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl bg-accent-950 p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-4xl leading-none transition hover:scale-110"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    ) : null;

/* ────────────────────────────────────────────────────────────────────────── */
/* Transaction‑status modal                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

type TxStatus = "idle" | "wallet" | "pending" | "success" | "error";

type TxStatusModalProps = {
    status: TxStatus;
    hash?: Hash | null;
    error?: string | null;
    onClose: () => void;
};

const TxStatusModal = ({
    status,
    hash,
    error,
    onClose,
}: TxStatusModalProps) => {
    if (status === "idle") return null;

    const content = (() => {
        switch (status) {
            case "wallet":
                return "Please confirm the transaction in your wallet…";
            case "pending":
                return (
                    <>
                        <p className="mb-2">Transaction sent. Waiting for confirmation…</p>
                        {hash && (
                            <a
                                href={`https://sonicscan.org/tx/${hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent-400 underline"
                            >
                                View on explorer
                            </a>
                        )}
                    </>
                );
            case "success":
                return (
                    <>
                        <p className="mb-2 text-green-400">✅ Transaction confirmed!</p>
                        {hash && (
                            <a
                                href={`https://sonicscan.org/tx/${hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent-400 underline"
                            >
                                View on explorer
                            </a>
                        )}
                    </>
                );
            case "error":
                return (
                    <>
                        <p className="mb-2 text-red-400">❌ Transaction failed.</p>
                        {error && <pre className="max-w-full whitespace-pre-wrap break-all text-xs">{error}</pre>}
                    </>
                );
        }
    })();

    return (
        <Modal open onClose={onClose}>
            <div className="space-y-2 text-neutral-50">{content}</div>
        </Modal>
    );
};

const Farms = (): JSX.Element => {
    /* ───────── stores / wallet ───────── */
    const { open: openConnect } = useWeb3Modal();
    const $connected = useStore(connected);
    const $publicClient = useStore(publicClient);
    const $account = useStore(account);

    const [farms, setFarms] = useState<Farm[] | null>(null);
    const [loading, setLoading] = useState(true);

    const [editFarm, setEditFarm] = useState<Farm | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    /* ───────── UI / modal state ───────── */
    const [simulationStatus, setSimulationStatus] = useState<"idle" | "loading" | "success" | "fail">("idle");
    // const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<TxStatus>("idle");
    const [txHash, setTxHash] = useState<Hash | null>(null);
    const [txError, setTxError] = useState<string | null>(null);

    const resetTxState = () => {
        setSimulationStatus("idle");
        setTxStatus("idle");
        setTxHash(null);
        setTxError(null);
        setShowModal(false); // Close edit modal before showing TxStatus
        setShowModal(false); // Close modal when tx modal closes
    };

    const tokenlist = tokenlistAll.tokens.filter((token) => token.chainId === 146);

    function findTokenByAddress(address: string) {
        return tokenlist.find((token) => token.address.toLowerCase() === address.toLowerCase());
    }

    const fetchFarms = async () => {
        try {
            const result = await readContract(wagmiConfig, {
                address: FARMS_FACTORY_ADDRESS,
                abi: FactoryABI,
                functionName: "farms",
            });

            setFarms(result as Farm[]);
        } catch (err) {
            console.error("Failed to fetch farms:", err);
            setFarms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarms();
    }, []);

    const openEditModal = (farm: Farm, index: number) => {
        setEditFarm(farm);
        setEditIndex(index);
        setShowModal(true);
        setIsAdding(false);
    };

    const openAddModal = () => {
        setEditFarm(defaultFarm);
        setEditIndex(null);
        setShowModal(true);
        setIsAdding(true);
    };

    const handleInputChange = (field: keyof Farm, value: any) => {
        if (!editFarm) return;
        setEditFarm({ ...editFarm, [field]: value });
    };

    const handleSubmit = async () => {
        resetTxState();

        if (!editFarm || (!isAdding && (editIndex === null || editIndex === undefined))) {
            setSimulationStatus("fail");
            return;
        }

        setTxStatus("pending");

        try {
            /* ───────── simulate ───────── */
            setSimulationStatus("loading");
            await simulateContract(wagmiConfig, {
                address: FARMS_FACTORY_ADDRESS,
                abi: FactoryABI,
                functionName: isAdding ? "addFarms" : "updateFarm",
                args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
            });

            /* ───────── estimate gas ───────── */
            const est = await $publicClient.estimateContractGas({
                address: FARMS_FACTORY_ADDRESS,
                abi: FactoryABI,
                functionName: isAdding ? "addFarms" : "updateFarm",
                args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
                account: $account as Address,
            });

            const gasWithBuffer = (est * 11n) / 10n; // +10 %
            // setGasEstimate(est.toString());
            setSimulationStatus("success");

            /* ───────── wallet approval ───────── */
            setTxStatus("wallet");

            /* ───────── send tx ───────── */
            const hash = await writeContract(wagmiConfig, {
                address: FARMS_FACTORY_ADDRESS,
                abi: FactoryABI,
                functionName: isAdding ? "addFarms" : "updateFarm",
                args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
                gas: gasWithBuffer,
            });
            setTxHash(hash);
            setTxStatus("pending");

            /* ───────── wait for confirmation ───────── */
            const receipt: TransactionReceipt = await waitForTransactionReceipt(wagmiConfig, { hash: hash });
            if (receipt.status === "success") {
                setTxStatus("success");
                await fetchFarms();
            } else {
                setTxStatus("error");
                setTxError("Transaction reverted");
            }
        } catch (err) {
            console.error("Transaction error", err);
            setTxStatus("error");
            setTxError(err instanceof Error ? err.message : "Unexpected error. Check console.");
            setSimulationStatus("fail");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setTxStatus("idle");
        setTxHash(null);
        setEditFarm(null);
        setEditIndex(null);
    };

    if (loading || farms === null) return <FullPageLoader />;

    return (
        <>
            <TxStatusModal
                status={txStatus}
                hash={txHash}
                error={txError}
                onClose={resetTxState}
            />
            <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
                <HeadingText text="Farms" scale={1} />

                <div className="flex justify-start">
                    <button
                        onClick={openAddModal}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Farm
                    </button>
                </div>

                <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
                    <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
                        <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                            <tr className="text-[12px] font-bold uppercase text-center">
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Pool</th>
                                <th className="px-4 py-3">Strategy Logic ID</th>
                                <th className="px-4 py-3">Reward Assets</th>
                                <th className="px-4 py-3">Addresses</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-center">
                            {farms.map((farm, i) => (
                                <tr key={i} className="h-[48px] hover:bg-accent-950">
                                    <td className="px-4 py-3">{farm.status.toString()}</td>
                                    <td className="px-4 py-3">{getShortAddress(farm.pool, 6, 6)}</td>
                                    <td className="px-4 py-3">{farm.strategyLogicId}</td>
                                    <td className="px-4 py-3">
                                        {farm.rewardAssets.map((a, i) => {
                                            const token = findTokenByAddress(a);
                                            return token ? (
                                                <div key={i} className="flex justify-center items-center gap-2">
                                                    <img
                                                        src={token.logoURI}
                                                        alt={token.symbol}
                                                        className="w-5 h-5 rounded-full"
                                                    />
                                                    <span>{token.symbol}</span>
                                                </div>
                                            ) : (
                                                <div key={i}>{getShortAddress(a, 6, 6)}</div>
                                            );
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        {farm.addresses.map((a, i) => (
                                            <div key={i}>{getShortAddress(a, 6, 6)}</div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => { $connected ? openEditModal(farm, i) : openConnect() }}
                                            className="text-blue-500 hover:underline"
                                            disabled={simulationStatus === "loading" || txStatus === "wallet"}
                                            title="Do you want to edit this farm?"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && editFarm && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-accent-900 p-6 rounded-xl max-w-[600px] w-full">
                            <h2 className="text-xl font-semibold mb-4">{isAdding ? "Add Farm" : "Edit Farm"}</h2>

                            {/* Form Inputs */}
                            <div className="grid gap-3 mb-4">
                                <input
                                    placeholder="Status"
                                    value={editFarm.status.toString()}
                                    onChange={(e) => handleInputChange("status", BigInt(e.target.value))}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Pool Address"
                                    value={editFarm.pool}
                                    onChange={(e) => handleInputChange("pool", e.target.value as Address)}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Strategy Logic ID"
                                    value={editFarm.strategyLogicId}
                                    onChange={(e) => handleInputChange("strategyLogicId", e.target.value)}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Reward Assets (comma-separated)"
                                    value={editFarm.rewardAssets.join(",")}
                                    onChange={(e) => handleInputChange("rewardAssets", e.target.value.split(",").map((s) => s.trim()) as Address[])}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Addresses (comma-separated)"
                                    value={editFarm.addresses.join(",")}
                                    onChange={(e) => handleInputChange("addresses", e.target.value.split(",") as Address[])}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Nums (comma-separated)"
                                    value={editFarm.nums.join(",")}
                                    onChange={(e) => handleInputChange("nums", e.target.value.split(",").map((n) => BigInt(n)))}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                                <input
                                    placeholder="Ticks (comma-separated)"
                                    value={editFarm.ticks.join(",")}
                                    onChange={(e) => handleInputChange("ticks", e.target.value.split(",").map(Number))}
                                    className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                                />
                            </div>

                            {txStatus === "pending" && <p className="text-yellow-500">Transaction pending...</p>}
                            {txStatus === "success" && (
                                <p className="text-green-500">
                                    Success! TX Hash:{" "}
                                    <a
                                        href={`https://sonicscan.org/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        {txHash?.slice(0, 10)}...
                                    </a>
                                </p>
                            )}
                            {txStatus === "error" && (
                                <p className="text-red-500">Transaction failed. Check console for details.</p>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={simulationStatus === "loading" || txStatus === "wallet" || txStatus === "pending"}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
};

export { Farms };
