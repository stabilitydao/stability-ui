import { useState, useEffect } from "react";

import axios from "axios";

import {
  HeadingText,
  FullPageLoader,
  TokenSelectorModal,
  TxStatusModal,
  TxStatus,
} from "@ui";

import { getShortAddress } from "@utils";

import { BC_POOL_TABLE, POOL_TABLE } from "@constants";

import { GRAPH_ENDPOINTS } from "src/constants/env";

import type { TAddress, TTableColumn, TPoolTable } from "@types";

import {
  createPublicClient,
  formatUnits,
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
  getAddress,
} from "viem";
import { useStore } from "@nanostores/react";
import { writeContract } from "@wagmi/core";
import { wagmiConfig, SwapperABI } from "@web3";
import { connected, account, currentChainID } from "@store";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";
import { sonic } from "viem/chains";
import { FaGasPump, FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Swapper = (): JSX.Element => {
  const poolTableStates = POOL_TABLE;
  const BCPoolTableStates = BC_POOL_TABLE;

  const $currentChainID = useStore(currentChainID);

  const [poolTableData, setPoolTableData] = useState<TPoolTable[]>([]);
  const [BCPoolTableData, setBCPoolTableData] = useState<TPoolTable[]>([]);

  const initTablesData = async () => {
    try {
      const GRAPH_URL = GRAPH_ENDPOINTS[$currentChainID];

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
    {
      name: "Solidly (Equalizer, SwapX classic)",
      address: "0xE3374041F173FFCB0026A82C6EEf94409F713Cf9",
    },
    {
      name: "AlgebraV4 (SwapX CL)",
      address: "0xcb2dfcaec4F1a4c61c5D09100482109574E6b8C7",
    },
    {
      name: "UniswapV3 (Shadow)",
      address: "0xAf95468B1a624605bbFb862B0FB6e9C73Ad847b8",
    },
    { name: "ERC4626", address: "0xB7192f4b8f741E21b9022D2F8Fd19Ca8c94E7774" },
    {
      name: "BalancerV3Stable",
      address: "0xcd85425fF6C07cF09Ca6Ac8F683E8164F27C143c",
    },
    {
      name: "BalancerWeighted",
      address: "0x7D6641cf68E5169c11d91266D3E410130dE70B9E",
    },
    { name: "Pendle", address: "0x9fcE12c813fC2280A800e8683b918de121B2437B" },
  ];

  function getNameByAddress(address: string): string | undefined {
    return AMM_ADAPTERS.find(
      (a) => a.address.toLowerCase() === address.toLowerCase()
    )?.name;
  }

  const tokenlist = tokenlistAll.tokens.filter(
    (token) => token.chainId == $currentChainID
  );

  function findTokenByAddress(address: string) {
    return tokenlist.find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );
  }

  /* ───────── stores / wallet ───────── */
  const { open: openConnect } = useWeb3Modal();
  const $connected = useStore(connected);
  const $account = useStore(account);

  const _publicClient = createPublicClient({
    chain: sonic,
    transport: http(
      import.meta.env.PUBLIC_SONIC_RPC || "https://sonic.drpc.org"
    ),
  });

  /* ───────── UI / modal state ───────── */
  const [simulationStatus, setSimulationStatus] = useState<
    "idle" | "loading" | "success" | "fail"
  >("idle");
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");
  const [selectedAdapter, setSelectedAdapter] = useState("");
  const [selectedTokenIn, setSelectedTokenIn] = useState("");
  const [selectedTokenOut, setSelectedTokenOut] = useState("");
  const [tokenInSymbol, setTokenInSymbol] = useState("Select token");
  const [tokenOutSymbol, setTokenOutSymbol] = useState("Select token");
  const [manualTokenIn, setManualTokenIn] = useState("");
  const [manualTokenOut, setManualTokenOut] = useState("");
  const [rewrite, setRewrite] = useState(false);
  const [tokenInModalOpen, setTokenInModalOpen] = useState(false);
  const [tokenOutModalOpen, setTokenOutModalOpen] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  const finalTokenIn = manualTokenIn === "" ? selectedTokenIn : manualTokenIn;
  const finalTokenOut =
    manualTokenOut === "" ? selectedTokenOut : manualTokenOut;

  const resetTxState = () => {
    setSimulationStatus("idle");
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
    setShowModal(false);
    setShowTxModal(false);
  };

  const closeModal = () => {
    setSimulationStatus("idle");
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
    setShowModal(false);
    setShowTxModal(false);
    setPoolAddress("");
    setSelectedAdapter("");
    setSelectedTokenIn("");
    setSelectedTokenOut("");
    setTokenInSymbol("Select token");
    setTokenOutSymbol("Select token");
    setManualTokenIn("");
    setManualTokenOut("");
    setRewrite(false);
  };

  const openAddModal = () => {
    setIsAdding(true);
    setShowModal(true);
    setRewrite(false);
  };

  const openEditModal = (
    id: Address,
    ammAdapter: Address,
    tokenIn: Address,
    tokenOut: Address
  ) => {
    setIsAdding(false);
    setShowModal(true);
    setPoolAddress(getAddress(id));
    setSelectedAdapter(getAddress(ammAdapter));
    const tokenInData = findTokenByAddress(tokenIn);
    tokenInData
      ? setSelectedTokenIn(getAddress(tokenIn))
      : setManualTokenIn(getAddress(tokenIn));
    tokenInData && setTokenInSymbol(tokenInData.symbol);
    const tokenOutData = findTokenByAddress(tokenOut);
    tokenOutData
      ? setSelectedTokenOut(getAddress(tokenOut))
      : setManualTokenOut(getAddress(tokenOut));
    tokenOutData && setTokenOutSymbol(tokenOutData.symbol);
    setRewrite(true);
  };

  const handleSubmit = async () => {
    try {
      resetTxState();

      if (!poolAddress || !selectedAdapter || !finalTokenIn || !finalTokenOut) {
        setSimulationStatus("fail");
        return;
      }

      setShowTxModal(true);
      setTxStatus("pending");

      const contractAddress: Address =
        "0xe52Fcf607A8328106723804De1ef65Da512771Be";
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

      setSimulationStatus("loading");
      await _publicClient.simulateContract({
        address: contractAddress,
        abi: SwapperABI,
        functionName,
        args,
        account: $account as TAddress,
      });
      setSimulationStatus("success");

      setTxStatus("wallet");

      const hash = await writeContract(wagmiConfig, {
        address: contractAddress,
        abi: SwapperABI,
        functionName,
        args,
        ...(gasEstimate && { gas: gasEstimate }),
      });
      setTxHash(hash);
      setTxStatus("pending");

      const receipt: TransactionReceipt =
        await _publicClient.waitForTransactionReceipt({ hash });
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

  const handleRemovePool = async (tokenIn: Address) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to delete this pool?\nThis action cannot be undone.`
      );
      if (!confirmed) return;

      resetTxState();

      if (!tokenIn) {
        setSimulationStatus("fail");
        return;
      }

      const contractAddress: Address =
        "0xe52Fcf607A8328106723804De1ef65Da512771Be";
      const functionName = "removePool";
      const args = [tokenIn] as const;

      setShowTxModal(true);
      setTxStatus("pending");

      setSimulationStatus("loading");
      await _publicClient.simulateContract({
        address: contractAddress,
        abi: SwapperABI,
        functionName,
        args,
        account: $account as TAddress,
      });

      const est = await _publicClient.estimateContractGas({
        address: contractAddress,
        abi: SwapperABI,
        functionName,
        args,
        account: $account as TAddress,
      });
      setSimulationStatus("success");

      setTxStatus("wallet");

      const hash = await writeContract(wagmiConfig, {
        address: contractAddress,
        abi: SwapperABI,
        functionName,
        args,
        gas: est,
      });
      setTxHash(hash);
      setTxStatus("pending");

      const receipt: TransactionReceipt =
        await _publicClient.waitForTransactionReceipt({ hash });
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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function updateGasEstimate() {
      if (
        !poolAddress ||
        !selectedAdapter ||
        !finalTokenIn ||
        !finalTokenOut ||
        !$account
      )
        return;

      try {
        const est = await _publicClient.estimateContractGas({
          address: "0xe52Fcf607A8328106723804De1ef65Da512771Be",
          abi: SwapperABI,
          functionName: "addPools",
          args: [
            [
              {
                pool: poolAddress as Address,
                ammAdapter: selectedAdapter as Address,
                tokenIn: finalTokenIn as Address,
                tokenOut: finalTokenOut as Address,
              },
            ],
            rewrite,
          ] as const,
          account: $account as TAddress,
        });
        const gasPrice = await _publicClient.getGasPrice();
        const totalFee = est * gasPrice;
        setGasEstimate(totalFee);
      } catch (err) {
        console.error("Gas estimate failed", err);
        setGasEstimate(null);
      }
    }

    // run immediately
    updateGasEstimate();

    // refresh every 15 seconds
    interval = setInterval(updateGasEstimate, 15000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    poolAddress,
    selectedAdapter,
    finalTokenIn,
    finalTokenOut,
    rewrite,
    $account,
  ]);

  return (
    <>
      <TxStatusModal
        open={showTxModal}
        status={txStatus}
        hash={txHash}
        error={txError}
        onClose={closeModal}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="w-full max-w-[600px] rounded-xl bg-accent-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {isAdding ? "Add Pool" : "Edit Pool"}
            </h2>

            <div className="grid gap-3 mb-4 max-h-[50vh] overflow-y-auto pr-2">
              <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 text-sm outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                Pool Address:
                <input
                  value={poolAddress}
                  onChange={(e) => setPoolAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-transparent text-lg font-semibold outline-none w-full placeholder:text-neutral-500"
                />
              </label>

              <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 text-sm outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                AMM Adapter:
                <select
                  value={selectedAdapter}
                  onChange={(e) => setSelectedAdapter(e.target.value)}
                  className="bg-accent-900 text-xl font-semibold outline-none transition-all w-full"
                >
                  <option value="">Select an adapter</option>
                  {AMM_ADAPTERS.map((option) => (
                    <option key={option.address} value={option.address}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <label className="mb-2 block text-sm">Token In:</label>
                <button
                  type="button"
                  onClick={() => setTokenInModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-lg border-[2px] border-accent-800 bg-accent-900 p-3 text-left text-neutral-50 transition-all hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                >
                  <img
                    src={
                      tokenlist.find(
                        (t) =>
                          t.symbol ===
                          (tokenInSymbol === "Select token"
                            ? "wS"
                            : tokenInSymbol)
                      )?.logoURI
                    }
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
                  className="mt-3 w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Token Out:</label>
                <button
                  type="button"
                  onClick={() => setTokenOutModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-lg border-[2px] border-accent-800 bg-accent-900 p-3 text-left text-neutral-50 transition-all hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                >
                  <img
                    src={
                      tokenlist.find(
                        (t) =>
                          t.symbol ===
                          (tokenOutSymbol === "Select token"
                            ? "STBL"
                            : tokenOutSymbol)
                      )?.logoURI
                    }
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
                  className="mt-3 w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 p-3 text-neutral-50 outline-none transition-all placeholder:text-neutral-500 hover:border-accent-500 hover:bg-accent-800 focus:border-accent-500"
                />
              </div>
            </div>

            <TokenSelectorModal
              open={tokenInModalOpen}
              onClose={() => setTokenInModalOpen(false)}
              onSelect={(token) => {
                setSelectedTokenIn(token.address);
                setTokenInSymbol(token.symbol);
                setManualTokenIn("");
              }}
            />
            <TokenSelectorModal
              open={tokenOutModalOpen}
              onClose={() => setTokenOutModalOpen(false)}
              onSelect={(token) => {
                setSelectedTokenOut(token.address);
                setTokenOutSymbol(token.symbol);
                setManualTokenOut("");
              }}
            />

            <div className="flex flex-row justify-between items-center">
              <div className="bg-[#61697114] px-1.5 py-1 border border-solid border-[#7B8187] rounded-xl text-[#7B8187] flex flex-row items-center gap-2 text-sm select-none">
                <FaGasPump />
                <span>
                  {gasEstimate ? formatUnits(gasEstimate, 18) : "0.00"}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-3 py-1 bg-gray-500 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={
                    simulationStatus === "loading" ||
                    txStatus === "wallet" ||
                    txStatus === "pending"
                  }
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <HeadingText text="Swapper" scale={1} />

        {BCPoolTableData.length || poolTableData.length ? (
          <>
            <HeadingText text="Pools" scale={2} />

            <div className="flex justify-start">
              <button
                onClick={openAddModal}
                className="my-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Pools
              </button>
            </div>

            {poolTableData.length ? (
              <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
                <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
                  <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                    <tr className="text-[12px] font-bold uppercase text-center">
                      {poolTableStates.map(
                        (value: TTableColumn, index: number) => (
                          <th key={value.name + index} className="px-4 py-3">
                            {value.name}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-[14px]">
                    {poolTableData.map(
                      ({ id, ammAdapter, tokenIn, tokenOut }) => {
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
                              {ammAdapterName && (
                                <div>{getNameByAddress(ammAdapter)}</div>
                              )}
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
                              <div className="flex flex-row my-auto gap-4">
                                <button
                                  onClick={() => {
                                    openEditModal(
                                      id,
                                      ammAdapter,
                                      tokenIn,
                                      tokenOut
                                    );
                                  }}
                                  disabled={
                                    simulationStatus === "loading" ||
                                    txStatus === "wallet"
                                  }
                                  title="Edit pool"
                                >
                                  <FaRegEdit />
                                </button>

                                <button
                                  onClick={() => {
                                    $connected
                                      ? handleRemovePool(tokenIn)
                                      : openConnect();
                                  }}
                                  disabled={
                                    simulationStatus === "loading" ||
                                    txStatus === "wallet"
                                  }
                                  title="Do you want to remove this pool?"
                                >
                                  <MdOutlineDeleteOutline size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <HeadingText text="No Pools" scale={2} />
            )}

            {BCPoolTableData.length ? (
              <div>
                <HeadingText text="Blue Chip Pools" scale={2} />
                <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px] mt-5">
                  <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
                    <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                      <tr className="text-[12px] font-bold uppercase text-center">
                        {BCPoolTableStates.map(
                          (value: TTableColumn, index: number) => (
                            <th
                              key={value.name + index * 10}
                              className="px-4 py-3"
                            >
                              {value.name}
                            </th>
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
              </div>
            ) : (
              <HeadingText text="No Blue Chip Pools" scale={2} />
            )}
          </>
        ) : (
          <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%]">
            <FullPageLoader />
          </div>
        )}
      </div>
    </>
  );
};

export { Swapper };
