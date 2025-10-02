import { getTokenData } from "@utils";

import type { TMarketAsset, TAddress } from "@types";

type TProps = {
  asset: TMarketAsset | undefined;
};

const InformationTab: React.FC<TProps> = ({ asset }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start flex-col lg:flex-row gap-6 w-full">
        <div className="flex flex-col gap-3 w-full lg:w-1/2">
          <div className="flex items-center gap-3 text-[24px] leading-8 font-medium">
            <span>{assetData?.symbol}</span>
            <span className="text-[#7C7E81]">{assetData?.name}</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-center gap-4 md:gap-6 w-full font-medium">
              <div className="w-1/2 flex flex-col items-start">
                <span className="text-[#7C7E81] text-[14px] leading-5">
                  Supply APR
                </span>
                <span className="text-[32px] leading-10">4.7%</span>
              </div>
              <div className="w-1/2 flex flex-col items-start">
                <span className="text-[#7C7E81] text-[14px] leading-5">
                  Borrow APR
                </span>
                <span className="text-[32px] leading-10">6.2%</span>
              </div>
            </div>
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col md:flex-row gap-2 md:gap-6 w-full font-medium">
              <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Utilization</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>IRM</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">Dynamic IRM</span>
                </div>
                <div className="flex items-start justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Available to borrow</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">97%</span>
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      $26.8m
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>{assetData?.symbol} TVL</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">
                      122.4m {assetData?.symbol}
                    </span>
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      $39.8m
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Oracle</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">Red Stone</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Max LTV</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">95%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Liquidation threshold</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">97%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Liquidation fee</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">2.5%</span>
                </div>
              </div>
            </div>
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col items-start gap-2 w-full font-medium text-[16px] leading-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-[#7C7E81]">
                  {assetData?.symbol} address
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#9180F4]">0xE5DA...3955</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/purple_link.png"
                      alt="external link"
                      className="w-3 h-3 cursor-pointer"
                    />
                    <img
                      src="/icons/copy.png"
                      alt="copy link"
                      className="w-3 h-3 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-[#7C7E81]">Silo address</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#9180F4]">0xE5DA...3955</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/purple_link.png"
                      alt="external link"
                      className="w-3 h-3 cursor-pointer"
                    />
                    <img
                      src="/icons/copy.png"
                      alt="copy link"
                      className="w-3 h-3 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-1/2">
          <div className="flex items-center gap-3 text-[24px] leading-8 font-medium">
            <span>S</span>
            <span className="text-[#7C7E81]">Sonic</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-center gap-4 md:gap-6 w-full font-medium">
              <div className="w-1/2 flex flex-col items-start">
                <span className="text-[#7C7E81] text-[14px] leading-5">
                  Supply APR
                </span>
                <span className="text-[32px] leading-10">4.7%</span>
              </div>
              <div className="w-1/2 flex flex-col items-start">
                <span className="text-[#7C7E81] text-[14px] leading-5">
                  Borrow APR
                </span>
                <span className="text-[32px] leading-10">6.2%</span>
              </div>
            </div>
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col md:flex-row gap-2 md:gap-6 w-full font-medium">
              <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Utilization</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>IRM</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">Dynamic IRM</span>
                </div>
                <div className="flex items-start justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Available to borrow</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">97%</span>
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      $26.8m
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>{assetData?.symbol} TVL</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">
                      122.4m {assetData?.symbol}
                    </span>
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      $39.8m
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Oracle</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">Red Stone</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Max LTV</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">95%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Liquidation threshold</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">97%</span>
                </div>
                <div className="flex items-center justify-between text-[16px] leading-6 w-full">
                  <div className="text-[#7C7E81] flex items-center gap-2 font-medium">
                    <span>Liquidation fee</span>
                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold">2.5%</span>
                </div>
              </div>
            </div>
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col items-start gap-2 w-full font-medium text-[16px] leading-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-[#7C7E81]">
                  {assetData?.symbol} address
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#9180F4]">0xE5DA...3955</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/purple_link.png"
                      alt="external link"
                      className="w-3 h-3 cursor-pointer"
                    />
                    <img
                      src="/icons/copy.png"
                      alt="copy link"
                      className="w-3 h-3 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-[#7C7E81]">Silo address</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#9180F4]">0xE5DA...3955</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/purple_link.png"
                      alt="external link"
                      className="w-3 h-3 cursor-pointer"
                    />
                    <img
                      src="/icons/copy.png"
                      alt="copy link"
                      className="w-3 h-3 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-[24px] leading-8 font-medium">
          Overall details
        </span>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-[#7C7E81]">Market ID</span>
            <span className="font-semibold">3</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <span className="text-[#7C7E81]">Market address</span>
            <div className="flex items-center gap-3">
              <span className="text-[#9180F4]">0xE5DA...3955</span>
              <div className="flex items-center gap-2">
                <img
                  src="/icons/purple_link.png"
                  alt="external link"
                  className="w-3 h-3 cursor-pointer"
                />
                <img
                  src="/icons/copy.png"
                  alt="copy link"
                  className="w-3 h-3 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Reviewed</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">Yes</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Deployed</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">January 9, 2025</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <span className="text-[#7C7E81]">Deployer address</span>
            <div className="flex items-center gap-3">
              <span className="text-[#9180F4]">0xE5DA...3955</span>
              <div className="flex items-center gap-2">
                <img
                  src="/icons/purple_link.png"
                  alt="external link"
                  className="w-3 h-3 cursor-pointer"
                />
                <img
                  src="/icons/copy.png"
                  alt="copy link"
                  className="w-3 h-3 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Protocol fee</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">15%</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-[#7C7E81] flex items-center gap-2">
              <span>Deployer fee</span>
              <img
                src="/icons/circle_question.png"
                alt="Question icon"
                className="w-4 h-4"
              />
            </div>
            <span className="font-semibold">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InformationTab };
