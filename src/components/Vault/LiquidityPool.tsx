import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import type { TVault } from "@types";
import { formatUnits } from "viem";

interface IProps {
  vault: TVault;
}

type TPoolAsset = {
  symbol: string;
  amount: number;
  percent: number;
};

const LiquidityPool: React.FC<IProps> = memo(({ vault }) => {
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
    if (!$assetsPrices) return;
    const assets = vault.assets.map((asset, index) => {
      const price = Number(formatUnits($assetsPrices[asset.address], 18));

      //@ts-ignore
      const amount = vault?.pool?.[`amountToken${index}`] || 0;

      const amountInUSD = price * amount;

      return { symbol: asset.symbol, amount: amountInUSD };
    });

    const vaultLiquidity = assets.reduce(
      (acc, curr) => (acc += curr.amount),
      0
    );

    const assetsWithPercents = assets.map((asset) => {
      return { ...asset, percent: (asset.amount / vaultLiquidity) * 100 };
    });

    setPoolAssets(assetsWithPercents);
  }, [vault]);

  return (
    <div>
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

        <div className="flex items-center gap-10">
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
                    {formatNumber(poolAsset.amount, "abbreviate")} (
                    {poolAsset.percent.toFixed(2)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export { LiquidityPool };
