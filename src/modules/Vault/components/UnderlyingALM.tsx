import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { readContract } from "@wagmi/core";

import { HeadingText } from "@ui";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import { wagmiConfig } from "@web3";

import type { TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

type TAlmAsset = {
  symbol: string;
  amount: number;
  percent: number;
};

const UnderlyingALM: React.FC<IProps> = memo(({ network, vault }) => {
  const $assetsPrices = useStore(assetsPrices);

  const [almAssets, setAlmAssets] = useState<TAlmAsset[]>([]);
  const [almFee, setAlmFee] = useState<string>("");

  const getAlmFee = async () => {
    let fee = "";
    switch (vault.alm.protocol) {
      case "Gamma":
        const contractFee = await readContract(wagmiConfig, {
          address: vault.underlying.address,
          abi: [
            {
              inputs: [],
              name: "fee",
              outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "fee",
        });

        if (contractFee) {
          fee = `${100 / contractFee}%`;
        }
        break;
      default:
        break;
    }
    if (fee) setAlmFee(fee);
  };

  useEffect(() => {
    getAlmFee();
    // ASSETS
    if (!$assetsPrices[network]) return;

    const assets = vault.assets.map((asset, index) => {
      const price = Number($assetsPrices[network][asset.address].price);

      //@ts-ignore
      const amount = vault?.alm?.[`amountToken${index}`] || 0;

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

    setAlmAssets(assetsWithPercents);
  }, [vault, $assetsPrices]);

  return (
    <div>
      <HeadingText text="Underlying ALM" scale={2} styles="text-left mb-4" />

      <div className="flex flex-col items-start gap-6 p-4 md:p-6 bg-[#101012] rounded-lg border border-[#23252A]">
        <div className="flex items-center gap-4">
          <img
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${vault.alm.protocol}.svg`}
            alt={vault.alm.protocol}
            className="rounded-full w-10 h-10"
          />

          <div className="flex flex-col gap-1">
            <span className="text-[16px] leading-5 font-semibold">
              {vault.alm.protocol}
            </span>
            <span className="text-[14px] leading-3  text-[#97979A]">
              {vault.underlying.symbol}
            </span>
          </div>
        </div>

        <div className="flex gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <span className="flex text-[14px] leading-5 text-[#97979A]">
                TVL
              </span>
              <span className="text-[16px]">
                {formatNumber(vault.alm.tvl, "abbreviate")}
              </span>
            </div>
            {!!vault?.rebalances?.daily && (
              <div className="flex flex-col">
                <span className="flex text-[14px] leading-5 text-[#97979A]">
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
              almAssets.map((almAsset, index: number) => (
                <div key={almAsset.amount + index} className="flex flex-col">
                  <span className="flex text-[14px] leading-5 text-[#97979A]">
                    {almAsset.symbol}
                  </span>
                  <span className="text-[16px]">
                    {formatNumber(almAsset.amount, "format")} (
                    {almAsset.percent.toFixed(2)}%)
                  </span>
                </div>
              ))}
          </div>
          {!!almFee && (
            <div className="flex flex-col">
              <span className="flex text-[14px] leading-5 text-[#97979A]">
                Fee
              </span>
              <span className="text-[16px]">{almFee}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export { UnderlyingALM };
