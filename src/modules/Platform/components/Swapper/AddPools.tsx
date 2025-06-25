import { useMemo, useState } from "react";
import { HeadingText } from "@ui";
import type { TAddress } from "@types";
import type { Address, Hash, TransactionReceipt } from "viem";

import { useStore } from "@nanostores/react";
import { writeContract } from "@wagmi/core";
import { wagmiConfig, SwapperABI } from "@web3";
import { connected, account, publicClient } from "@store";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import WagmiLayout from "@layouts/WagmiLayout";
import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

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
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    ) : null;

/* ────────────────────────────────────────────────────────────────────────── */
/* Token‑selection modal with search                                        */
/* ────────────────────────────────────────────────────────────────────────── */

const tokenlist = tokenlistAll.tokens.filter((token) => token.chainId === 146);

type TokenSelectorModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (address: string, symbol: string) => void;
};

const TokenSelectorModal = ({
    open,
    onClose,
    onSelect,
}: TokenSelectorModalProps) => {
    const [query, setQuery] = useState("");

    const filteredTokens = useMemo(() => {
        if (!query) return tokenlist;
        const q = query.toLowerCase().trim();
        return tokenlist.filter(
            (t) =>
                t.symbol.toLowerCase().includes(q) ||
                (t.name ?? "").toLowerCase().includes(q) ||
                t.address.toLowerCase().includes(q)
        );
    }, [query]);

    return (
        <Modal open={open} onClose={onClose}>
            <h2 className="mb-4 text-xl font-semibold text-neutral-50">Select token</h2>
            <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symbol, name or address"
                className="mb-4 w-full rounded-2xl bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:bg-accent-800 focus:border-accent-500"
            />
            <div className="max-h-80 space-y-1 overflow-y-auto">
                {filteredTokens.map((tok) => (
                    <button
                        key={tok.address}
                        onClick={() => {
                            onSelect(tok.address, tok.symbol);
                            onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-accent-800"
                    >
                        <span className="flex items-center gap-3">
                            <img
                                src={tok.logoURI}
                                alt={tok.symbol}
                                className="h-6 w-6 rounded-full"
                            />
                            <span className="font-medium">{tok.symbol}</span>
                        </span>
                        <span className="truncate text-right text-xs text-neutral-400">
                            {shorten(tok.address)}
                        </span>
                    </button>
                ))}
                {!filteredTokens.length && (
                    <p className="text-center text-sm text-neutral-500">No results</p>
                )}
            </div>
        </Modal>
    );
};

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

/* ────────────────────────────────────────────────────────────────────────── */
/* Main component                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

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
    /* ───────── stores / wallet ───────── */
    const { open: openConnect } = useWeb3Modal();
    const $connected = useStore(connected);
    const $publicClient = useStore(publicClient);
    const $account = useStore(account);

    /* ───────── form state ───────── */
    const [poolAddress, setPoolAddress] = useState("");
    const [selectedAdapter, setSelectedAdapter] = useState("");
    const [selectedTokenIn, setSelectedTokenIn] = useState("");
    const [selectedTokenOut, setSelectedTokenOut] = useState("");
    const [tokenInSymbol, setTokenInSymbol] = useState("Select token");
    const [tokenOutSymbol, setTokenOutSymbol] = useState("Select token");
    const [manualTokenIn, setManualTokenIn] = useState("");
    const [manualTokenOut, setManualTokenOut] = useState("");
    const [rewrite, setRewrite] = useState(false);

    /* ───────── UI / modal state ───────── */
    const [tokenInModalOpen, setTokenInModalOpen] = useState(false);
    const [tokenOutModalOpen, setTokenOutModalOpen] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState<
        "idle" | "loading" | "success" | "fail"
    >("idle");
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<TxStatus>("idle");
    const [txHash, setTxHash] = useState<Hash | null>(null);
    const [txError, setTxError] = useState<string | null>(null);

    /* ───────── derived values ───────── */
    const finalTokenIn = selectedTokenIn || manualTokenIn;
    const finalTokenOut = selectedTokenOut || manualTokenOut;

    /* ───────── helpers ───────── */
    const resetTxState = () => {
        setSimulationStatus("idle");
        setTxStatus("idle");
        setTxHash(null);
        setTxError(null);
    };

    const handleAddPools = async () => {
        resetTxState();

        if (!poolAddress || !selectedAdapter || !finalTokenIn || !finalTokenOut) {
            setSimulationStatus("fail");
            return;
        }

        const contractAddress: Address = "0xe52Fcf607A8328106723804De1ef65Da512771Be";
        const functionName = "addPools";
        const args = [
            [
                {
                    pool: poolAddress as Address,
                    ammAdapter: selectedAdapter as Address,
                    tokenIn: finalTokenIn as Address,
                    tokenOut: finalTokenOut as Address,
                },
            ],
            rewrite,
        ] as const;

        try {
            /* ───────── simulate ───────── */
            setSimulationStatus("loading");
            await $publicClient.simulateContract({
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                account: $account as TAddress,
            });

            /* ───────── estimate gas ───────── */
            const est = await $publicClient.estimateContractGas({
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                account: $account as TAddress,
            });
            const gasWithBuffer = (est * 12n) / 10n; // +20 %
            setGasEstimate(est.toString());
            setSimulationStatus("success");

            /* ───────── wallet approval ───────── */
            setTxStatus("wallet");

            /* ───────── send tx ───────── */
            const hash = await writeContract(wagmiConfig, {
                address: contractAddress,
                abi: SwapperABI,
                functionName,
                args,
                gas: gasWithBuffer,
            });
            setTxHash(hash);
            setTxStatus("pending");

            /* ───────── wait for confirmation ───────── */
            const receipt: TransactionReceipt =
                await $publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === "success") {
                setTxStatus("success");
            } else {
                setTxStatus("error");
                setTxError("Transaction reverted");
            }
        } catch (err: unknown) {
            console.error(err);
            setSimulationStatus("fail");
            setTxStatus("error");
            setTxError(
                err instanceof Error ? err.message : "Unexpected error. Check console."
            );
        }
    };

    /* ────────────────────────────────────────────────────────────────────── */
    /* UI                                                                    */
    /* ────────────────────────────────────────────────────────────────────── */

    return (
        <WagmiLayout>
            {/* Token‑selection modals */}
            <TokenSelectorModal
                open={tokenInModalOpen}
                onClose={() => setTokenInModalOpen(false)}
                onSelect={(address, symbol) => {
                    setSelectedTokenIn(address);
                    setTokenInSymbol(symbol);
                    setManualTokenIn("");
                }}
            />
            <TokenSelectorModal
                open={tokenOutModalOpen}
                onClose={() => setTokenOutModalOpen(false)}
                onSelect={(address, symbol) => {
                    setSelectedTokenOut(address);
                    setTokenOutSymbol(symbol);
                    setManualTokenOut("");
                }}
            />
            {/* Tx‑status modal */}
            <TxStatusModal
                status={txStatus}
                hash={txHash}
                error={txError}
                onClose={resetTxState}
            />

            {/* Main card */}
            <div className="w-full max-w-[1200px] xl:min-w-[1200px]">
                <HeadingText text="Add Pools" scale={1} />

                <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-accent-950 p-6 text-white shadow-xl">
                    {/* Pool address */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm">Pool Address:</label>
                        <input
                            value={poolAddress}
                            onChange={(e) => setPoolAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        />
                    </div>

                    {/* AMM adapter */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm">AMM Adapter:</label>
                        <select
                            value={selectedAdapter}
                            onChange={(e) => setSelectedAdapter(e.target.value)}
                            className="w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        >
                            <option value="">Select an adapter</option>
                            {AMM_ADAPTERS.map((a) => (
                                <option key={a.address} value={a.address}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Token in */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm">Token In:</label>
                        <button
                            type="button"
                            onClick={() => setTokenInModalOpen(true)}
                            className="flex w-full items-center gap-3 rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-left text-neutral-50 transition-all hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        >
                            <img
                                src={tokenlist.find((t) => t.symbol === (tokenInSymbol === "Select token" ? "wS" : tokenInSymbol))?.logoURI}
                                alt={tokenInSymbol}
                                className="h-6 w-6 rounded-full"
                            />
                            {tokenInSymbol}
                        </button>
                        <input
                            value={manualTokenIn}
                            onChange={(e) => {
                                setManualTokenIn(e.target.value);
                                setSelectedTokenIn("");
                                setTokenInSymbol("Custom address");
                            }}
                            placeholder="Or enter token address"
                            className="mt-3 w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        />
                    </div>

                    {/* Token out */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm">Token Out:</label>
                        <button
                            type="button"
                            onClick={() => setTokenOutModalOpen(true)}
                            className="flex w-full items-center gap-3 rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-left text-neutral-50 transition-all hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        >
                            <img
                                src={tokenlist.find((t) => t.symbol === (tokenOutSymbol === "Select token" ? "STBL" : tokenOutSymbol))?.logoURI}
                                alt={tokenOutSymbol}
                                className="h-6 w-6 rounded-full"
                            />
                            {tokenOutSymbol}
                        </button>
                        <input
                            value={manualTokenOut}
                            onChange={(e) => {
                                setManualTokenOut(e.target.value);
                                setSelectedTokenOut("");
                                setTokenOutSymbol("Custom address");
                            }}
                            placeholder="Or enter token address"
                            className="mt-3 w-full rounded-2xl border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                        />
                    </div>

                    {/* Rewrite checkbox */}
                    <div className="mt-6 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={rewrite}
                            onChange={() => setRewrite((p) => !p)}
                        />
                        <label className="text-sm">Rewrite</label>
                    </div>

                    {/* Simulation feedback */}
                    <div className="mt-4 text-sm">
                        {simulationStatus === "loading" && <span>🔄 Simulating transaction…</span>}
                        {simulationStatus === "success" && (
                            <span className="text-green-400">
                                ✅ Simulation successful. Gas &approx; {gasEstimate}
                            </span>
                        )}
                        {simulationStatus === "fail" && (
                            <span className="text-red-400">
                                ❌ Simulation failed. Please check inputs.
                            </span>
                        )}
                    </div>

                    {/* Action button */}
                    {$connected ? (
                        <button
                            onClick={handleAddPools}
                            className="mt-6 w-full rounded-2xl bg-accent-500 py-3 text-[20px] font-semibold text-neutral-50 transition hover:text-neutral-50 disabled:opacity-40"
                            disabled={simulationStatus === "loading" || txStatus === "wallet"}
                        >
                            Add Pool
                        </button>
                    ) : (
                        <button
                            onClick={() => openConnect()}
                            className="mt-6 flex h-[50px] w-full items-center justify-center rounded-2xl bg-accent-500 py-3 text-[20px] font-semibold text-neutral-50"
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
