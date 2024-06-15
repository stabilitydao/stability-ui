import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

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

  const poolSymbol = useMemo(() => {
    if (vault && vault.assets) {
      if (vault.assets.length > 1) {
        return `${vault.assets[0].symbol}-${vault.assets[1].symbol}`;
      } else {
        return vault.assets[0].symbol;
      }
    }
  }, [vault]);

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
  const dexPool = useMemo(() => {
    return DEXes.find((dex) =>
      vault.strategyInfo.protocols.some(
        (protocol) => protocol.name === dex.name
      )
    );
  }, [vault.strategyInfo.protocols]);
  return (
    <>
      <div className="flex justify-between items-center h-[60px]">
        <h2 className="text-[28px] text-start ml-4">Liquidity pool</h2>
      </div>
      <div className="flex flex-col gap-6 ml-4">
        <div className="flex items-center gap-3">
          <img
            src={vault.strategyInfo.protocols[1].logoSrc}
            alt={vault.strategyInfo.protocols[1].name}
            className="rounded-full w-7 h-7"
          />
          <div className="flex flex-col">
            <span className="text-[16px]">
              {vault.strategyInfo.protocols[1].name}
            </span>
            <span className="text-[14px] text-[#8d8e96]">{poolSymbol}</span>
          </div>
        </div>

        <div className="flex items-start gap-10 flex-wrap">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">TVL</span>
              <span className="text-[16px]">
                {formatNumber(vault.pool.tvl, "abbreviate")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">FEE</span>
              <span className="text-[16px]">{vault.pool.fee}%</span>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {!!poolAssets &&
              poolAssets.map((poolAsset) => (
                <div key={poolAsset.amount} className="flex flex-col">
                  <span className="text-[14px] text-[#8d8e96]">
                    {poolAsset.symbol}
                  </span>
                  <span className="text-[16px]">
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
