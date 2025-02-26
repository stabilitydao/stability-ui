import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { writeContract } from "@wagmi/core";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { connected, account } from "@store";

import { Loader } from "@ui";

import { formatNumber } from "@utils";

import { Timer } from "./components";

import { getTransactionReceipt } from "./functions";

import {
  sonicClient,
  SALE_CONTRACT,
  SaleABI,
  ERC20ABI,
  wagmiConfig,
} from "@web3";

import type { TAddress } from "@types";

const STBL = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);

  const { open } = useWeb3Modal();

  const USDC = "0x29219dd400f2bf60e5a23d13be72b486d4038894";

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);

  const [inputValue, setInputValue] = useState("");
  const [button, setButton] = useState("");

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [isStarted, setIsStarted] = useState(true);

  const [saleData, setSaleData] = useState({
    price: "-",
    tge: 0,
    start: 0,
    end: 0,
    sold: "-",
    allocation: "-",
    bought: "-",
    raised: "-",
    maxRaise: "-",
  });

  const resetFormAfterTx = () => {
    setButton("none");
    input.current.value = "";
    setInputValue("");
    getData();
    getBalance();
    getAllowance();
  };

  const handleInputChange = (type = "") => {
    let numericValue = input.current.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    if (type === "max") {
      numericValue = String(balance / Number(saleData.price));
    }

    buyPreview(numericValue);

    setInputValue(numericValue);
    input.current.value = numericValue;
  };

  const approve = async () => {
    setTransactionInProgress(true);

    const usdcValue = Number(input.current.value) * Number(saleData.price);

    if (!!usdcValue) {
      try {
        let parsedValue = parseUnits(String(usdcValue), 6);

        setNeedConfirm(true);
        const _approve = await writeContract(wagmiConfig, {
          address: USDC,
          abi: ERC20ABI,
          functionName: "approve",
          args: [SALE_CONTRACT, parsedValue],
        });
        setNeedConfirm(false);

        const transaction = await getTransactionReceipt(_approve);

        if (transaction?.status === "success") {
          const _allowance = await getAllowance();

          if (Number(_allowance) >= usdcValue) {
            setButton("buy");
          } else {
            setButton("needApprove");
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        console.error("Approve error:", error);
      }
    }
    setTransactionInProgress(false);
  };

  const buy = async () => {
    setTransactionInProgress(true);

    const value = Number(input.current.value);

    if (!!value) {
      try {
        let parsedValue = parseUnits(String(value), 18);

        setNeedConfirm(true);
        let buy = await writeContract(wagmiConfig, {
          address: SALE_CONTRACT,
          abi: SaleABI,
          functionName: "buy",
          args: [parsedValue],
        });
        setNeedConfirm(false);
        setTransactionInProgress(true);

        const transaction = await getTransactionReceipt(buy);

        if (transaction.status === "success") {
          resetFormAfterTx();
        }

        setTransactionInProgress(false);
      } catch (error) {
        setNeedConfirm(false);
        console.error("Buy errror:", error);
      }
    }

    setTransactionInProgress(false);
  };

  const buyPreview = (value: string) => {
    if (!Number(value)) {
      setButton("none");
      return;
    }

    const usdcValue = Number(value) * Number(saleData.price);

    if (Number(usdcValue) > Number(balance)) {
      setButton("insufficientBalance");
    } else if (Number(usdcValue) > Number(allowance)) {
      setButton("needApprove");
    } else if (
      Number(usdcValue) <= Number(allowance) &&
      Number(usdcValue) <= Number(balance)
    ) {
      setButton("buy");
    }
  };

  const getAllowance = async () => {
    const newAllowance = await sonicClient.readContract({
      address: USDC,
      abi: ERC20ABI,
      functionName: "allowance",
      args: [$account as TAddress, SALE_CONTRACT],
    });

    const _allowance = formatUnits(newAllowance, 6);

    setAllowance(Number(_allowance));

    return Number(_allowance);
  };

  const getBalance = async () => {
    try {
      const usdcBalance = await sonicClient.readContract({
        address: USDC,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      let parsedBalance = formatUnits(usdcBalance, 6);

      if (parsedBalance) {
        setBalance(Number(parsedBalance));
      }
    } catch (error) {
      console.error("Get balance error:", error);
    }
  };

  const getData = async () => {
    let bought = "-";

    try {
      const price = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "price",
      })) as bigint;

      const tge = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "tge",
      })) as bigint;

      const start = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "start",
      })) as bigint;

      const end = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "end",
      })) as bigint;

      const sold = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "sold",
      })) as bigint;

      const allocation = (await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "ALLOCATION_SALE",
      })) as bigint;

      if ($account) {
        const userBought = (await sonicClient?.readContract({
          address: SALE_CONTRACT,
          abi: SaleABI,
          functionName: "bought",
          args: [$account as TAddress],
        })) as bigint;

        bought = formatUnits(userBought, 18);
      }

      const raised = String(
        Number(formatUnits(price, 6)) * Number(formatUnits(sold, 18))
      );

      const maxRaise = String(
        Number(formatUnits(price, 6)) * Number(formatUnits(allocation, 18))
      );

      setSaleData({
        price: formatUnits(price, 6),
        tge: Number(tge),
        start: Number(start),
        end: Number(end),
        sold: formatUnits(sold, 18),
        allocation: formatUnits(allocation, 18),
        bought,
        raised,
        maxRaise,
      });

      const now = Math.floor(Date.now() / 1000);

      const _isStarted = Number(start) < now;

      setIsStarted(_isStarted);
    } catch (error) {
      console.error("Get data error:", error);
    }
  };

  useEffect(() => {
    if ($account) {
      getBalance();
      getAllowance();
    }
  }, [$account]);

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="w-full xl:min-w-[1200px] max-w-[1400px] font-manrope">
      <div className="STBL">
        <div className="flex justify-between items-center h-[400px] py-10 pl-[50px] pr-[80px]">
          <div className="flex flex-col items-start justify-between h-full">
            <div>
              <span className="text-[55px] leading-10">PUBLIC SALE</span>
              <p className="text-[20px] text-[#949494]">
                Stability Platform Native Token
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-end  gap-[50px]">
                <div className="flex flex-col items-start  w-[120px]">
                  <span className="text-[15px] font-light">Sale price</span>
                  <div className="flex items-center justify-start gap-2">
                    <img
                      className="w-[24px] h-[24px] rounded-full"
                      src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                      alt="USDC.e"
                    />
                    <span className="text-[28px] font-bold">
                      {saleData.price}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Sold</span>
                  <p className="text-[28px] font-bold">
                    {formatNumber(+saleData.sold, "format")} / 4M{" "}
                    <span className="text-[#A995FF]">STBL</span>
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Total Raised</span>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      className="w-[24px] h-[24px] rounded-full"
                      src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                      alt="USDC.e"
                    />
                    <p className="text-[28px] font-bold">{saleData.raised}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-[50px]">
                <div className="flex flex-col items-start w-[120px]">
                  <span className="text-[15px] font-light">TGE price</span>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      className="w-[24px] h-[24px] rounded-full"
                      src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                      alt="USDC.e"
                    />
                    <span className="text-[28px] font-bold">0.18</span>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Total Supply</span>
                  <p className="text-[28px] font-bold">
                    100M <span className="text-[#A995FF]">STBL</span>
                  </p>
                </div>
                {/*<div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Total Raised</span>
                  <div className="flex items-center justify-center gap-2">
                    <img src="/sonic.png" alt="Sonic"/>
                    <p className="text-[28px] font-bold">1,000,000</p>
                  </div>
                </div>*/}
              </div>
            </div>
          </div>
          <img
            className="rounded-full w-[200px] h-[200px]"
            src="/STBL_plain.png"
            alt="STBL"
          />
        </div>
      </div>

      <br />

      <div className="flex w-full justify-between">
        <div className="flex bg-accent-900 flex-col p-[20px]">
          <div className="flex">
            <span className="w-[200px]">Sale start</span>
            <span>{new Date(saleData.start * 1000).toLocaleString()}</span>
          </div>
          <div className="flex">
            <span className="w-[200px]">Sale end</span>
            <span>{new Date(saleData.end * 1000).toLocaleString()}</span>
          </div>
          <div className="flex">
            <span className="w-[200px]">TGE</span>
            <span>{new Date(saleData.tge * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center">
          <Timer start={saleData.start} end={saleData.end} />
        </div>

        <div className="flex bg-accent-900 items-center p-[20px]">
          <div className="flex">
            <span className="w-[200px]">You Bought</span>
            <span>{formatNumber(saleData.bought, "format")}</span>
          </div>
        </div>
      </div>
      <br />
      <div className="bg-accent-950 w-[400px] h-[200px] rounded-2xl">
        <div className="px-5 py-3 flex flex-col justify-between h-full">
          <div>
            <label className="relative block h-[40px] w-full md:w-[345px]">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <img
                  src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                  alt="USDC"
                  title="USDC"
                  className="w-4 h-4 text-neutral-500 rounded-full"
                />
              </span>

              <input
                list="amount"
                ref={input}
                name="amount"
                placeholder="0"
                value={inputValue}
                onChange={() => handleInputChange()}
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                inputMode="decimal"
                autoComplete="off"
                className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[36px] my-[2px] pl-10"
              />

              {!!$connected && !!balance && (
                <button
                  type="button"
                  onClick={() => handleInputChange("max")}
                  className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
                >
                  Max
                </button>
              )}
            </label>
            <div className="flex flex-col items-start gap-2 mt-2">
              <div
                className={`text-[14px] leading-3 text-neutral-500 flex items-center gap-1 marker:${
                  !!balance ? "" : "opacity-0"
                }`}
              >
                <span>USDC Balance: </span>
                <span>{!!balance ? balance : "0"}</span>
              </div>
              <div
                className={`text-[14px] leading-3 text-neutral-500 flex items-center gap-1 ${
                  !!balance ? "" : "opacity-0"
                }`}
              >
                <span>Amount in USDC: </span>
                <span>
                  {!!inputValue && !!saleData.price
                    ? Number(inputValue) * Number(saleData.price)
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div>
            {$connected ? (
              <>
                {button === "buy" ? (
                  <button
                    disabled={transactionInProgress}
                    className={`w-full max-w-[425px] md:max-w-[350px] flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                      transactionInProgress || !isStarted
                        ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                        : ""
                    }`}
                    type="button"
                    onClick={buy}
                  >
                    {isStarted ? (
                      <p>{needConfirm ? "Confirm in wallet" : "Buy"}</p>
                    ) : (
                      <p>Wait for the sale to start</p>
                    )}

                    {transactionInProgress && <Loader color={"#a6a0b2"} />}
                  </button>
                ) : button === "needApprove" ? (
                  <button
                    disabled={transactionInProgress}
                    className={`w-full max-w-[425px] md:max-w-[350px] flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                      transactionInProgress
                        ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                        : ""
                    }`}
                    type="button"
                    onClick={approve}
                  >
                    <p>{needConfirm ? "Confirm in wallet" : "Approve"}</p>
                    {transactionInProgress && <Loader color={"#a6a0b2"} />}
                  </button>
                ) : button === "insufficientBalance" ? (
                  <button
                    disabled
                    className="w-full max-w-[425px] md:max-w-[350px] flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                  >
                    Insufficient Balance
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full max-w-[425px] md:max-w-[350px] flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                  >
                    Enter Amount
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className="w-full max-w-[425px] md:max-w-[350px] flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl"
                onClick={() => open()}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export { STBL };
