import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

type TAlmAsset = {
  symbol: string;
  amount: number;
  percent: number;
};

const UnderlyingALM: React.FC<IProps> = memo(({ vault }) => {
  const $assetsPrices = useStore(assetsPrices);

  const [almAssets, setAlmAssets] = useState<TAlmAsset[]>([]);

  useEffect(() => {
    if (!$assetsPrices) return;
    const assets = vault.assets.map((asset, index) => {
      const price = Number(formatUnits($assetsPrices[asset.address], 18));

      //@ts-ignore
      const amount = vault?.alm?.[`amountToken${index}`] || 0;

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

    setAlmAssets(assetsWithPercents);
  }, [vault]);
  return (
    <>
      <div className="flex justify-between items-center h-[60px]">
        <h2 className="text-[28px] text-start ml-4">Underlying ALM</h2>
      </div>
      <div className="flex flex-col gap-6 ml-4">
        <div className="flex items-center gap-3">
          <img
            src={`/protocols/${vault.alm.protocol}.png`}
            alt={vault.alm.protocol}
            className="rounded-full w-7 h-7"
          />
          <div className="flex flex-col">
            <span className="text-[16px]">{vault.alm.protocol}</span>
            <span className="text-[14px] text-[#8d8e96]">
              {vault.underlyingSymbol}
            </span>
          </div>
        </div>

        <div className="flex gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">TVL</span>
              <span className="text-[16px]">
                {formatNumber(vault.alm.tvl, "abbreviate")}
              </span>
            </div>
            {!!vault?.rebalances?.daily && (
              <div className="flex flex-col">
                <span className="text-[14px] text-[#8d8e96]">
                  Rebalances 24H / 7D
                </span>
                <span className="text-[16px]">
                  {vault?.rebalances?.daily} / {vault?.rebalances?.weekly}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {!!almAssets &&
              almAssets.map((almAsset) => (
                <div key={almAsset.amount} className="flex flex-col">
                  <span className="text-[14px] text-[#8d8e96]">
                    {almAsset.symbol}
                  </span>
                  <span className="text-[16px]">
                    {formatNumber(almAsset.amount, "abbreviate")} (
                    {almAsset.percent.toFixed(2)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!!vault?.alm?.positions &&
            vault.alm.positions.map((position, index) => (
              <div
                key={index}
                className="flex gap-3 border border-gray-300 rounded-lg  p-2"
              >
                <div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#8d8e96]">
                      Upper Tick
                    </span>
                    <span className="text-[16px]">{position.upperTick}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#8d8e96]">
                      Lower Tick
                    </span>
                    <span className="text-[16px]">{position.lowerTick}</span>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#8d8e96]">In Range</span>
                    <span className="text-[16px]">
                      {position.inRange ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#8d8e96]">TVL</span>
                    <span className="text-[16px]">
                      {formatNumber(position.tvl, "abbreviate")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
});

export { UnderlyingALM };
