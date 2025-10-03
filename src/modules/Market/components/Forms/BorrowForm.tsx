import { cn, getTokenData } from "@utils";

import type { TMarketAsset, TAddress } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const BorrowForm: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

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
              value="100"
              // value={value}
              //onChange={handleInputChange}
              className="bg-transparent text-2xl font-medium outline-none w-full"
            />
          </div>
          <div className="text-[#7C7E81] font-medium text-[14px] leading-5">
            $32.84
          </div>
        </label>
        <div className="flex flex-col gap-2 text-[16px] leading-6">
          <span className="text-[#7C7E81]">Available in the market</span>
          <div className="flex flex-col">
            <span className="font-semibold">
              82,264,083 {assetData?.symbol}
            </span>
            <span className="text-[#7C7E81]">$27m</span>
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
          Borrow
        </div>
      </button>
    </div>
  );
};

export { BorrowForm };
