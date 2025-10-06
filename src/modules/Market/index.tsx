import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { WagmiLayout } from "@layouts";

import { SectionSelector, AssetSelector, MarketTabs } from "./components";

import { FullPageLoader, ErrorMessage, CustomTooltip } from "@ui";

import { getInitialStateFromUrl } from "./functions/getInitialStateFromUrl";

import { updateQueryParams, getShortAddress } from "@utils";

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

  const handleAssetChange = (asset: TMarketAsset) => {
    if (asset.asset === localMarket.assets[0].asset) {
      updateQueryParams({ asset: null });
    } else {
      updateQueryParams({ asset: asset.asset });
    }

    setActiveAsset(asset);
  };

  const handleSectionChange = (section: MarketSectionTypes) => {
    if (section === MarketSectionTypes.Deposit) {
      updateQueryParams({ section: null });
    } else {
      updateQueryParams({ section });
    }

    // temp
    if (section === MarketSectionTypes.Borrow && !activeAsset?.isBorrowable) {
      const borrowableAssets = localMarket?.assets.filter(
        ({ isBorrowable }) => isBorrowable
      );
      handleAssetChange(borrowableAssets[0]);
    }

    setActiveSection(section);
  };

  useEffect(() => {
    if ($markets && market) {
      const _market = $markets[network].find(
        ({ marketId }) => marketId === market
      );

      const marketAssets = _market?.reserves.sort(
        (a: TMarketAsset, b: TMarketAsset) =>
          Number(b.supplyTVL) - Number(a.supplyTVL)
      );

      const chain = CHAINS.find(({ id }) => id == network);

      setLocalMarket({
        name: market,
        network: chain,
        engine: _market.engine,
        pool: _market.pool,
        protocolDataProvider: _market.protocolDataProvider,
        deployed: _market.deployed,
        assets: marketAssets as TMarketAsset[],
      } as TMarket);
    }
  }, [$markets]);

  useEffect(() => {
    if (localMarket && !activeAsset) {
      if (asset) {
        const urlAsset = localMarket?.assets.find((_) => asset === _.asset);
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
          <h1 className="page-title__font text-start">{localMarket.name}</h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-6">
              <div className="bg-[#18191C] border border-[#232429] rounded-xl w-full">
                <div className="flex items-center px-4 pt-4 pb-[10px] md:px-0 md:py-[10px] flex-wrap gap-2">
                  <div className="flex items-center gap-3 pl-2 pr-4  border-r border-r-[#232429]">
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      Chain:
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
                    href={`${localMarket?.network?.explorer}${localMarket?.pool}`}
                    target="_blank"
                  >
                    <span className="text-[14px] leading-5 font-medium text-[#9180F4]">
                      Pool: {getShortAddress(localMarket?.pool ?? "", 6, 4)}
                    </span>
                    <img
                      src="/icons/purple_link.png"
                      alt="address"
                      className="w-4 h-4"
                    />
                  </a>
                  <div className="pl-2 pr-4 border-r border-r-[#232429]">
                    <CustomTooltip
                      name="Isolated risk"
                      description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus necessitatibus cumque sit obcaecati mollitia voluptas nostrum fugit, dignissimos rem ut veritatis assumenda hic? Ratione odio, numquam nihil incidunt suscipit rerum.
                  Soluta sit repudiandae aut corporis vel obcaecati aperiam necessitatibus dicta, dolore recusandae, eligendi iure quidem nisi ex quis accusamus sunt. Eligendi atque laborum enim dolore totam voluptatum ipsam ab minima?"
                      isMediumText={true}
                    />
                  </div>
                  <div className="pl-2 pr-4 border-r border-r-[#232429]">
                    <CustomTooltip
                      name={`Engine: ${localMarket?.engine}`}
                      description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus necessitatibus cumque sit obcaecati mollitia voluptas nostrum fugit, dignissimos rem ut veritatis assumenda hic? Ratione odio, numquam nihil incidunt suscipit rerum.
                  Soluta sit repudiandae aut corporis vel obcaecati aperiam necessitatibus dicta, dolore recusandae, eligendi iure quidem nisi ex quis accusamus sunt. Eligendi atque laborum enim dolore totam voluptatum ipsam ab minima?"
                      isMediumText={true}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex items-start justify-between gap-6 lg:gap-10 flex-col-reverse lg:flex-row">
                <AssetSelector
                  assets={localMarket.assets}
                  activeSection={activeSection}
                  activeAsset={activeAsset}
                  handleAssetChange={handleAssetChange}
                />
                <SectionSelector
                  market={market}
                  activeSection={activeSection}
                  handleSectionChange={handleSectionChange}
                />
              </div>
            </div>
            <MarketTabs
              network={network}
              market={market}
              marketData={localMarket}
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
