import { memo, useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { useWalletClient, useAccount, usePublicClient } from "wagmi";

import { HeadingText } from "@ui";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

import { getAsset } from "@stabilitydao/stability";

import { assetsPrices, connected, currentChainID } from "@store";

import { StrategyABI, wagmiConfig } from "@web3";

import {
  getTokenData,
  getDate,
  formatNumber,
  addAssetToWallet,
  cn,
} from "@utils";

import { CHAINLINK_STABLECOINS } from "@constants";

import type {
  TAddress,
  TAsset,
  TToken,
  TPieChartData,
  TTokenData,
} from "@types";

interface IProps {
  network: string;
  assets: TAsset[];
  created: string;
  pricesOnCreation: string[];
  strategy: TAddress;
}

interface IPayload {
  payload: {
    amount: string;
    formatedAmountInUSD: string;
    symbol: string;
    percent: number;
  };
}

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: IPayload[];
}) => {
  if (active && payload) {
    return (
      <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>${payload[0].payload.formatedAmountInUSD}</p>
          <p>{`${payload[0].payload.amount} ${payload[0].payload.symbol}`}</p>
          <p>{payload[0].payload.percent.toFixed(2)}%</p>
        </div>
      </div>
    );
  }
};

const Chart = ({ data }: { data: TPieChartData[] }) => {
  return (
    <PieChart width={170} height={170}>
      <Pie
        data={data}
        cx={80}
        cy={80}
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="amountInUSD"
        isAnimationActive={true}
        stroke="none"
      >
        {data.map((obj: TPieChartData, index: number) => (
          <Cell key={`cell-${index}`} fill={obj.color} />
        ))}
      </Pie>
      <Tooltip content={<ChartTooltip />} />
    </PieChart>
  );
};

