import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { HeadingText, FieldValue } from "@ui";

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

  const dexPool = Object.values(DEXes).find((dex) =>
    vault.strategyInfo?.protocols.some((protocol) => protocol.name === dex.name)
  );

  let protocol = { logoSrc: "", name: "" };

  if (vault?.strategy === "Curve Convex Farm") {
    protocol = vault.strategyInfo.protocols[0];
  } else {
    protocol =
      vault.strategyInfo.protocols.length > 1
        ? vault.strategyInfo.protocols[1]
        : vault.strategyInfo.protocols[0];
  }

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
      return {
        ...asset,
        percent: asset.amountInUSD
          ? (asset.amountInUSD / vaultLiquidity) * 100
          : 0,
      };
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
            <span data-testid="poolName" className="text-[18px] font-semibold">
              {protocol.name}
            </span>
            <span
              data-testid="poolSymbol"
              className="text-[12px] leading-3 text-neutral-500"
            >
              {poolSymbol}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-10 flex-wrap">
          <div className="flex flex-col gap-5">
            <FieldValue
              name="TVL"
              value={
                vault.pool.tvl
                  ? formatNumber(Number(vault.pool.tvl), "abbreviate")
                  : 0
              }
              testId="poolTVL"
            />

            {!!vault.pool.fee && (
              <FieldValue
                name="FEE"
                value={`${vault.pool.fee}%`}
                testId="poolFee"
              />
            )}
          </div>
          <div className="flex flex-col gap-5">
            {!!poolAssets &&
              poolAssets.map((poolAsset, index: number) => (
                <div
                  key={poolAsset.amount + index}
                  data-testid="poolAsset"
                  className="h-[36px] md:h-[64px] flex flex-row items-center justify-between w-full md:justify-normal md:items-start md:flex-col"
                >
                  <div className="h-[12px] flex uppercase text-[12px] leading-3 text-neutral-500 mb-0 md:mb-0">
                    {poolAsset.symbol}
                  </div>
                  <div
                    data-testid={`poolAsset${index}`}
                    className="h-[40px] flex items-center text-[18px] font-semibold whitespace-nowrap"
                  >
                    {formatNumber(poolAsset.amount, "format")} (
                    {poolAsset.percent.toFixed(2)}%)
                  </div>
                </div>
              ))}
          </div>

          {!!dexPool?.algo && <FieldValue name="ALGO" value={dexPool?.algo} />}
        </div>
      </div>
    </>
  );
});

export { LiquidityPool };
