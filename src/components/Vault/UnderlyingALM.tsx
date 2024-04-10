import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { readContract } from "@wagmi/core";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import { wagmiConfig, defiedgeFactory } from "@web3";

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
  const [almFee, setAlmFee] = useState<string>("");

  const getAlmFee = async () => {
    let fee = "";
    if (vault.alm.protocol === "Gamma") {
      const contractFee = await readContract(wagmiConfig, {
        address: vault.underlying,
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
    } else if (vault.alm.protocol === "DefiEdge") {
      const contractFee = await readContract(wagmiConfig, {
        address: defiedgeFactory,
        abi: [
          {
            inputs: [],
            name: "maximumManagerPerformanceFeeRate",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "maximumManagerPerformanceFeeRate",
      });
      const poolFee = await readContract(wagmiConfig, {
        address: defiedgeFactory,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "pool", type: "address" },
              { internalType: "address", name: "strategy", type: "address" },
            ],
            name: "getProtocolPerformanceFeeRate",
            outputs: [
              { internalType: "uint256", name: "_feeRate", type: "uint256" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getProtocolPerformanceFeeRate",
        args: [vault.pool.address, vault.strategyAddress],
      });
    }

    if (fee) setAlmFee(fee);
  };

  useEffect(() => {
    getAlmFee();
    // ASSETS
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
          {!!almFee && (
            <div className="flex flex-col">
              <span className="text-[14px] text-[#8d8e96]">FEE</span>
              <span className="text-[16px]">{almFee}</span>
            </div>
          )}
        </div>
        <table className="table table-auto w-full rounded-lg">
          <thead className="bg-[#0b0e11]">
            <tr className="text-[16px] text-[#8f8f8f] uppercase">
              <th>Upper Tick</th>
              <th>Lower Tick</th>
              <th>In Range</th>
              <th>TVL</th>
            </tr>
          </thead>
          <tbody className="text-[16px]">
            {vault?.alm?.positions &&
              vault.alm.positions.map((position, index) => (
                <tr key={position.tvl} className="hover:bg-[#2B3139]">
                  <td>{position.upperTick}</td>
                  <td className="text-right py-1">{position.lowerTick}</td>
                  <td className="text-right py-1">
                    {position.inRange ? "Yes" : "No"}
                  </td>
                  <td className="text-right py-1">
                    {formatNumber(position.tvl, "abbreviate")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
});

export { UnderlyingALM };
