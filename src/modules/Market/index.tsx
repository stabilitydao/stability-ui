import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { WagmiLayout } from "@layouts";

import { FullPageLoader, ErrorMessage } from "@ui";

import { getTokenData } from "@utils";

import { markets, error } from "@store";

import { TMarket, TMarketAsset, TTokenData } from "@types";

interface IProps {
  network: string;
  market: string;
}

const Market: React.FC<IProps> = ({ network, market }) => {
  const $markets = useStore(markets);
  const $error = useStore(error);

  const [localMarket, setLocalMarket] = useState<TMarket>();

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

      setLocalMarket({ name: market, assets: marketAssets });
    }
  }, [$markets]);

  return market && localMarket ? (
    <WagmiLayout>
      <div className="w-full mx-auto font-manrope flex gap-6">
        <div>
          <div className="flex flex-col items-start gap-4 w-full lg:justify-between flex-wrap font-manrope">
            <h1 className="page-title__font">{localMarket.name} Market</h1>
            <div className="flex items-center gap-2">
              {localMarket.assets.map((asset) => {
                const assetData = getTokenData(asset.address) as TTokenData;

                return (
                  <div key={asset.address} className="flex items-center gap-2">
                    <img
                      src={assetData.logoURI}
                      alt={assetData.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{assetData.symbol}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* <div className="flex items-center justigy-center w-full flex-col xl:flex-row">
            <InfoBar network={network} vault={localVault} />

            <div className="flex flex-col gap-5 xl:hidden my-5 w-full">
              <InvestForm network={network} vault={localVault} />
              <div className="hidden lg:flex">
                <Contracts vault={localVault} network={network} />
              </div>
            </div>
          </div>
          <HistoricalRate
            network={network}
            address={vault.toLowerCase() as TAddress}
            created={Number(localVault.created)}
            vaultStrategy={localVault.strategy}
            lastHardWork={Number(localVault.lastHardWork)}
          />

          <YieldRates vault={localVault} />

          <div className="flex lg:hidden">
            <Contracts vault={localVault} network={network} />
          </div>

          <div className="flex md:flex-nowrap flex-wrap gap-6 w-full my-6">
            <div className="w-full xl:w-1/2">
              <VaultInfo network={network} vault={localVault} />
            </div>
            <div className="w-full xl:w-1/2">
              <Strategy network={network} vault={localVault} />
            </div>
          </div>
          {isLeverageLending && <LeverageLending vault={localVault} />}
          {(localVault.assets.length > 1 && localVault?.pool?.tvl) || isALM ? (
            <div className="my-6 flex flex-col gap-6 w-full">
              {localVault.assets.length > 1 && localVault?.pool?.tvl && (
                <LiquidityPool network={network} vault={localVault} />
              )}

              {isALM && <UnderlyingALM network={network} vault={localVault} />}
            </div>
          ) : null}

          <Assets
            network={network}
            assets={localVault?.assets}
            launched={localVault.launchDate}
            pricesOnCreation={localVault.assetsPricesOnCreation}
            strategy={localVault?.strategyAddress}
          />*/}
        </div>

        {/* <div className="hidden xl:flex flex-col gap-5">
          <InvestForm network={network} vault={localVault} />
          <Contracts vault={localVault} network={network} />
        </div> */}
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
