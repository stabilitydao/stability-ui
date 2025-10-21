import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { parseUnits, formatUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { ActionButton, Skeleton } from "@ui";

import {
  cn,
  exactToFixed,
  getTransactionReceipt,
  setLocalStoreHash,
  getAllowance,
  formatNumber,
} from "@utils";

import { getGasLimit, convertToUSD } from "../../functions";

import { useUserReservesData, useUserPoolData } from "../../hooks";

import { account, connected, lastTx } from "@store";

import { web3clients, wagmiConfig, AavePoolABI, ERC20ABI } from "@web3";

import type { TMarketReserve, TMarket, TAddress } from "@types";

import type { Abi } from "viem";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const SupplyForm: React.FC<TProps> = ({
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

  const handleInputChange = (inputValue: string) => {
    let numericValue = inputValue.replace(/[^0-9.]/g, "");

    numericValue = numericValue.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    const value = Number(numericValue);
    const tokenPrice = Number(activeAsset?.price);

    const _usdValue = value * tokenPrice;

    const formattedUsdValue = !!_usdValue ? convertToUSD(_usdValue) : "$0";

    const balance = Number(reserve?.supply?.balance ?? 0);

    const allowance = Number(reserve?.supply?.allowance ?? 0);

    if (!value) {
      setButton("");
    } else if (value > balance) {
      setButton("insufficientBalance");
    } else if (value > allowance) {
      setButton("Approve");
    } else {
      setButton("Supply");
    }

    setValue(numericValue);
    setUsdValue(formattedUsdValue);
  };

  const handleMaxInputChange = () => {
    if ($connected) {
      const _maxBalance = exactToFixed(reserve?.supply?.balance ?? 0, 2);

      handleInputChange(_maxBalance);
    }
  };

  const updateAllowance = async (minRequired?: number) => {
    if (!activeAsset?.assetData?.address || !$account) return;

    const rawAllowance = await getAllowance(
      client,
      activeAsset?.assetData?.address,
      $account,
      market.pool
    );

    const allowance = Number(
      formatUnits(rawAllowance, activeAsset?.assetData?.decimals ?? 18)
    );

    if (minRequired && allowance >= minRequired) {
      setButton("Supply");
    }
  };

  const approve = async () => {
    setTransactionInProgress(true);

    const amount = Number(value);

    if (!$account || !amount) return;

    try {
      setNeedConfirm(true);

      const approveSum = parseUnits(
        String(amount),
        activeAsset?.assetData?.decimals ?? 18
      );

      const params: [TAddress, bigint] = [market.pool, approveSum];

      const gasLimit = await getGasLimit(
        client,
        activeAsset?.assetData?.address as TAddress,
        ERC20ABI,
        "approve",
        params,
        $account
      );

      const tx = await writeContract(wagmiConfig, {
        address: activeAsset?.assetData?.address as TAddress,
        abi: ERC20ABI,
        functionName: "approve",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const receipt = await getTransactionReceipt(tx);

      if (receipt?.status === "success") {
        await updateAllowance(amount);
      }
    } catch (error) {
      setNeedConfirm(false);
      await updateAllowance(amount);

      if (error instanceof Error) {
        errorHandler(error);
      }
    } finally {
      setTransactionInProgress(false);
    }
  };

  const supply = async () => {
    setTransactionInProgress(true);

    const amount = Number(value);

    if (!$account || !amount) return;

    try {
      setNeedConfirm(true);

      const supplySum = parseUnits(
        String(amount),
        activeAsset?.assetData?.decimals ?? 18
      );

      const params = [activeAsset?.assetData?.address, supplySum, $account, 0];

      const gasLimit = await getGasLimit(
        client,
        market.pool,
        AavePoolABI as Abi,
        "supply",
        params,
        $account as TAddress
      );

      const tx = await writeContract(wagmiConfig, {
        address: market.pool,
        abi: AavePoolABI,
        functionName: "supply",
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
        type: "supply",
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
      Approve: approve,
      Supply: supply,
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
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 w-full lg:w-1/3 md:min-w-[350px]">
      <div className="flex flex-col gap-4">
        <span className="font-semibold text-[20px] leading-7">
          Supply {activeAsset?.assetData?.symbol}
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
          <span className="text-[#7C7E81] font-medium">Wallet balance</span>
          <div className="flex items-start gap-2">
            {isLoading ? (
              <Skeleton height={24} width={70} />
            ) : (
              <span className="font-semibold">
                {formatNumber(reserve?.supply?.balance ?? 0, "format")}{" "}
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
        network={market?.network?.id}
        transactionInProgress={transactionInProgress}
        needConfirm={needConfirm}
        actionFunction={formHandler}
      />
    </div>
  );
};

export { SupplyForm };
