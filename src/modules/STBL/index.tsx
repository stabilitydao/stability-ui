import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { writeContract } from "@wagmi/core";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { connected, account } from "@store";

import { Loader, Skeleton } from "@ui";

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
    <div className="min-w-full lg:min-w-[1000px] xl:min-w-[1200px] max-w-[1400px] font-manrope">
      <div className="STBL mb-5">
        <div className="flex justify-between items-center gap-1 xl:gap-0 h-full md:h-[400px] py-10 px-[50px] xl:pl-[50px] xl:pr-[80px]">
          <div className="flex flex-col items-start justify-between h-full gap-5 md:gap-0">
            <div>
              <span className="text-[40px] sm:text-[55px] leading-10">
                PUBLIC SALE
              </span>
              <p className="text-[18px] sm:text-[20px] text-[#949494]">
                Stability Platform Native Token
              </p>
              <Timer start={saleData.start} end={saleData.end} />
            </div>
            <img
              className="rounded-full w-[100px] h-[100px] md:hidden block self-center"
              src="/STBL_plain.png"
              alt="STBL"
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-end md:flex-nowrap flex-wrap gap-5 md:gap-[50px]">
                <div className="flex flex-col items-start md:w-[120px]">
                  <span className="text-[15px] font-light">Sale price</span>
                  {saleData.price !== "-" ? (
                    <div className="flex items-center justify-start gap-2">
                      <img
                        className="w-[24px] h-[24px] rounded-full"
                        src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                        alt="USDC.e"
                      />
                      <span className="text-[20px] min-[850px]:text-[28px] font-bold">
                        {saleData.price}
                      </span>
                    </div>
                  ) : (
                    <Skeleton width={100} height={45} />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Sold</span>
                  {saleData.sold !== "-" ? (
                    <p className="text-[20px] min-[850px]:text-[28px] font-bold">
                      4M / 4M <span className="text-[#A995FF]">STBL</span>
                    </p>
                  ) : (
                    <Skeleton width={157} height={45} />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Total Raised</span>

                  <div className="flex items-center justify-center gap-2">
                    <img
                      className="w-[24px] h-[24px] rounded-full"
                      src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                      alt="USDC.e"
                    />
                    <p className="text-[20px] min-[850px]:text-[28px] font-bold">
                      500K
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end md:flex-nowrap flex-wrap gap-5 md:gap-[50px]">
                <div className="flex flex-col items-start md:w-[120px]">
                  <span className="text-[15px] font-light">TGE price</span>
                  {!!saleData.tge ? (
                    <div className="flex items-center justify-center gap-2">
                      <img
                        className="w-[24px] h-[24px] rounded-full"
                        src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
                        alt="USDC.e"
                      />
                      <span className="text-[20px] min-[850px]:text-[28px] font-bold">
                        0.18
                      </span>
                    </div>
                  ) : (
                    <Skeleton width={85} height={45} />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-light">Total Supply</span>
                  <p className="text-[20px] min-[850px]:text-[28px] font-bold">
                    100M <span className="text-[#A995FF]">STBL</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <img
            className="rounded-full hidden md:block w-[140px] h-[140px] min-[850px]:w-[200px] min-[850px]:h-[200px]"
            src="/STBL_plain.png"
            alt="STBL"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 w-full flex-col md:flex-row md:h-[250px]">
        <div className="flex bg-accent-950 flex-col rounded-2xl p-5 w-full md:w-1/2 h-[220px] sm:h-[250px] md:h-full">
          <div className="flex flex-col items-start">
            <span className="text-[15px] font-light">Sale start</span>
            {!!saleData.start ? (
              <p className="text-[20] sm:text-[24px]">
                {new Date(saleData.start * 1000).toLocaleString()}
              </p>
            ) : (
              <Skeleton height={40} />
            )}
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[15px] font-light">Sale end</span>
            {!!saleData.end ? (
              <p className="text-[20] sm:text-[24px]">
                {new Date(saleData.end * 1000).toLocaleString()}
              </p>
            ) : (
              <Skeleton height={40} />
            )}
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[15px] font-light">TGE</span>
            {!!saleData.tge ? (
              <p className="text-[20] sm:text-[24px]">
                {new Date(saleData.tge * 1000).toLocaleDateString()}
              </p>
            ) : (
              <Skeleton height={40} />
            )}
          </div>
        </div>

        <div className="bg-accent-950 rounded-2xl w-full md:w-1/2 h-[300px] md:h-full">
          <div className="px-5 py-3 flex flex-col justify-between h-full">
            <h5 className="flex items-center justify-center h-full text-[24px]">
              Public sale complete. Tokens SOLD.
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};
export { STBL };
