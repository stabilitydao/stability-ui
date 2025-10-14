import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { ActionButton } from "@ui";

import {
  cn,
  getTokenData,
  exactToFixed,
  getBalance,
  formatNumber,
  getAllowance,
  getTransactionReceipt,
  setLocalStoreHash,
} from "@utils";

import { getGasLimit } from "../../functions/getGasLimit";

import { account, connected, currentChainID, lastTx } from "@store";

import { web3clients, wagmiConfig, AavePoolABI, ERC20ABI } from "@web3";

import type { TMarketReserve, TMarket, TAddress } from "@types";

import type { Abi } from "viem";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

type TReserveData = {
  balance: string;
  allowance: string;
};

type TReservesData = Record<TAddress, TReserveData>;

const SupplyForm: React.FC<TProps> = ({ network, market, asset, assets }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  const client = web3clients[network as keyof typeof web3clients];

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);
  const $lastTx = useStore(lastTx);

  const [value, setValue] = useState<string>("");
  const [usdValue, setUsdValue] = useState<string>("$0");
  const [button, setButton] = useState<string>("");
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const [needConfirm, setNeedConfirm] = useState<boolean>(false);

  const [reservesData, setReservesData] = useState<TReservesData>({});

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

    const formattedUsdValue = !!_usdValue
      ? formatNumber(
          value * tokenPrice,
          _usdValue > 1 ? "abbreviate" : "smallNumbers"
        )
      : "0";

    const balance = Number(
      reservesData?.[asset?.address as TAddress]?.balance ?? 0
    );

    const allowance = Number(
      reservesData[asset?.address as TAddress]?.allowance ?? 0
    );

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
    setUsdValue(`$${formattedUsdValue}`);
  };

  const handleMaxInputChange = () => {
    if ($connected) {
      const _maxBalance = exactToFixed(
        reservesData?.[asset?.address as TAddress]?.balance ?? 0,
        2
      );

      handleInputChange(_maxBalance);
    }
  };

  const updateAllowance = async (minRequired?: number) => {
    if (!assetData?.address || !$account) return;

    const rawAllowance = await getAllowance(
      client,
      assetData.address,
      $account,
      market.pool
    );

    const allowance = Number(
      formatUnits(rawAllowance, assetData.decimals ?? 18)
    );

    setReservesData((prev) => ({
      ...prev,
      [assetData.address]: {
        ...prev[assetData.address],
        allowance,
      },
    }));

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

      const approveSum = parseUnits(String(amount), assetData?.decimals ?? 18);

      const params: [TAddress, bigint] = [market.pool, approveSum];

      const gasLimit = await getGasLimit(
        client,
        assetData?.address as TAddress,
        ERC20ABI,
        "approve",
        params,
        $account
      );

      const tx = await writeContract(wagmiConfig, {
        address: assetData?.address as TAddress,
        abi: ERC20ABI,
        functionName: "approve",
        args: params,
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const receipt = await getTransactionReceipt(tx);

      if (receipt?.status === "success") {
        lastTx.set(receipt?.transactionHash);
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

      const supplySum = parseUnits(String(amount), assetData?.decimals ?? 18);

      const params = [assetData?.address, supplySum, $account, 0];

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

  const initData = async () => {
    if ($connected && $account && assets?.length) {
      const _reservesData: TReservesData = Object.fromEntries(
        await Promise.all(
          assets.map(async (_asset) => {
            const address = _asset.address as TAddress;
            const decimals = getTokenData(address)?.decimals ?? 18;

            const [_balanceRaw, _allowanceRaw] = await Promise.all([
              getBalance(client, address, $account),
              getAllowance(client, address, $account, market.pool),
            ]);

            const balance = formatUnits(_balanceRaw, decimals);
            const allowance = formatUnits(_allowanceRaw, decimals);

            return [address, { balance, allowance }] as const;
          })
        )
      );

      setReservesData(_reservesData);
    }
  };

  useEffect(() => {
    refreshForm();
  }, [asset]);

  useEffect(() => {
    initData();
  }, [$connected, $account, $currentChainID, $lastTx]);

  return (
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 w-full lg:w-1/3 md:min-w-[350px]">
      <div className="flex flex-col gap-4">
        <span className="font-semibold text-[20px] leading-7">
          Supply {assetData?.symbol}
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
            <span className="font-semibold">
              {formatNumber(
                reservesData[asset?.address as TAddress]?.balance ?? 0,
                "format"
              )}{" "}
              {assetData?.symbol}
            </span>
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
        network={network}
        transactionInProgress={transactionInProgress}
        needConfirm={needConfirm}
        actionFunction={formHandler}
      />
    </div>
  );
};

export { SupplyForm };
