import { Toggler } from "@ui";

import { cn, getTokenData } from "@utils";

import type { TMarketAsset, TAddress } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const DepositForm: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-6 w-1/3">
      <div className="flex flex-col gap-4">
        <span className="font-semibold text-[20px] leading-7">
          Deposit {assetData?.symbol}
        </span>

        <label className="bg-[#18191C] p-4 rounded-lg block border border-[#232429]">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              value="100"
              // value={value}
              //onChange={handleInputChange}
              className="bg-transparent text-2xl font-medium outline-none w-full"
            />
          </div>
          <div className="text-[#7C7E81] font-medium text-[14px] leading-5">
            $32.84
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
              <span className="font-semibold">8,941 {assetData?.symbol}</span>
              <button className="py-1 px-2 text-[#7C7E81] text-[12px] leading-4 font-medium bg-[#18191C] border border-[#35363B] rounded-lg">
                Max
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[#7C7E81] font-medium flex items-center gap-2">
              <span>Borrowable deposit</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <Toggler checked={true} onChange={() => console.log(1)} />
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

export { DepositForm };
