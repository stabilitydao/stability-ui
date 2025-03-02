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

  const SALE_STBL = "0x4D61CB8553bB5Db02DF3bdc6CDa88AA85b32224b";

  const [balance, setBalance] = useState(0);

  const [button, setButton] = useState("");

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [isEnded, setIsEnded] = useState(false);

  const [saleData, setSaleData] = useState({
    price: "-",
    tge: 0,
    start: 0,
    end: 0,
    bought: "-",
  });

  const resetFormAfterTx = () => {
    setButton("none");
    getData();
    getBalance();
  };

  const claim = async () => {
    setTransactionInProgress(true);

    // if (!!value) {
    //   try {
    //     let parsedValue = parseUnits(String(value), 18);

    //     setNeedConfirm(true);
    //     let buy = await writeContract(wagmiConfig, {
    //       address: SALE_CONTRACT,
    //       abi: SaleABI,
    //       functionName: "buy",
    //       args: [parsedValue],
    //     });
    //     setNeedConfirm(false);
    //     setTransactionInProgress(true);

    //     const transaction = await getTransactionReceipt(buy);

    //     if (transaction.status === "success") {
    //       resetFormAfterTx();
    //     }

    //     setTransactionInProgress(false);
    //   } catch (error) {
    //     setNeedConfirm(false);
    //     console.error("Buy errror:", error);
    //   }
    // }

    setTransactionInProgress(false);
  };

  const getBalance = async () => {
    try {
      const saleSTBLBalance = await sonicClient.readContract({
        address: SALE_STBL,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      let parsedBalance = formatUnits(saleSTBLBalance, 18);

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

      const token = await sonicClient?.readContract({
        address: SALE_CONTRACT,
        abi: SaleABI,
        functionName: "token",
      });

      if ($account) {
        const userBought = (await sonicClient?.readContract({
          address: SALE_CONTRACT,
          abi: SaleABI,
          functionName: "bought",
          args: [$account as TAddress],
        })) as bigint;

        bought = formatUnits(userBought, 18);
      }

      setSaleData({
        price: formatUnits(price, 6),
        tge: Number(tge),
        start: Number(start),
        end: Number(end),
        bought,
      });

      const now = Math.floor(Date.now() / 1000);

      const _isEnded =
        Number(tge) < now &&
        token !== "0x0000000000000000000000000000000000000000";

      setIsEnded(_isEnded);
    } catch (error) {
      console.error("Get data error:", error);
    }
  };

  useEffect(() => {
    if ($account) {
      getBalance();
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
                  <p className="text-[20px] min-[850px]:text-[28px] font-bold">
                    4M / 4M <span className="text-[#A995FF]">STBL</span>
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
            {isEnded ? (
              <div className="flex items-center justify-center flex-col">
                <h3>CLAIM {balance} STBL!</h3>
              </div>
            ) : (
              <h5 className="flex items-center justify-center h-full text-[24px]">
                Public sale complete. Tokens SOLD.
              </h5>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export { STBL };
