import { useEffect, useState } from "react";

import { HeadingText, FullPageLoader } from "@ui";

import {
  Address,
  Hash,
  TransactionReceipt,
  zeroAddress,
  formatUnits,
} from "viem";

import { getShortAddress } from "@utils";

import { useStore } from "@nanostores/react";

import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  simulateContract,
} from "@wagmi/core";

import { wagmiConfig, FactoryABI } from "@web3";

import { connected, account, currentChainID, publicClient } from "@store";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

import { strategies } from "@stabilitydao/stability";

import { BaseStrategy } from "@stabilitydao/stability/out/strategies";

import {
  TokenSelectorModal,
  Token,
  TxStatusModal,
  TxStatus,
} from "@components/TokenSelectorModal";

import { FaGasPump } from "react-icons/fa";

import { factories } from "@web3";

type Farm = {
  status: bigint;
  pool: Address;
  strategyLogicId: string;
  rewardAssets: Address[];
  addresses: Address[];
  nums: bigint[];
  ticks: number[];
};

const defaultFarm: Farm = {
  status: 0n,
  pool: zeroAddress,
  strategyLogicId: "",
  rewardAssets: [],
  addresses: [],
  nums: [],
  ticks: [],
};

const Farms = (): JSX.Element => {
  /* ───────── stores / wallet ───────── */
  const { open: openConnect } = useWeb3Modal();
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);
  const $publicClient = useStore(publicClient);

  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [editFarm, setEditFarm] = useState<Farm | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  /* ───────── UI / modal state ───────── */
  const [simulationStatus, setSimulationStatus] = useState<
    "idle" | "loading" | "success" | "fail"
  >("idle");
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const tokenlist = tokenlistAll.tokens.filter(
    (token) => token.chainId == $currentChainID
  );

  function findTokenByAddress(address: string) {
    return tokenlist.find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );
  }

  const fetchFarms = async () => {
    try {
      const result = await readContract(wagmiConfig, {
        address: factories[$currentChainID],
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

  const statusOptions = [
    { value: 0, label: "ok" },
    { value: 1, label: "no rewards" },
    { value: 2, label: "deprecated" },
    { value: 5, label: "unbacked underlying" },
  ];

  const [isLPStrategy, setIsLPStrategy] = useState(false);

  const liveFarmingStrategies = Object.values(strategies).filter(
    (strategy) =>
      strategy.state === "LIVE" &&
      strategy.baseStrategies.some((b) => b === "Farming")
  );

  function getStrategyById(id: string) {
    return liveFarmingStrategies.find((strategy) => strategy.id === id);
  }

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [rewardAssets, setRewardAssets] = useState<Token[]>([]);
  const [showTxModal, setShowTxModal] = useState(false);

  const addToken = (token: Token) => {
    if (!rewardAssets.find((t: Token) => t.address === token.address)) {
      const newAssets = [...rewardAssets, token];
      setRewardAssets(newAssets);

      handleInputChange(
        "rewardAssets",
        newAssets.map((t) => t.address) as Address[]
      );
    }
  };

  const removeToken = (tokenAddress: string) => {
    const newAssets = rewardAssets.filter(
      (t: Token) => t.address !== tokenAddress
    );
    setRewardAssets(newAssets);

    handleInputChange(
      "rewardAssets",
      newAssets.map((t) => t.address) as Address[]
    );
  };

  function getTokensFromAddresses(addresses: string[]): Token[] {
    return addresses
      .map((addr) =>
        tokenlist.find(
          (token) => token.address.toLowerCase() === addr.toLowerCase()
        )
      )
      .filter((t): t is Token => t !== undefined);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function updateGasEstimate() {
      if (!editFarm || !$account) return;

      try {
        const est = await $publicClient.estimateContractGas({
          address: factories[$currentChainID],
          abi: FactoryABI,
          functionName: isAdding ? "addFarms" : "updateFarm",
          args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
          account: $account as Address,
        });
        const gasPrice = await $publicClient.getGasPrice();
        const totalFee = est * gasPrice;
        setGasEstimate(totalFee);
      } catch (err) {
        console.error("Gas estimate failed", err);
        setGasEstimate(null);
      }
    }

    if (showModal) {
      updateGasEstimate();
      interval = setInterval(updateGasEstimate, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModal, editFarm, editIndex, isAdding, $account]);

  useEffect(() => {
    fetchFarms();
  }, []);

  const openEditModal = (farm: Farm, index: number) => {
    const rewards = getTokensFromAddresses(farm.rewardAssets);
    setRewardAssets(rewards);
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

  const handleInputChange = <K extends keyof Farm>(
    field: K,
    value: Farm[K]
  ) => {
    if (!editFarm) return;
    setEditFarm({ ...editFarm, [field]: value });
  };

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
    setEditFarm(null);
    setEditIndex(null);
    setRewardAssets([]);
    setShowModal(false);
    setShowTxModal(false);
  };

  const handleSubmit = async () => {
    try {
      resetTxState();

      if (
        !editFarm ||
        (!isAdding && (editIndex === null || editIndex === undefined))
      ) {
        setSimulationStatus("fail");
        return;
      }

      setShowTxModal(true);
      setTxStatus("pending");

      try {
        setSimulationStatus("loading");
        await simulateContract(wagmiConfig, {
          address: factories[$currentChainID],
          abi: FactoryABI,
          functionName: isAdding ? "addFarms" : "updateFarm",
          args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
          account: $account as Address,
          ...(gasEstimate && { gas: gasEstimate }),
        });
        setSimulationStatus("success");
      } catch (simErr) {
        console.error("Simulation failed", simErr);
        setTxStatus("error");
        setTxError(
          simErr instanceof Error
            ? simErr.message
            : "Simulation failed: possible revert or bad parameters."
        );
        setSimulationStatus("fail");
        return;
      }

      setTxStatus("wallet");

      const hash = await writeContract(wagmiConfig, {
        address: factories[$currentChainID],
        abi: FactoryABI,
        functionName: isAdding ? "addFarms" : "updateFarm",
        args: isAdding ? [[editFarm]] : [BigInt(editIndex!), editFarm],
        ...(gasEstimate && { gas: gasEstimate }),
      });
      setTxHash(hash);
      setTxStatus("pending");

      const receipt: TransactionReceipt = await waitForTransactionReceipt(
        wagmiConfig,
        { hash: hash }
      );
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
      setTxError(
        err instanceof Error ? err.message : "Unexpected error. Check console."
      );
    }
  };

  if (loading || farms === null) return <FullPageLoader />;

  return (
    <>
      <TxStatusModal
        open={showTxModal}
        status={txStatus}
        hash={txHash}
        error={txError}
        onClose={closeModal}
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
                  <td className="px-4 py-3">
                    {getShortAddress(farm.pool, 6, 6)}
                  </td>
                  <td className="px-4 py-3">{farm.strategyLogicId}</td>
                  <td className="px-4 py-3">
                    {farm.rewardAssets.map((a, i) => {
                      const token = findTokenByAddress(a);
                      return token ? (
                        <div
                          key={i}
                          className="flex justify-center items-center gap-2"
                        >
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
                      onClick={() => {
                        $connected ? openEditModal(farm, i) : openConnect();
                      }}
                      className="text-blue-500 hover:underline"
                      disabled={
                        simulationStatus === "loading" || txStatus === "wallet"
                      }
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="w-full max-w-[600px] rounded-xl bg-accent-900 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4">
                {isAdding ? "Add Farm" : "Edit Farm"}
              </h2>

              <div className="grid gap-3 mb-4 max-h-[50vh] overflow-y-auto pr-2">
                <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  Status:
                  <select
                    value={editFarm.status.toString()}
                    onChange={(e) =>
                      handleInputChange("status", BigInt(e.target.value))
                    }
                    className="bg-accent-900 text-xl font-semibold outline-none transition-all w-full"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                {isLPStrategy && (
                  <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                    Pool Address
                    <input
                      value={editFarm.pool}
                      onChange={(e) =>
                        handleInputChange("pool", e.target.value as Address)
                      }
                      className="bg-transparent text-2xl font-semibold outline-none w-full"
                    />
                  </label>
                )}
                <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  Strategy Logic ID
                  <select
                    value={editFarm.strategyLogicId}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange("strategyLogicId", value);
                      setIsLPStrategy(
                        getStrategyById(value)?.baseStrategies.includes(
                          BaseStrategy.LP
                        ) ?? false
                      );
                    }}
                    className="bg-accent-900 text-xl font-semibold outline-none transition-all w-full"
                  >
                    {liveFarmingStrategies.map((option) => (
                      <option key={option.shortId} value={option.id}>
                        {option.id}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-2 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white">Reward Assets</span>
                    <button
                      onClick={() => setShowTokenModal(true)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm">Add Asset</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rewardAssets.map((token: Token) => (
                      <div
                        key={token.address}
                        className="flex items-center bg-[#2A2C31] border border-[#3A3C41] rounded-full px-3 py-1 gap-2 text-white"
                      >
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {token.symbol}
                        </span>
                        <button
                          onClick={() => removeToken(token.address)}
                          className="text-gray-400 hover:text-red-400 transition-colors duration-150"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  Addresses (comma-separated)
                  <input
                    value={editFarm.addresses.join(",")}
                    onChange={(e) =>
                      handleInputChange(
                        "addresses",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim()) as Address[]
                      )
                    }
                    className="bg-transparent text-lg font-semibold outline-none w-full"
                  />
                </label>
                <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  Nums (comma-separated)
                  <input
                    value={editFarm.nums.map((n) => n.toString()).join(",")}
                    onChange={(e) =>
                      handleInputChange(
                        "nums",
                        e.target.value.split(",").map((n) => BigInt(n.trim()))
                      )
                    }
                    className="bg-transparent text-lg font-semibold outline-none w-full"
                  />
                </label>
                <label className="w-full rounded-lg border-[2px] border-accent-800 bg-accent-900 px-3 py-0.5 text-neutral-50 outline-none transition-all hover:border-accent-500 focus:border-accent-500">
                  Ticks (comma-separated)
                  <input
                    value={editFarm.ticks.join(",")}
                    onChange={(e) =>
                      handleInputChange(
                        "ticks",
                        e.target.value
                          .split(",")
                          .map((n) => parseInt(n.trim()))
                          .filter((n) => !isNaN(n))
                      )
                    }
                    className="bg-transparent text-lg font-semibold outline-none w-full"
                  />
                </label>
              </div>

              <TokenSelectorModal
                open={showTokenModal}
                onClose={() => setShowTokenModal(false)}
                onSelect={(token) => {
                  addToken(token);
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
      </div>
    </>
  );
};

export { Farms };
