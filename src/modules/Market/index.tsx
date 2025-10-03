import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { WagmiLayout } from "@layouts";

import { SectionSelector, AssetSelector, MarketTabs } from "./components";

import { FullPageLoader, ErrorMessage } from "@ui";

import { getInitialStateFromUrl } from "./functions/getInitialStateFromUrl";

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

  const { asset, section } = getInitialStateFromUrl();

  const [localMarket, setLocalMarket] = useState<TMarket>();

  const [activeAsset, setActiveAsset] = useState<TMarketAsset | undefined>();

  const [activeSection, setActiveSection] =
    useState<MarketSectionTypes>(section);

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

      const chain = CHAINS.find(({ id }) => id == network);

      setLocalMarket({
        name: market,
        network: chain,
        assets: marketAssets as TMarketAsset[],
      } as TMarket);
    }
  }, [$markets]);

  useEffect(() => {
    if (localMarket && !activeAsset) {
      if (asset) {
        const urlAsset = localMarket?.assets.find(
          ({ address }) => asset === address
        );
        setActiveAsset(urlAsset ? urlAsset : localMarket?.assets[0]);
      } else {
        setActiveAsset(localMarket?.assets[0]);
      }
    }
  }, [localMarket]);

  return market && localMarket ? (
    <WagmiLayout>
      <div className="w-full mx-auto font-manrope pb-5">
        <div>
          <h1 className="page-title__font text-start">
            {localMarket.name} Market
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-6">
              <div className="bg-[#18191C] border border-[#232429] rounded-xl w-full">
                <div className="flex items-center px-4 pt-4 pb-[10px] md:px-0 md:py-[10px] flex-wrap gap-2">
                  <div className="flex items-center gap-3 pl-2 pr-4  border-r border-r-[#232429]">
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      Network / ID:
                    </span>
                    <div className="flex items-center gap-2">
                      <img
                        src={localMarket?.network?.logoURI}
                        alt={localMarket?.network?.name}
                        className="w-5 h-5 rounded-full"
                      />

                      <span className="text-[14px] leading-5 font-semibold">
                        {localMarket?.network?.name}
                      </span>

                      <span className="text-[12px] leading-4 font-medium bg-[#2B2C2F] border border-[#58595D] rounded px-2 py-[2px]">
                        {localMarket?.network?.id}
                      </span>
                    </div>
                  </div>
                  <a
                    className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]"
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
                    className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]"
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
                  <div className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]">
                    <span className="text-[14px] leading-5 font-medium text-[#7C7E81]">
                      Reviewed
                    </span>

                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]">
                    <span className="text-[14px] leading-5 font-medium text-[#7C7E81]">
                      Immutable & Permissionless
                    </span>

                    <img
                      src="/icons/circle_question.png"
                      alt="Question icon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]">
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
              <div className="w-full flex items-start justify-between gap-6 lg:gap-10 flex-col-reverse lg:flex-row">
                <AssetSelector
                  assets={localMarket.assets}
                  activeSection={activeSection}
                  activeAsset={activeAsset}
                  setActiveAsset={setActiveAsset}
                />
                <SectionSelector
                  market={market}
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />
              </div>
            </div>
            <MarketTabs
              network={network}
              market={market}
              section={activeSection}
              asset={activeAsset}
            />
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
