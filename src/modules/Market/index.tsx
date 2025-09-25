import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { WagmiLayout } from "@layouts";

import { SectionSelector, AssetSelector } from "./components";

import { FullPageLoader, ErrorMessage } from "@ui";

import { CHAINS } from "@constants";

import { markets, error } from "@store";

import { MarketSectionTypes, TMarket, TMarketAsset } from "@types";

interface IProps {
  network: string;
  market: string;
}

const Market: React.FC<IProps> = ({ network, market }) => {
  const $markets = useStore(markets);
  const $error = useStore(error);

  const chain = CHAINS.find(({ id }) => id == network);

  const [localMarket, setLocalMarket] = useState<TMarket>();

  const [activeAsset, setActiveAsset] = useState<TMarketAsset | undefined>();

  const [activeSection, setActiveSection] = useState<MarketSectionTypes>(
    MarketSectionTypes.Deposit
  );

  useEffect(() => {
    if ($markets && market) {
      const marketAssets = Object.entries($markets[network][market])
        .map(([address, data]) => ({
          address,
          ...data,
        }))
        .sort(
          (a: TMarketAsset, b: TMarketAsset) =>
            Number(b.supplyTVL) - Number(a.supplyTVL)
        );

      setLocalMarket({
        name: market,
        assets: marketAssets as TMarketAsset[],
      } as TMarket);
    }
  }, [$markets]);

  useEffect(() => {
    if (localMarket && !activeAsset) {
      setActiveAsset(localMarket?.assets[0]);
    }
  }, [localMarket]);

  return market && localMarket ? (
    <WagmiLayout>
      <div className="w-full mx-auto font-manrope">
        <div>
          <div className="flex flex-col items-start gap-6">
            <h1 className="page-title__font">{localMarket.name} Market</h1>
            <div className="bg-[#18191C] border border-[#232429] rounded-xl w-full">
              <div className="flex items-center py-[10px]">
                <div className="flex items-center gap-3 px-4 border-r border-r-[#232429]">
                  <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                    Network / ID:
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={chain?.logoURI}
                      alt={chain?.name}
                      className="w-5 h-5 rounded-full"
                    />

                    <span className="text-[14px] leading-5 font-semibold">
                      {chain?.name}
                    </span>

                    <span className="text-[12px] leading-4 font-medium bg-[#2B2C2F] border border-[#58595D] rounded px-2 py-[2px]">
                      {chain?.id}
                    </span>
                  </div>
                </div>
                <a
                  className="flex items-center gap-2 px-4 border-r border-r-[#232429]"
                  href="#"
                >
                  <span className="text-[14px] leading-5 font-medium text-[#9180F4]">
                    Risk report
                  </span>

                  <img
                    src="/icons/purple_link.png"
                    alt="Check risk report"
                    className="w-4 h-4"
                  />
                </a>
                <a
                  className="flex items-center gap-2 px-4 border-r border-r-[#232429]"
                  href="#"
                >
                  <span className="text-[14px] leading-5 font-medium text-[#9180F4]">
                    0x78...Deea
                  </span>

                  <img
                    src="/icons/purple_link.png"
                    alt="address"
                    className="w-4 h-4"
                  />
                </a>
                <div className="flex items-center gap-2 px-4 border-r border-r-[#232429]">
                  <span className="text-[14px] leading-5 font-medium text-[#7C7E81]">
                    Reviewed
                  </span>

                  <img
                    src="/icons/circle_question.png"
                    alt="Question icon"
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 border-r border-r-[#232429]">
                  <span className="text-[14px] leading-5 font-medium text-[#7C7E81]">
                    Immutable & Permissionless
                  </span>

                  <img
                    src="/icons/circle_question.png"
                    alt="Question icon"
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 border-r border-r-[#232429]">
                  <span className="text-[14px] leading-5 font-medium text-[#7C7E81]">
                    Isolated risk
                  </span>

                  <img
                    src="/icons/circle_question.png"
                    alt="Question icon"
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between gap-10">
              <AssetSelector
                assets={localMarket.assets}
                activeAsset={activeAsset}
                setActiveAsset={setActiveAsset}
              />
              <SectionSelector
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            </div>
          </div>
        </div>
      </div>
    </WagmiLayout>
  ) : (
    <div>
      <ErrorMessage type={$error.type} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <FullPageLoader />
      </div>
    </div>
  );
};
export { Market };