const Assets: React.FC<IProps> = memo(
  ({ network, assets, created, pricesOnCreation, strategy }) => {
    const $assetsPrices = useStore(assetsPrices);
    const $connected = useStore(connected);
    const $currentChainID = useStore(currentChainID);

    const client = useWalletClient();
    const { connector } = useAccount();

    const publicClient = usePublicClient({
      chainId: Number(network),
      config: wagmiConfig,
    });

    const onCreationPrice: bigint[] = pricesOnCreation.map((price: string) =>
      BigInt(price)
    );

    const [investedData, setInvestedData] = useState<TPieChartData[]>([]);
    const [isPieChart, setIsPieChart] = useState(false);

    const getInvestedData = async () => {
      const assetsAmounts = await publicClient?.readContract({
        address: strategy,
        abi: StrategyABI,
        functionName: "assetsAmounts",
      });

      if (!assetsAmounts?.length || !$assetsPrices[network]) return;

      let isChart = false;

      const tokens = assetsAmounts[0].map((token: TAddress) =>
        getTokenData(token)
      );

      const amounts = assetsAmounts[1].map((amount: bigint, index: number) =>
        formatUnits(amount, tokens[index]?.decimals as number)
      );

      //   const amounts = assetsAmounts[1].map((amount: bigint, index: number) => {
      //     if (tokens[index]?.decimals === undefined) {
      //         return '0';
      //     }
      //     return formatUnits(amount, tokens[index]?.decimals as number);
      // });

      const amountsInUSD = amounts.map((amount: string, index: number) => {
        const tokenAddress: TAddress = tokens[index]?.address as TAddress;

        const tokenPrice: string = $assetsPrices[network][tokenAddress]?.price;

        return Number(tokenPrice) * Number(amount);
      });

      const sum = amountsInUSD.reduce(
        (acc: number, num: number) => acc + num,
        0
      );

      const investedAssets = amountsInUSD.map(
        (amount: number, index: number) => {
          const { address, symbol, logoURI, decimals } = tokens[
            index
          ] as TTokenData;

          // const address = token?.address as TAddress;
          const price: number = $assetsPrices[network][address]
            ? Number($assetsPrices[network][address]?.price)
            : 0;

          const color: string =
            assets.find((asset) => asset.symbol === symbol)?.color || "";

          if (!!amount) {
            isChart = true;
          }

          return {
            address,
            symbol,
            decimals,
            color,
            logo: logoURI,
            amount: formatNumber(
              amounts[index],
              price > 1000 ? "formatWithLongDecimalPart" : "format"
            ) as string,
            amountInUSD: amount,
            formatedAmountInUSD: String(formatNumber(amount, "format")),
            percent: amount ? (Number(amount) / sum) * 100 : 0,
          };
        }
      );

      setInvestedData(investedAssets);
      setIsPieChart(isChart);
    };

    useEffect(() => {
      getInvestedData();
    }, [$connected, $assetsPrices]);

    const isAddToWallet = useMemo(() => {
      return (
        $connected &&
        window?.ethereum &&
        connector?.id === "io.metamask" &&
        network === $currentChainID
      );
    }, [$connected, connector, $currentChainID]);

    return (
      <div className="md:p-3 mt-5">
        <HeadingText text="Assets" scale={2} styles="text-left mb-3" />
        <div className="bg-[#101012] border border-[#23252A] rounded-lg">
          {isPieChart && (
            <div className="flex justify-center items-center gap-5 p-4 md:p-6 border-b border-[#23252A]">
              {investedData && <Chart data={investedData} />}

              <div className="flex flex-col items-center gap-5">
                {investedData &&
                  investedData.map((data: TPieChartData, index: number) => {
                    return (
                      <div
                        className="flex items-center gap-2"
                        key={data?.color + index}
                      >
                        <div
                          style={{ background: data.color }}
                          className="w-2 h-8 rounded-md"
                        ></div>
                        <img
                          className="w-[30px] rounded-full"
                          src={data.logo}
                          alt={data.symbol}
                        />
                        <p className="text-[18px] text-[#8D8E96]">
                          {data?.percent.toFixed(2)}%
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row w-full">
            {investedData &&
              investedData.map((asset: TPieChartData, index: number) => {
                const assetData: TToken | undefined = getTokenData(
                  asset.address
                );

                if (!assetData?.address) return;

                const tokenAssets = getAsset(
                  network,
                  assetData?.address as TAddress
                );

                const priceOnCreation = formatUnits(onCreationPrice[index], 18);

                const price: number = $assetsPrices[network][asset?.address]
                  ? Number($assetsPrices[network][asset?.address]?.price)
                  : 0;

                const creationDate = getDate(Number(created));

                /////***** CHAINLINK PRICE FEEDS (if stablecoin) *****/////
                const oracleLink =
                  CHAINLINK_STABLECOINS[
                    assetData?.symbol as keyof typeof CHAINLINK_STABLECOINS
                  ];

                return (
                  assetData && (
                    <div
                      className={cn(
                        "rounded-md p-4 md:p-6 flex flex-col justify-between gap-4 w-full md:w-1/2",
                        !index && "border-b md:border-r border-[#23252A]"
                      )}
                      key={asset.address + index}
                    >
                      <div className="flex w-full flex-col gap-4">
                        <div className="flex w-full justify-between items-center flex-wrap">
                          <div className="flex items-center gap-4">
                            <img
                              data-testid={`assetLogo${index}`}
                              className="rounded-full w-10 h-10"
                              src={assetData.logoURI}
                            />
                            <div className="flex flex-col gap-1">
                              <span
                                data-testid={`assetTicker${index}`}
                                className="font-semibold text-[16px] leading-5"
                              >
                                {assetData.symbol}
                              </span>
                              <span
                                data-testid={`assetName${index}`}
                                className="text-[#97979A] text-[14px] leading-4 font-medium"
                              >
                                {assetData.name}
                              </span>
                            </div>
                          </div>
                          {tokenAssets?.website && (
                            <a
                              data-testid={`assetWebsite${index}`}
                              className="rounded-lg bg-[#5E6AD2] flex items-center justify-center gap-1 text-[12px] leading-4 font-semibold px-3 py-2"
                              href={tokenAssets?.website}
                              target="_blank"
                            >
                              Website
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                ></path>
                                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                                <path d="M11 13l9 -9"></path>
                                <path d="M15 4h5v5"></path>
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="flex w-full">
                          {!!price && (
                            <div className="w-1/2">
                              <p className="text-[#6A6B6F] text-[14px] leading-5 font-medium">
                                Price
                              </p>
                              <p
                                data-testid={`assetPrice${index}`}
                                className="text-[18px] leading-6 font-semibold"
                              >
                                ${formatNumber(price, "smallNumbers")}
                              </p>
                            </div>
                          )}
                          {priceOnCreation && (
                            <div className="w-1/2">
                              <p className="text-[#6A6B6F] text-[14px] leading-5 font-medium">
                                Price at creation
                              </p>
                              <p
                                data-testid={`assetPriceOnCreation${index}`}
                                className="leading-6 font-semibold whitespace-nowrap"
                              >
                                <span className="text-[18px]">
                                  $
                                  {formatNumber(
                                    priceOnCreation,
                                    "smallNumbers"
                                  )}
                                </span>
                                <span className="text-[14px]">
                                  ({creationDate})
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                        {assetData?.tags && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {assetData.tags.map(
                              (tag: string, index: number) => (
                                <p
                                  className="text-[14px] px-2 py-1 rounded border bg-[#202A21] border-[#008B46] uppercase text-[#2BB656]"
                                  key={tag + index}
                                >
                                  {tag}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        {oracleLink && (
                          <a
                            data-testid={`trustedToken${index}`}
                            className="w-[200px]"
                            href={oracleLink}
                            target="_blank"
                          >
                            <img
                              src="https://chain.link/badge-market-data-black"
                              alt="market data secured with chainlink"
                            />
                          </a>
                        )}
                        <p
                          data-testid={`tokenDescription${index}`}
                          className="text-[#6A6B6F] text-[14px] leading-5 font-medium"
                        >
                          {tokenAssets?.description}
                        </p>
                      </div>
                      {isAddToWallet && (
                        <button
                          onClick={() =>
                            addAssetToWallet(
                              client,
                              asset?.address,
                              asset?.decimals,
                              asset?.symbol,
                              asset?.logo
                            )
                          }
                          className="w-full text-[16px] bg-[#5E6AD2] font-semibold justify-center py-3 rounded-lg"
                        >
                          Add to wallet
                        </button>
                      )}
                    </div>
                  )
                );
              })}
          </div>
        </div>
      </div>
    );
  }
);

export { Assets };
