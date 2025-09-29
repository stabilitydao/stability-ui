import { useState } from "react";

import { Toggler } from "@ui";

import { cn, getTokenData } from "@utils";

import type { TMarketAsset, TAddress } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const LeverageForm: React.FC<TProps> = ({ asset }) => {
  const [value, setValue] = useState(1);
  const min = 1;
  const max = 25;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col gap-6 bg-[#111114] border border-[#232429] rounded-xl p-6 w-1/3">
        <div className="flex flex-col gap-4">
          <span className="font-semibold text-[20px] leading-7">
            Supply {assetData?.symbol}
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
            <div className="flex items-center justify-between">
              <span className="text-[#7C7E81] font-medium text-[14px] leading-5">
                $32.84
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#7C7E81] font-medium text-[14px] leading-5">
                  3,400 {assetData?.symbol}
                </span>
                <button className="py-1 px-2 text-[#7C7E81] text-[12px] leading-4 font-medium bg-[#18191C] border border-[#35363B] rounded-lg">
                  Max
                </button>
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[20px] leading-7">
              Leverage {assetData?.symbol}
            </span>

            <div className="flex items-center gap-3 w-full">
              <span className="font-semibold text-[20px] leading-7 w-[35px]">
                {value}x
              </span>

              <div className="relative flex-1 overflow-visible">
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={value}
                  onChange={handleChange}
                  className="w-full h-2 appearance-none bg-[#18191C] rounded-md cursor-grab slider-thumb"
                />

                <div
                  className="pointer-events-none absolute top-[35%] left-0 w-full"
                  style={{ transform: "translateY(-50%)" }}
                >
                  <div
                    className="absolute"
                    style={{
                      left: `${Math.min(((value - min) / (max - min)) * 100, 99.5)}%`,
                      transform: "translateX(-50%)",
                      transition: "left 0.15s ease-out",
                    }}
                  >
                    <img
                      src="/icons/thumb.png"
                      alt="thumb"
                      className="min-w-4 min-h-4 w-4 h-4 object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setValue(max)}
                className="py-1 px-2 text-[#7C7E81] text-[12px] leading-4 font-medium bg-[#18191C] border border-[#35363B] rounded-lg"
              >
                Max
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-[16px] leading-6">
            <div className="flex items-center justify-between w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Borrowable supply</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <Toggler checked={true} onChange={() => console.log(1)} />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Price impact</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">0.0%</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Route</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">0 DOS</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Slippage</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">0.5%</span>
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
            Supply {assetData?.symbol}
          </div>
        </button>
      </div>
      <div className="flex flex-col gap-4 w-2/3">
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-6 flex flex-col items-start justify-between gap-6 font-medium">
          <div className="flex items-start justify-between gap-6 w-full">
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                Supply/Borrow
              </span>
              <span className="text-[24px] leading-8">
                S/{assetData?.symbol}
              </span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                Total supply S APR
              </span>
              <span className="text-[24px] leading-8">3.7%</span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                Borrow {assetData?.symbol} APR
              </span>
              <span className="text-[24px] leading-8">2.0%</span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                Max Net APR
              </span>
              <span className="text-[24px] leading-8">-42.2%</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-6 w-full">
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                Available to Borrow
              </span>
              <span className="text-[24px] leading-8">$26.9M</span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                mLTV/LT
              </span>
              <span className="text-[24px] leading-8">95.0%/97.0%</span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                S oracle
              </span>
              <span className="text-[24px] leading-8">RedStone</span>
            </div>
            <div className="flex flex-col items-start w-1/4">
              <span className="text-[#7C7E81] text-[16px] leading-6">
                {assetData?.symbol} oracle
              </span>
              <span className="text-[24px] leading-8">RedStone</span>
            </div>
          </div>
        </div>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start gap-6 w-full font-medium">
          <div className="w-1/2 flex flex-col items-start gap-3">
            <div className="flex items-start justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Sum supply</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-[16px] leading-6">
                  <span className="text-[#7C7E81]">0</span>
                  <img
                    src="/icons/arrow-right.png"
                    alt="arrow right"
                    className="w-4 h-4"
                  />
                  <span>100S</span>
                </div>
                <span className="text-[#7C7E81] text-[14px] leading-5">
                  $32.84
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Borrowed</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold text-[#7C7E81]">
                0 {assetData?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Leverage Used</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">1x</span>
            </div>
          </div>
          <div className="w-1/2 flex flex-col items-start gap-3">
            <div className="flex items-start justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Net points</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-2 text-[16px] leading-6">
                  12x Sonic
                </span>

                <span className="text-[#7C7E81] text-[14px] leading-5">
                  2x STBL
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Health Factor</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold text-[#7C7E81]">--</span>
            </div>
            <div className="flex items-center justify-between text-[16px] leading-6 w-full">
              <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                <span>Net APR</span>
                <img
                  src="/icons/circle_question.png"
                  alt="Question icon"
                  className="w-4 h-4"
                />
              </div>
              <span className="font-semibold">3.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LeverageForm };
