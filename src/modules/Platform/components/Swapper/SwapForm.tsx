import { useEffect, useState, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { TokenSelectorModal } from "@ui";

import { parseUnits, formatUnits } from "viem";

import { readContract, writeContract } from "@wagmi/core";

import { getTokenData, getTransactionReceipt, getShortAddress } from "@utils";

import { account, currentChainID } from "@store";

import { wagmiConfig, SwapperABI, ERC20ABI } from "@web3";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { CHAINS } from "@constants";

import { deployments } from "@stabilitydao/stability";

import tokenlistAll from "@stabilitydao/stability/out/stability.tokenlist.json";

import { TAddress } from "@types";

const SwapForm = (): JSX.Element => {
  const { open } = useWeb3Modal();

  const $currentChainID = useStore(currentChainID) ?? "146";
  const $account = useStore(account);

  const tokenlist = tokenlistAll.tokens.filter(
    (token) => token.chainId == $currentChainID
  );

  const contractAddress: TAddress =
    deployments?.[$currentChainID]?.core?.swapper;

  const explorer = CHAINS.find(({ id }) => id == $currentChainID)?.explorer;

  const [amount, setAmount] = useState("");
  const [amountOut, setAmountOut] = useState("");

  const [slippage, setSlippage] = useState("");

  const [tokenData, setTokenData] = useState({
    allowance: "0",
    balance: "0",
    outBalance: "0",
  });

  const [lastTx, setLastTx] = useState("");

  const [tokenInModalOpen, setTokenInModalOpen] = useState(false);
  const [tokenOutModalOpen, setTokenOutModalOpen] = useState(false);

  const [tokenInSymbol, setTokenInSymbol] = useState("Select token");
  const [tokenOutSymbol, setTokenOutSymbol] = useState("Select token");

  const [selectedTokenIn, setSelectedTokenIn] = useState("");
  const [selectedTokenOut, setSelectedTokenOut] = useState("");

  const [buildRouteData, setBuildRouteData] = useState([]);

  const swap = async () => {
    try {
      const tokenInData = getTokenData(selectedTokenIn);
      const decimals = tokenInData?.decimals || 18;

      const parsedAmount = parseUnits(amount, decimals);
      const parsedSlippage = parseUnits(slippage, 3);

      console.log(Number(tokenData.allowance), Number(amount));
      if (Number(tokenData.allowance) < Number(amount)) {
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

      await getTransactionReceipt(hash);

      console.log("Swap tx hash:", hash);

      setLastTx(`${explorer}/tx/${hash}`);
      clearForm();
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  const clearForm = () => {
    setSelectedTokenIn("");
    setSelectedTokenOut("");
    setTokenInSymbol("Select token");
    setTokenOutSymbol("Select token");
    setAmount("");
    setAmountOut("");
    setSlippage("");
    setBuildRouteData([]);
    setTokenData({ allowance: "0", balance: "0", outBalance: "0" });
  };

  const handleSlippageChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setSlippage(value);
    }
  };

  const AMM_ADAPTERS = useMemo(() => {
    const adapters = deployments?.[$currentChainID]?.ammAdapters;
    if (!adapters) return [];

    return Object.entries(adapters).map(([name, address]) => ({
      name,
      address,
    }));
  }, [$currentChainID, deployments]);

  function getNameByAddress(address: string): string | undefined {
    return AMM_ADAPTERS.find(
      (a) => a.address.toLowerCase() === address.toLowerCase()
    )?.name;
  }

  const handleChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const getSwapperPrice = async () => {
    try {
      const tokenInData = getTokenData(selectedTokenIn);
      const decimals = tokenInData?.decimals || 18;

      const tokenOutData = getTokenData(selectedTokenOut);
      const tokenOutDecimals = tokenOutData?.decimals || 18;

      const parsedAmount = parseUnits(amount, decimals);

      const _price = await readContract(wagmiConfig, {
        address: contractAddress,
        abi: SwapperABI,
        functionName: "getPrice",
        args: [
          selectedTokenIn as TAddress,
          selectedTokenOut as TAddress,
          parsedAmount,
        ],
      });

      setAmountOut(formatUnits(_price, tokenOutDecimals));
    } catch (error) {
      console.error("getPrice error", error);
    }
  };

  const getTokenBalanceAndAllowance = async () => {
    if (!$account) return;

    const _tokenData = { allowance: "0", balance: "0", outBalance: "0" };

    if (!!selectedTokenIn) {
      const tokenInData = getTokenData(selectedTokenIn);

      try {
        const balance = await readContract(wagmiConfig, {
          address: selectedTokenIn as TAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        });

        const allowance = await readContract(wagmiConfig, {
          address: selectedTokenIn as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, contractAddress],
        });

        const formattedAllowance = formatUnits(
          allowance,
          tokenInData?.decimals
        );
        const formattedBalance = formatUnits(balance, tokenInData?.decimals);

        _tokenData.allowance = formattedAllowance;
        _tokenData.balance = formattedBalance;
      } catch (error) {
        console.error("Get tokenIn data error:", error);
      }
    }

    if (!!selectedTokenOut) {
      const tokenOutData = getTokenData(selectedTokenOut);

      try {
        const balance = await readContract(wagmiConfig, {
          address: selectedTokenOut as TAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        });

        const formattedBalance = formatUnits(balance, tokenOutData?.decimals);

        _tokenData.outBalance = formattedBalance;
      } catch (error) {
        console.error("Get tokenOut data error:", error);
      }
    }

    if (!!selectedTokenIn && !!selectedTokenOut) {
      try {
        const _buildRoute = await readContract(wagmiConfig, {
          address: contractAddress,
          abi: SwapperABI,
          functionName: "buildRoute",
          args: [selectedTokenIn as TAddress, selectedTokenOut as TAddress],
        });

        setBuildRouteData(_buildRoute[0]);
      } catch (error) {
        console.error("Get build route error:", error);
      }
    }

    setTokenData(_tokenData);
  };

  useEffect(() => {
    if (!!selectedTokenIn && !!selectedTokenOut && !!amount) {
      getSwapperPrice();
    }
  }, [selectedTokenIn, selectedTokenOut, amount]);

  useEffect(() => {
    if (!!selectedTokenIn || !!selectedTokenOut) {
      getTokenBalanceAndAllowance();
    }
  }, [selectedTokenIn, selectedTokenOut]);

  return (
    <div className="w-full max-w-[600px] rounded-xl bg-accent-900 p-6 shadow-2xl my-5">
      <h2 className="text-xl font-semibold mb-4">Swap</h2>

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

      <div className="mt-5">
        <label htmlFor="amount">Amount In</label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          inputMode="decimal"
          className="mb-4 w-full rounded-lg bg-[#1D1E23] border border-[#35363B] p-3 text-white outline-none placeholder:text-[#97979A] hover:bg-[#232429] focus:border-[#816FEA] transition-all"
        />

        <div className="flex items-start justify-between gap-2">
          <span className="text-[#97979A] text-[16px] leading-5">
            Balance: {tokenData.balance}
          </span>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setAmount(tokenData.balance)}
          >
            Max
          </button>
        </div>
      </div>

      <div className="mt-5">
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
                  (tokenOutSymbol === "Select token" ? "STBL" : tokenOutSymbol)
              )?.logoURI
            }
            alt={tokenOutSymbol}
            className="h-6 w-6 rounded-full"
          />
          {tokenOutSymbol}
        </button>

        <span className="text-[#97979A] text-[16px] leading-5">
          Balance: {tokenData.outBalance}
        </span>
      </div>

      {!!amountOut && <span>Amount out: {amountOut}</span>}

      <div className="mt-5">
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

      {!!buildRouteData.length && (
        <div className="flex flex-col items-center gap-2 mb-5">
          <span>Build route</span>
          <div>
            {buildRouteData.map((data) => {
              const _tokenIn = getTokenData(data?.tokenIn);
              const _tokenOut = getTokenData(data?.tokenOut);

              return (
                <div key={data?.pool} className="flex items-center gap-2">
                  <a
                    href={`${explorer}/address/${data?.pool}`}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    <span>{getShortAddress(data?.pool, 6, 6)}</span>
                    <img
                      src="/icons/purple_link.png"
                      alt="external link"
                      className="w-3 h-3 cursor-pointer"
                    />
                  </a>

                  <span>{getNameByAddress(data?.ammAdapter)}</span>
                  <div className="flex items-center">
                    <img
                      src={_tokenIn?.logoURI}
                      alt={_tokenIn?.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <img
                      src={_tokenOut?.logoURI}
                      alt={_tokenOut?.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!!lastTx && (
        <a
          target="_blank"
          href={lastTx}
          className="underline text-[#9180F4] my-2"
        >
          Check tx
        </a>
      )}

      {$account ? (
        <>
          {!Number(amount) ? (
            <button className="px-3 py-1 text-[#6A6B6F] bg-[#35363B] rounded w-full cursor-default">
              Enter amount
            </button>
          ) : Number(amount) > Number(tokenData?.balance) ? (
            <button className="px-3 py-1 text-[#6A6B6F] bg-[#35363B] rounded w-full cursor-default">
              Not enough balance
            </button>
          ) : (
            <button
              onClick={swap}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              {Number(tokenData?.allowance) >= Number(amount)
                ? "Swap"
                : "Approve & Swap"}
            </button>
          )}
        </>
      ) : (
        <button
          onClick={() => open()}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        >
          Connect Wallet
        </button>
      )}

      <TokenSelectorModal
        open={tokenInModalOpen}
        onClose={() => setTokenInModalOpen(false)}
        onSelect={(token) => {
          setSelectedTokenIn(token.address);
          setTokenInSymbol(token.symbol);
        }}
      />

      <TokenSelectorModal
        open={tokenOutModalOpen}
        onClose={() => setTokenOutModalOpen(false)}
        onSelect={(token) => {
          setSelectedTokenOut(token.address);
          setTokenOutSymbol(token.symbol);
        }}
      />
    </div>
  );
};

export { SwapForm };
