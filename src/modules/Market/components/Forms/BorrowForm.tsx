import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { ActionButton, Skeleton } from "@ui";

import {
  cn,
  getTokenData,
  exactToFixed,
  formatNumber,
  getTransactionReceipt,
  setLocalStoreHash,
} from "@utils";

import { convertToUSD, getGasLimit } from "../../functions";

import { account, connected, lastTx } from "@store";

import { web3clients, wagmiConfig, AavePoolABI } from "@web3";

import type { TMarketReserve, TMarket, TAddress } from "@types";

import type { Abi } from "viem";

type TProps = {
  market: TMarket;
  asset: TMarketReserve | undefined;
  userData: Record<TAddress, string>;
  isLoading: boolean;
};

const BorrowForm: React.FC<TProps> = ({
  market,
  asset,
  userData,
  isLoading,
}) => {
  const assetData = getTokenData(asset?.address as TAddress);

  const client = web3clients[market?.network?.id as keyof typeof web3clients];

  const $connected = useStore(connected);
  const $account = useStore(account);

  const [value, setValue] = useState<string>("");
  const [usdValue, setUsdValue] = useState<string>("$0");
  const [button, setButton] = useState<string>("");
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const [needConfirm, setNeedConfirm] = useState<boolean>(false);

  // todo: add errors on ui
  const errorHandler = (err: Error) => {
    refreshForm();
    lastTx.set("No transaction hash...");
    if (err instanceof Error) {
      // const errorData = {
      //   state: true,
      //   type: err.name,
      //   description: getShortMessage(err.message),
      // };
    }
    alert("TX ERROR");
    console.error("ERROR:", err);
  };

  const refreshForm = () => {
    setValue("");
    setUsdValue("$0");
    setButton("");
    setTransactionInProgress(false);
    setNeedConfirm(false);
  };

  const handleInputChange = (inputValue: string) => {
    let numericValue = inputValue.replace(/[^0-9.]/g, "");

    numericValue = numericValue.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    const value = Number(numericValue);
    const tokenPrice = Number(asset?.price);

    const _usdValue = value * tokenPrice;

    const formattedUsdValue = !!_usdValue ? convertToUSD(_usdValue) : "$0";

    const balance = Number(userData?.[asset?.address as TAddress] ?? 0);

    if (!value) {
      setButton("");
    } else if (value > balance) {
      setButton("insufficientBalance");
    } else {
      setButton("Borrow");
    }

    setValue(numericValue);
    setUsdValue(formattedUsdValue);
  };

  const handleMaxInputChange = () => {
    if ($connected) {
      const _maxBalance = exactToFixed(
        userData?.[asset?.address as TAddress] ?? 0,
        10
      );

      handleInputChange(_maxBalance);
    }
  };

  const borrow = async () => {
    setTransactionInProgress(true);

    const amount = Number(value);

    if (!$account || !amount) return;

    try {
      setNeedConfirm(true);

      const supplySum = parseUnits(String(amount), assetData?.decimals ?? 18);

      const params = [assetData?.address, supplySum, BigInt(2), 0, $account];

      const gasLimit = await getGasLimit(
        client,
        market.pool,
        AavePoolABI as Abi,
        "borrow",
        params,
        $account as TAddress
      );

      const tx = await writeContract(wagmiConfig, {
        address: market.pool,
        abi: AavePoolABI,
        functionName: "borrow",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const receipt = await getTransactionReceipt(tx);

      let txTokens = {};

      if (assetData?.address) {
        txTokens = {
          [assetData.address]: {
            amount,
            symbol: assetData.symbol,
            logo: assetData.logoURI,
          },
        };
      }

      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: tx,
        status: receipt?.status || "reverted",
        type: "Borrow",
        vault: market.pool,
        tokens: txTokens,
      });

      if (receipt?.status === "success") {
        lastTx.set(receipt?.transactionHash);

        refreshForm();
      }
    } catch (error) {
      if (error instanceof Error) {
        errorHandler(error);
      }
    }
    setTransactionInProgress(false);
  };

  const formHandler = async () => {
    const actionsMap: Record<string, () => Promise<void>> = {
      Borrow: borrow,
    };

    const action = actionsMap[button];
    if (action) {
      await action();
    }
  };

  useEffect(() => {
    refreshForm();
  }, [asset]);

  return (
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 w-full lg:w-1/3">
      <div className="flex flex-col gap-4">
        <span className="font-semibold text-[20px] leading-7">
          Borrow {assetData?.symbol}
        </span>

        <label className="bg-[#18191C] p-4 rounded-lg block border border-[#232429]">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value={value}
              onChange={(e) => handleInputChange(e?.target?.value)}
              className="bg-transparent text-2xl font-medium outline-none w-full"
            />
          </div>
          <div className="text-[#7C7E81] font-medium text-[14px] leading-5">
            {usdValue}
          </div>
        </label>
        <div className="flex items-center justify-between gap-2 text-[16px] leading-6">
          <span className="text-[#7C7E81] font-medium">
            Available to borrow
          </span>
          <div className="flex items-start gap-2">
            {isLoading ? (
              <Skeleton height={24} width={70} />
            ) : (
              <span className="font-semibold">
                {formatNumber(
                  userData[asset?.address as TAddress] ?? 0,
                  "format"
                )}{" "}
                {assetData?.symbol}
              </span>
            )}

            <button
              className={cn(
                "py-1 px-2 text-[#7C7E81] text-[12px] leading-4 font-medium bg-[#18191C] border border-[#35363B] rounded-lg cursor-default",
                $connected && "cursor-pointer"
              )}
              onClick={handleMaxInputChange}
            >
              Max
            </button>
          </div>
        </div>
      </div>

      <ActionButton
        type={button}
        network={market?.network?.id as string}
        transactionInProgress={transactionInProgress}
        needConfirm={needConfirm}
        actionFunction={formHandler}
      />
    </div>
  );
};

export { BorrowForm };
