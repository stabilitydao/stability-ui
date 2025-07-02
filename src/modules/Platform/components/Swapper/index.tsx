import { useState, useEffect } from "react";

import axios from "axios";

import { TableColumnSort, HeadingText, FullPageLoader } from "@ui";

import { sortTable, getShortAddress } from "@utils";

import { BC_POOL_TABLE, POOL_TABLE } from "@constants";

import { GRAPH_ENDPOINTS } from "src/constants/env";

import type { TAddress, TTableColumn, TPoolTable } from "@types";

import type { Address, Hash, TransactionReceipt } from "viem";
import { useStore } from "@nanostores/react";
import { writeContract } from "@wagmi/core";
import { wagmiConfig, SwapperABI } from "@web3";
import { connected, account, publicClient } from "@store";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

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

const Swapper = (): JSX.Element => {
  const [poolTableStates, setPoolTableStates] = useState(POOL_TABLE);
  const [BCPoolTableStates, setBCPoolTableStates] = useState(BC_POOL_TABLE);

  const [poolTableData, setPoolTableData] = useState<TPoolTable[]>([]);
  const [BCPoolTableData, setBCPoolTableData] = useState<TPoolTable[]>([]);

  const initTablesData = async () => {
    try {
      const GRAPH_URL = GRAPH_ENDPOINTS[146];

      const GRAPH_QUERY = `{
              bcpoolEntities {
                  pool
                  id
                  ammAdapter
                  tokenIn
                  tokenOut
              }
              poolEntities {
                  ammAdapter
                  assetAdded
                  id
                  tokenIn
                  tokenOut
              }}`;

      const graphResponse = await axios.post(GRAPH_URL, {
        query: GRAPH_QUERY,
      });

      const data = graphResponse.data.data;

      setPoolTableData(data.poolEntities);
      setBCPoolTableData(data.bcpoolEntities);
    } catch (error) {
      console.error(error);
    }
  };

  const AMM_ADAPTERS = [
    { name: "Solidly (Equalizer, SwapX classic)", address: "0xE3374041F173FFCB0026A82C6EEf94409F713Cf9" },
    { name: "AlgebraV4 (SwapX CL)", address: "0xcb2dfcaec4F1a4c61c5D09100482109574E6b8C7" },
    { name: "UniswapV3 (Shadow)", address: "0xAf95468B1a624605bbFb862B0FB6e9C73Ad847b8" },
    { name: "ERC4626", address: "0xB7192f4b8f741E21b9022D2F8Fd19Ca8c94E7774" },
    { name: "BalancerV3Stable", address: "0xcd85425fF6C07cF09Ca6Ac8F683E8164F27C143c" },
    { name: "BalancerWeighted", address: "0x7D6641cf68E5169c11d91266D3E410130dE70B9E" },
    { name: "Pendle", address: "0x9fcE12c813fC2280A800e8683b918de121B2437B" },
  ];

  function getNameByAddress(address: string): string | undefined {
    return AMM_ADAPTERS.find(a => a.address.toLowerCase() === address.toLowerCase())?.name;
  }

  const tokenlist = tokenlistAll.tokens.filter((token) => token.chainId === 146);

  function findTokenByAddress(address: string) {
    return tokenlist.find(token => token.address.toLowerCase() === address.toLowerCase());
  }

  /* ───────── stores / wallet ───────── */
  const { open: openConnect } = useWeb3Modal();
  const $connected = useStore(connected);
  const $publicClient = useStore(publicClient);
  const $account = useStore(account);

  /* ───────── UI / modal state ───────── */
  const [simulationStatus, setSimulationStatus] = useState<
    "idle" | "loading" | "success" | "fail"
  >("idle");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const resetTxState = () => {
    setSimulationStatus("idle");
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
  };

  const handleRemovePool = async (tokenIn: Address) => {
    resetTxState();

    if (!tokenIn) {
      setSimulationStatus("fail");
      return;
    }

    const contractAddress: Address = "0xe52Fcf607A8328106723804De1ef65Da512771Be";
    const functionName = "removePool";
    const args = [tokenIn] as const;

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

  useEffect(() => {
    initTablesData();
  }, []);

  return (
    <>
      <TxStatusModal
        status={txStatus}
        hash={txHash}
        error={txError}
        onClose={resetTxState}
      />

      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <HeadingText text="Swapper" scale={1} />

        {BCPoolTableData.length && poolTableData.length ? (
          <>
            <HeadingText text="Pools" scale={2} />
            <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
              <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
                <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                  <tr className="text-[12px] font-bold uppercase">
                    {poolTableStates.map((value: TTableColumn, index: number) => (
                      <TableColumnSort
                        key={value.name + index}
                        index={index}
                        value={value.name}
                        sort={sortTable}
                        table={poolTableStates}
                        setTable={setPoolTableStates}
                        tableData={poolTableData}
                        setTableData={setPoolTableData}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {poolTableData.map(({ id, ammAdapter, tokenIn, tokenOut }) => {
                    const ammAdapterName = getNameByAddress(ammAdapter);
                    const tokenInData = findTokenByAddress(tokenIn);
                    const tokenOutData = findTokenByAddress(tokenOut);

                    return (
                      <tr
                        //onClick={() => toPool(name)}
                        className="h-[48px] hover:bg-accent-950" //cursor-pointer
                        key={id}
                      >
                        <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                          {getShortAddress(id, 6, 6)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ammAdapterName && <div>{getNameByAddress(ammAdapter)}</div>}
                          <div>{getShortAddress(ammAdapter, 6, 6)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tokenInData ? (
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src={tokenInData.logoURI}
                                alt={tokenInData.symbol}
                                className="w-6 h-6 rounded-full"
                              />
                              <span>{tokenInData.symbol}</span>
                            </div>
                          ) : (
                            getShortAddress(tokenIn, 6, 6)
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tokenOutData ? (
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src={tokenOutData.logoURI}
                                alt={tokenOutData.symbol}
                                className="w-6 h-6 rounded-full"
                              />
                              <span>{tokenOutData.symbol}</span>
                            </div>
                          ) : (
                            getShortAddress(tokenOut, 6, 6)
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => { $connected ? handleRemovePool(tokenIn) : openConnect() }}
                            className="w-full rounded-2xl bg-accent-500 py-1 px-3 xl:px-0 font-semibold text-neutral-50"
                            disabled={simulationStatus === "loading" || txStatus === "wallet"}
                            title="Do you want to remove this pool?"
                          >
                            remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <a
              className="bg-accent-500 hover:bg-accent-600 my-6 px-3 py-3 rounded-xl flex items-center w-max font-bold text-sm"
              href="/swapper/add-pools"
              title="Go to add pools page"
              key="/swapper/add-pools"
            >
              Add Pools
            </a>

            <HeadingText text="Blue Chip Pools" scale={2} />
            <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
              <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
                <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                  <tr className="text-[12px] font-bold uppercase">
                    {BCPoolTableStates.map(
                      (value: TTableColumn, index: number) => (
                        <TableColumnSort
                          key={value.name + index * 10}
                          index={index}
                          value={value.name}
                          sort={sortTable}
                          table={BCPoolTableStates}
                          setTable={setBCPoolTableStates}
                          tableData={BCPoolTableData}
                          setTableData={setBCPoolTableData}
                        />
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {BCPoolTableData.map(
                    ({ id, ammAdapter, pool, tokenIn, tokenOut }) => (
                      <tr
                        //   onClick={() => toPool(name)}
                        className="h-[48px] hover:bg-accent-950 cursor-pointer"
                        key={id}
                      >
                        <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                          {getShortAddress(id, 6, 6)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getShortAddress(ammAdapter, 6, 6)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getShortAddress(pool as TAddress, 6, 6)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {getShortAddress(tokenIn, 6, 6)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getShortAddress(tokenOut, 6, 6)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <FullPageLoader />
        )}
      </div>
    </>
  );
};

export { Swapper };
