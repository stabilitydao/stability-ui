import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { HeadingText } from "@ui";

import { DEXes } from "@constants";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import type { TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

type TPoolAsset = {
  symbol: string;
  amount: number;
  percent: number;
};

const LiquidityPool: React.FC<IProps> = memo(({ network, vault }) => {
  const $assetsPrices = useStore(assetsPrices);

  const [poolAssets, setPoolAssets] = useState<TPoolAsset[]>([]);

  const poolSymbol =
    vault.assets.length > 1
      ? `${vault.assets[0].symbol}-${vault.assets[1].symbol}`
      : vault.assets[0].symbol;

  const dexPool = DEXes.find((dex) =>
    vault.strategyInfo?.protocols.some((protocol) => protocol.name === dex.name)
  );

  const protocol =
    vault.strategyInfo.protocols.length > 1
      ? vault.strategyInfo.protocols[1]
      : vault.strategyInfo.protocols[0];

  useEffect(() => {
    if (!$assetsPrices[network]) return;
    const assets = vault.assets.map((asset, index) => {
      const price = Number($assetsPrices[network][asset.address].price);

      //@ts-ignore
      const amount = vault?.pool?.[`amountToken${index}`] || 0;

      const amountInUSD = price * amount;

      return { symbol: asset.symbol, amountInUSD: amountInUSD, amount: amount };
    });

    const vaultLiquidity = assets.reduce(
      (acc, curr) => (acc += curr.amountInUSD),
      0
    );

    const assetsWithPercents = assets.map((asset) => {
      return { ...asset, percent: (asset.amountInUSD / vaultLiquidity) * 100 };
    });

    setPoolAssets(assetsWithPercents);
  }, [vault, $assetsPrices]);
  return (
    <>
      <HeadingText
        text="Liquidity Pool"
        scale={2}
        styles="text-left md:ml-4 md:mb-0 mb-2"
      />
      <div className="flex flex-col gap-6 md:ml-4">
        <div className="flex items-center gap-3">
          <img
            data-testid="poolLogo"
            src={protocol.logoSrc}
            alt={protocol.name}
            className="rounded-full w-7 h-7"
          />
          <div className="flex flex-col">
            <span data-testid="poolName" className="text-[16px]">
              {protocol.name}
            </span>
            <span
              data-testid="poolSymbol"
              className="text-[14px] text-[#8d8e96]"
            >
              {poolSymbol}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-10 flex-wrap">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">TVL</span>
              <span data-testid="poolTVL" className="text-[16px]">
                {formatNumber(Number(vault.pool.tvl), "abbreviate")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">FEE</span>
              <span data-testid="poolFee" className="text-[16px]">
                {vault.pool.fee}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {!!poolAssets &&
              poolAssets.map((poolAsset, index: number) => (
                <div key={poolAsset.amount} className="flex flex-col">
                  <span className="text-[14px] text-[#8d8e96]">
                    {poolAsset.symbol}
                  </span>
                  <span
                    data-testid={`poolAsset${index}`}
                    className="text-[16px]"
                  >
                    {formatNumber(poolAsset.amount, "format")} (
                    {poolAsset.percent.toFixed(2)}%)
                  </span>
                </div>
              ))}
          </div>

          {!!dexPool && (
            <div>
              <div className="flex flex-col">
                <span className="text-[14px] text-[#8d8e96]">ALGO</span>
                <span className="text-[16px]">{dexPool.algo}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export { LiquidityPool };
