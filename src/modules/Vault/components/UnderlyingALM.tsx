import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { readContract } from "@wagmi/core";

import { HeadingText } from "@ui";

import { formatNumber } from "@utils";

import { assetsPrices } from "@store";

import { wagmiConfig, defiedgeFactories, ichiFactories } from "@web3";

import type { TAddress, TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

type TDefiedgeFee =
  | {
      rebalance: string;
      withdraw: string;
      deposit: string;
      poolSwapFee: string;
    }
  | undefined;

type TAlmAsset = {
  symbol: string;
  amount: number;
  percent: number;
};

// type TAlmTable = {
//   amounts: string[];
//   amountsInUSD: string[];
//   inRange: boolean;
//   lowerTick: number;
//   upperTick: number;
//   tvl: string;
// };

const UnderlyingALM: React.FC<IProps> = memo(({ network, vault }) => {
  const $assetsPrices = useStore(assetsPrices);

  const [almAssets, setAlmAssets] = useState<TAlmAsset[]>([]);
  const [almFee, setAlmFee] = useState<string>("");
  const [defiedgeFee, setDefiedgeFee] = useState<TDefiedgeFee>();
  // const [tableData, setTableData] = useState<TAlmTable[]>([]);

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
      case "DefiEdge":
        const managerFee = await readContract(wagmiConfig, {
          address: defiedgeFactories["137"],
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
        const protocolPerformanceFee = await readContract(wagmiConfig, {
          address: defiedgeFactories["137"],
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
          args: [vault?.pool?.address as TAddress, vault.strategyAddress],
        });
        const defiedgeFees = `${formatUnits(
          managerFee + protocolPerformanceFee,
          8
        )}%`;
        setDefiedgeFee({
          rebalance: defiedgeFees,
          withdraw: defiedgeFees,
          deposit: `${formatUnits(protocolPerformanceFee, 8)}%`,
          poolSwapFee: "0%",
        });
        break;
      case "Ichi":
        if (vault.strategy.includes("Retro")) {
          const baseFee = await readContract(wagmiConfig, {
            address: ichiFactories.retro,
            abi: [
              {
                inputs: [],
                name: "baseFee",
                outputs: [
                  { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "baseFee",
          });
          fee = `${formatUnits(baseFee, 16)}%`;
        }
        if (vault.strategy.includes("QuickSwap")) {
          const ammFee = await readContract(wagmiConfig, {
            address: ichiFactories.quickswap,
            abi: [
              {
                inputs: [],
                name: "ammFee",
                outputs: [
                  { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "ammFee",
          });
          const baseFee = await readContract(wagmiConfig, {
            address: ichiFactories.quickswap,
            abi: [
              {
                inputs: [],
                name: "baseFee",
                outputs: [
                  { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "baseFee",
          });
          fee = `${formatUnits(ammFee + baseFee, 16)}%`;
        }

        break;
      default:
        break;
    }
    if (fee) setAlmFee(fee);
  };
  const getTableData = async () => {
    // if (!$assetsPrices[network] || !vault?.alm?.positions) return;
    // const prices = vault.assets.map((asset) =>
    //   Number($assetsPrices[network][asset.address].price)
    // );
    // const data = vault?.alm?.positions.map((position) => {
    //   let amountsInUSD: string[] | number[] = prices.map(
    //     //@ts-ignore
    //     (price, index) => Number(position[`amountToken${index}`]) * price
    //   );
    //   let amounts: string[] | number[] = prices.map(
    //     //@ts-ignore
    //     (_, index) => Number(position[`amountToken${index}`])
    //   );
    //   amounts = amounts.map((amount) =>
    //     formatNumber(amount, "format")
    //   ) as string[];
    //   const tvl = formatNumber(
    //     amountsInUSD.reduce((acc, value) => (acc += value), 0),
    //     "abbreviate"
    //   );
    //   amountsInUSD = amountsInUSD.map((amount) =>
    //     formatNumber(amount, "abbreviate")
    //   ) as string[];
    //   return {
    //     amounts,
    //     amountsInUSD,
    //     inRange: position.inRange,
    //     lowerTick: position.lowerTick,
    //     upperTick: position.upperTick,
    //     tvl: tvl as string,
    //   };
    // });
    // if (data) setTableData(data);
  };

  useEffect(() => {
    getAlmFee();
    getTableData();
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
          {!!defiedgeFee && (
            <div className="flex gap-5 flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <span className="flex text-[14px] leading-5 text-[#97979A]">
                    Pool swap fee
                  </span>
                  <span className="text-[16px]">{defiedgeFee.poolSwapFee}</span>
                </div>
                <div className="flex flex-col">
                  <span className="flex text-[14px] leading-5 text-[#97979A]">
                    Rebalance fee
                  </span>
                  <span className="text-[16px]">{defiedgeFee.rebalance}</span>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <span className="flex text-[14px] leading-5 text-[#97979A]">
                    Deposit fee
                  </span>
                  <span className="text-[16px]">{defiedgeFee.deposit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="flex text-[14px] leading-5 text-[#97979A]">
                    Withdraw Fee
                  </span>
                  <span className="text-[16px]">{defiedgeFee.withdraw}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* <div className="max-h-[300px] overflow-y-auto">
          <table className="table table-auto w-full rounded-lg">
            <thead className="bg-[#0b0e11] sticky top-0 z-10">
              <tr className="text-[16px] text-[#8f8f8f] uppercase">
                <th>Ticks</th>
                <th>In Range</th>
                {!!vault?.assets &&
                  vault?.assets?.map((asset) => (
                    <th key={asset.symbol}>{asset.symbol}</th>
                  ))}
                <th className="hidden md:block">TVL</th>
              </tr>
            </thead>
            <tbody className="text-[16px]">
              {tableData &&
                tableData.map((position, index) => (
                  <tr key={position.tvl + index} className="hover:bg-[#2B3139]">
                    <td>
                      <span className="mr-4">{position.lowerTick}</span>
                      <span>{position.upperTick}</span>
                    </td>
                    <td className="py-1 flex justify-end">
                      {position.inRange ? (
                        <img src="/icons/done.svg" alt="Yes" />
                      ) : (
                        <img src="/icons/close.svg" alt="No" />
                      )}
                    </td>
                    {position.amounts.map((amount, index: number) => (
                      <td key={amount + index} className="text-right py-1">
                        {amount}
                      </td>
                    ))}
                    <td className="text-right py-1 hidden md:block">
                      {position.tvl}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
});

export { UnderlyingALM };
