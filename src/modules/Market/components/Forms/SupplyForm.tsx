import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { Toggler, CustomTooltip } from "@ui";

import {
  cn,
  getTokenData,
  exactToFixed,
  getBalance,
  formatNumber,
} from "@utils";

import { account, connected, currentChainID } from "@store";

import { TOOLTIP_DESCRIPTIONS } from "../../constants";

import { web3clients } from "@web3";

import type { TMarketReserve, TAddress } from "@types";

type TProps = {
  network: string;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const SupplyForm: React.FC<TProps> = ({ network, asset, assets }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  const client = web3clients[network as keyof typeof web3clients];

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);

  const [borrowable, setBorrowable] = useState<boolean>(true);
  const [value, setValue] = useState<string>("");
  const [usdValue, setUsdValue] = useState<string>("$0");

  const [balances, setBalances] = useState<Record<TAddress, string>>({});

  // const getGasLimit = async (
  //   address: TAddress,
  //   functionName: string,
  //   params: any[]
  // ) => {
  //   try {
  //     const abi = [TransactionTypes.Wrap, TransactionTypes.Unwrap].includes(
  //       actionType
  //     )
  //       ? WrappedMetaVaultABI
  //       : IMetaVaultABI;

  //     const gas = await client.estimateContractGas({
  //       address: address,
  //       abi: abi,
  //       functionName: functionName,
  //       args: params,
  //       account: $account as TAddress,
  //     });

  //     const gasLimit = BigInt(
  //       Math.trunc(Number(gas) * Number(DEFAULT_TRANSACTION_SETTINGS.gasLimit))
  //     );

  //     if (gasLimit) {
  //       return gasLimit;
  //     }
  //   } catch (error) {
  //     console.error("Failed to get gasLimit", error);
  //   }

  //   return BigInt(10000);
  // };

  const refreshForm = () => {
    setValue("");
    setUsdValue("$0");
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

    // const balance = Number(
    //   Object.values(balances?.[actionType] || {})[0]?.balance || 0
    // );
    // const depositAllowance = Number(allowance.deposit || 0);
    // const wrapAllowance = Number(allowance.wrap || 0);

    // if (
    //   actionType === TransactionTypes.Withdraw &&
    //   value > Number(maxWithdraw)
    // ) {
    //   numericValue = String(maxWithdraw);
    // }
    // if (!value) {
    //   setButton("");
    // } else if (value > balance) {
    //   setButton("insufficientBalance");
    // } else {
    //   switch (actionType) {
    //     case TransactionTypes.Deposit:
    //       setButton(value > depositAllowance ? "Approve" : "Deposit");
    //       break;

    //     case TransactionTypes.Withdraw:
    //       setButton("Withdraw");
    //       break;

    //     case TransactionTypes.Wrap:
    //       setButton(value > wrapAllowance ? "Approve" : "Wrap");
    //       break;

    //     case TransactionTypes.Unwrap:
    //       setButton("Unwrap");
    //       break;

    //     default:
    //       setButton("");
    //       break;
    //   }
    // }

    setValue(numericValue);
    setUsdValue(`$${formattedUsdValue}`);
  };

  const handleMaxInputChange = () => {
    if ($connected) {
      const _maxBalance = exactToFixed(
        balances[asset?.address as TAddress] ?? 0,
        2
      );

      handleInputChange(_maxBalance);
    }
  };

  const initData = async () => {
    if ($connected && $account) {
      const _balances: Record<TAddress, string> = assets
        ? Object.fromEntries(
            await Promise.all(
              assets.map(async (_asset) => {
                const decimals = getTokenData(_asset.address)?.decimals ?? 18;

                const _balance = await getBalance(
                  client,
                  _asset.address,
                  $account
                );

                const formatted = formatUnits(_balance, decimals);
                return [_asset.address, formatted] as const;
              })
            )
          )
        : {};

      setBalances(_balances);
    }
  };

  useEffect(() => {
    initData();
  }, [$connected, $account, $currentChainID]);

  useEffect(() => {
    refreshForm();
  }, [asset]);

  return (
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-4 md:p-6 w-full lg:w-1/3">
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
          {/* {Object.keys(balances).length &&
                      !!activeAsset[actionType] ? (
                        <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
                          Balance:{" "}
                          {formatNumber(
                            Object.values(balances?.[actionType])[0]?.balance ||
                              0,
                            "format"
                          )}
                        </div>
                      ) : null} */}
        </label>
        <div className="flex flex-col gap-2 text-[16px] leading-6">
          <div className="flex items-center justify-between">
            <span className="text-[#7C7E81] font-medium">Wallet balance</span>
            <div className="flex items-start gap-2">
              <span className="font-semibold">
                {formatNumber(
                  balances[asset?.address as TAddress] ?? 0,
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
          <div className="flex items-center justify-between">
            <CustomTooltip
              name="Borrowable deposit"
              description={TOOLTIP_DESCRIPTIONS.borrowableDeposit}
            />
            <Toggler
              checked={borrowable}
              onChange={() => setBorrowable((prev) => !prev)}
            />
          </div>
        </div>
      </div>

      <button
        className={cn(
          "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
        )}
        type="button"
      >
        <div className="flex items-center justify-center gap-2 px-6 py-4">
          Deposit
        </div>
      </button>
      {/* <ActionButton
                           type={button}
                           network={network}
                           transactionInProgress={transactionInProgress}
                           needConfirm={needConfirm}
                           actionFunction={formHandler}
                         />  */}
    </div>
  );
};

export { SupplyForm };
