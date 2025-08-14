import { useEffect, useMemo, useState } from "react";
import { tokenlist as tokenlistAll } from "@stabilitydao/stability";
import type { Hash } from "viem";

export const shorten = (addr: string): string => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const Modal = ({ open, onClose, children }: ModalProps): JSX.Element | null =>
    open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm mt-28">
            <div className="relative w-full max-w-lg rounded-2xl bg-[#111114] border border-[#232429] p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-4xl leading-none text-white hover:scale-110 transition"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    ) : null;

export const tokenlist = tokenlistAll.tokens.filter((token) => token.chainId === 146);

export type Token = (typeof tokenlist)[number];

export type TokenSelectorModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
};

export const TokenSelectorModal = ({
    open,
    onClose,
    onSelect,
}: TokenSelectorModalProps): JSX.Element => {
    const [query, setQuery] = useState("");

    type AssetPriceEntry = {
        price: string;
        trusted: boolean;
    };
    type AssetPricesMap = Record<string, AssetPriceEntry>;

    const [assetPrices, setAssetPrices] = useState<AssetPricesMap | null>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch("https://api.stability.farm");
            const data = await response.json();
            const result = data.assetPrices?.[146] ?? null;
            setAssetPrices(result);
        })();
    }, []);

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
            <h2 className="mb-4 text-xl font-semibold text-white">Select token</h2>
            <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symbol, name or address"
                className="mb-4 w-full rounded-lg bg-[#1D1E23] border border-[#35363B] p-3 text-white outline-none placeholder:text-[#97979A] hover:bg-[#232429] focus:border-[#816FEA] transition-all"
            />
            <div className="max-h-80 space-y-1 overflow-y-auto">
                {filteredTokens.map((token) => (
                    <button
                        key={token.address}
                        onClick={() => {
                            onSelect(token);
                            onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left text-white hover:bg-[#18191c] border border-transparent hover:border-[#232429] transition"
                    >
                        <span className="flex items-center gap-2">
                            <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="h-6 w-6 rounded-full"
                            />
                            <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-[#97979A] truncate">
                                    {shorten(token.address)}
                                </div>
                            </div>
                        </span>
                        <div className="text-sm text-[#97979A]">
                            ${assetPrices?.[token.address.toLowerCase()]?.price}
                        </div>
                    </button>
                ))}
                {!filteredTokens.length && (
                    <p className="text-center text-sm text-[#97979A]">No results</p>
                )}
            </div>
        </Modal>
    );
};

export type TxStatus = "idle" | "wallet" | "pending" | "success" | "error";

export type TxStatusModalProps = {
    open: boolean;
    status: TxStatus;
    hash?: Hash | null;
    error?: string | null;
    onClose: () => void;
};

export const TxStatusModal = ({
    open,
    status,
    hash,
    error,
    onClose,
}: TxStatusModalProps): JSX.Element | null => {
    if (status === "idle") return null;

    const content: JSX.Element = (() => {
        switch (status) {
            case "wallet":
                return (
                    <div className="py-5">
                        Please confirm the transaction in your wallet…
                    </div>
                );
            case "pending":
                return (
                    <>
                        <p className="mb-2">Transaction sent. Waiting for confirmation…</p>
                        {hash && (
                            <a
                                href={`https://sonicscan.org/tx/${hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#97979A]"
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
                                className="text-[#97979A]"
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
        <Modal open={open} onClose={onClose}>
            <div className="space-y-2 text-neutral-50">{content}</div>
        </Modal>
    );
};
