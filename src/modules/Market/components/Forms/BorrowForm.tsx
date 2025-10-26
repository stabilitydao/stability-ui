import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";

import { useStore } from "@nanostores/react";

import { parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { ActionButton, Skeleton } from "@ui";

import {
  cn,
  formatNumber,
  getTransactionReceipt,
  setLocalStoreHash,
} from "@utils";

import { convertToUSD, getGasLimit } from "../../functions";

import { useUserReservesData, useUserPoolData } from "../../hooks";

import { account, connected, lastTx } from "@store";

import { web3clients, wagmiConfig, AavePoolABI } from "@web3";

import type { TMarketReserve, TMarket, TAddress } from "@types";

import type { Abi } from "viem";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const BorrowForm: React.FC<TProps> = ({
  market,
  activeAsset,
  value,
  setValue,
}) => {
  const client = web3clients[market?.network?.id as keyof typeof web3clients];

  const {
    data: userData,
    isLoading,
    refetch: refetchUserReservesData,
  } = useUserReservesData(market);

  const { refetch: refetchUserPoolData } = useUserPoolData(
    market?.network?.id as string,
    market.pool
  );

  const $connected = useStore(connected);
  const $account = useStore(account);

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

  const handleInputChange = (rawValue: string) => {
    if (!$connected) return;

    const availableBalance = Number(reserve?.borrow?.balance ?? 0);
    const tokenPrice = Number(activeAsset?.price ?? 0);

    if (Number(rawValue) > availableBalance) {
      rawValue = reserve?.borrow?.balance ?? ("0" as string); // for < 0.000 numbers
    }

    let input = rawValue.replace(/[^0-9.]/g, "");

    input = input.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (input.startsWith(".")) {
      input = "0" + input;
    }

    const value = Number(input);

    const usdValue = value * tokenPrice;
    const formattedUsdValue = !!usdValue ? convertToUSD(usdValue) : "$0";

    let nextButton: string = "";

    if (!value) {
      nextButton = "";
    } else if (value > availableBalance) {
      nextButton = "insufficientBalance";
    } else {
      nextButton = "Borrow";
    }

    setValue(input);
    setUsdValue(formattedUsdValue);
    setButton(nextButton);
  };

  const handleMaxInputChange = () => {
    if (!$connected) return;

    const availableBalance = reserve?.borrow?.balance ?? "0";

    handleInputChange(availableBalance);
  };

  const borrow = async () => {
    setTransactionInProgress(true);

    const amount = Number(value);

    if (!$account || !amount) return;

    try {
      setNeedConfirm(true);

      const borrowSum = parseUnits(
        String(amount),
        activeAsset?.assetData?.decimals ?? 18
      );

      const params = [
        activeAsset?.assetData?.address,
        borrowSum,
        BigInt(2),
        0,
        $account,
      ];

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

      if (activeAsset?.assetData?.address) {
        txTokens = {
          [activeAsset?.assetData?.address]: {
            amount,
            symbol: activeAsset?.assetData?.symbol,
            logo: activeAsset?.assetData?.logoURI,
          },
        };
      }

      setLocalStoreHash({
        chainId: market?.network?.id as string,
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

    refetchUserReservesData();
    refetchUserPoolData();
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

  const reserve = useMemo(() => {
    if (!activeAsset?.address) return undefined;
    return userData?.[activeAsset.address];
  }, [activeAsset, userData]);

  useEffect(() => {
    refreshForm();
  }, [activeAsset]);

  return (
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 w-full lg:w-1/3">
      <div className="flex flex-col gap-4">
        <span className="font-semibold text-[20px] leading-7">
          Borrow {activeAsset?.assetData?.symbol}
        </span>

        <label className="bg-[#18191C] p-4 rounded-lg block border border-[#232429]">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value={value}
              onChange={(e) => handleInputChange(e?.target?.value)}
              className="bg-transparent text-2xl font-medium outline-none w-full"
              disabled={!$connected}
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
                {formatNumber(reserve?.borrow?.balance ?? 0, "format")}{" "}
                {activeAsset?.assetData?.symbol}
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
