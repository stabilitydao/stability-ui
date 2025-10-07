import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { TokenSelectorModal } from "@ui";

import { parseUnits, formatUnits } from "viem";

import { readContract, writeContract } from "@wagmi/core";

import { getTokenData } from "@utils";

import { account, currentChainID } from "@store";

import { wagmiConfig, SwapperABI, ERC20ABI } from "@web3";

import { deployments } from "@stabilitydao/stability";

import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

import { TAddress } from "@types";

const SwapForm = (): JSX.Element => {
  const $currentChainID = useStore(currentChainID);
  const $account = useStore(account);

  const tokenlist = tokenlistAll.tokens.filter(
    (token) => token.chainId == $currentChainID
  );

  const contractAddress: TAddress =
    deployments?.[$currentChainID]?.core?.swapper;

  const [amount, setAmount] = useState("");

  const [slippage, setSlippage] = useState("");

  const [balance, setBalance] = useState("0");

  const [tokenInModalOpen, setTokenInModalOpen] = useState(false);
  const [tokenOutModalOpen, setTokenOutModalOpen] = useState(false);

  const [tokenInSymbol, setTokenInSymbol] = useState("Select token");
  const [tokenOutSymbol, setTokenOutSymbol] = useState("Select token");

  const [selectedTokenIn, setSelectedTokenIn] = useState("");
  const [selectedTokenOut, setSelectedTokenOut] = useState("");

  const swap = async () => {
    try {
      const tokenInData = getTokenData(selectedTokenIn);
      const decimals = tokenInData?.decimals || 18;

      const parsedAmount = parseUnits(amount, decimals);
      const parsedSlippage = parseUnits(slippage, 3);

      const allowance = await readContract(wagmiConfig, {
        address: selectedTokenIn as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, contractAddress],
      });

      console.log("Current allowance:", allowance.toString());

      if (allowance < parsedAmount) {
        const approveTx = await writeContract(wagmiConfig, {
          address: selectedTokenIn as TAddress,
          abi: ERC20ABI,
          functionName: "approve",
          args: [contractAddress, parsedAmount],
        });

        console.log("Approve tx:", approveTx);
      }

      console.log("Swap args:", [
        selectedTokenIn,
        selectedTokenOut,
        parsedAmount,
        parsedSlippage,
      ]);

      const hash = await writeContract(wagmiConfig, {
        address: contractAddress,
        abi: SwapperABI,
        functionName: "swap",
        args: [
          selectedTokenIn as TAddress,
          selectedTokenOut as TAddress,
          parsedAmount,
          parsedSlippage,
        ],
        gas: BigInt(700000),
      });

      console.log("Swap tx hash:", hash);
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  const handleSlippageChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setSlippage(value);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const getTokenBalance = async () => {
    console.log(selectedTokenIn);
    const tokenInData = getTokenData(selectedTokenIn);
    try {
      const balance = await readContract(wagmiConfig, {
        address: selectedTokenIn as TAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      const formattedBalance = formatUnits(balance, tokenInData?.decimals);

      setBalance(formattedBalance);
    } catch (error) {
      console.error("Get balance error:", error);
    }
  };

  useEffect(() => {
    if (!!selectedTokenIn) {
      getTokenBalance();
    }
  }, [selectedTokenIn]);

  return (
    <div className="w-full max-w-[600px] rounded-xl bg-accent-900 p-6 shadow-2xl my-5">
      <h2 className="text-xl font-semibold mb-4">Swap</h2>

      <div className="grid gap-3 mb-4 max-h-[50vh] overflow-y-auto pr-2">
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
                    (tokenInSymbol === "Select token" ? "wS" : tokenInSymbol)
                )?.logoURI
              }
              alt={tokenInSymbol}
              className="h-6 w-6 rounded-full"
            />
            {tokenInSymbol}
          </button>
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
        </div>
      </div>

      <TokenSelectorModal
        open={tokenInModalOpen}
        onClose={() => setTokenInModalOpen(false)}
        onSelect={(token) => {
          setSelectedTokenIn(token.address);
          setTokenInSymbol(token.symbol);
        }}
      />
      <div>
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          inputMode="decimal"
          className="mb-4 w-full rounded-lg bg-[#1D1E23] border border-[#35363B] p-3 text-white outline-none placeholder:text-[#97979A] hover:bg-[#232429] focus:border-[#816FEA] transition-all"
        />
        {!!Number(balance) && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#97979A] text-[16px] leading-5">
              Balance: {balance}
            </span>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setAmount(balance)}
            >
              Max
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="amount">Slippage (%)</label>
        <input
          type="text"
          id="amount"
          value={slippage}
          onChange={handleSlippageChange}
          placeholder="0"
          inputMode="decimal"
          className="mb-4 w-full rounded-lg bg-[#1D1E23] border border-[#35363B] p-3 text-white outline-none placeholder:text-[#97979A] hover:bg-[#232429] focus:border-[#816FEA] transition-all"
        />
      </div>

      <TokenSelectorModal
        open={tokenOutModalOpen}
        onClose={() => setTokenOutModalOpen(false)}
        onSelect={(token) => {
          setSelectedTokenOut(token.address);
          setTokenOutSymbol(token.symbol);
        }}
      />

      <button
        onClick={swap}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        // disabled={
        //   simulationStatus === "loading" ||
        //   txStatus === "wallet" ||
        //   txStatus === "pending"
        // }
      >
        Swap
      </button>
    </div>
  );
};

export { SwapForm };
