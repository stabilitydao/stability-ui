import { memo, useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { useWalletClient, useAccount, usePublicClient } from "wagmi";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

import { getAsset } from "@stabilitydao/stability";

import { assetsPrices, connected, currentChainID } from "@store";

import { StrategyABI, wagmiConfig } from "@web3";

import { getTokenData, getDate, formatNumber, addAssetToWallet } from "@utils";

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

    const getInvestedData = async () => {
      const assetsAmounts = await publicClient?.readContract({
        address: strategy,
        abi: StrategyABI,
        functionName: "assetsAmounts",
      });

      if (!assetsAmounts?.length || !$assetsPrices[network]) return;

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

        const tokenPrice: string = $assetsPrices[network][tokenAddress].price;

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
      <div className="p-3 mt-5">
        <h2 className="mb-2 text-[28px] text-start h-[50px] flex items-center ml-1">
          Assets
        </h2>
        <div className="flex justify-center items-center gap-5 mb-5">
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

        <div className="flex flex-col md:flex-row gap-5 w-full mb-4">
          {investedData &&
            investedData.map((asset: TPieChartData, index: number) => {
              const assetData: TToken | undefined = getTokenData(asset.address);

              if (!assetData?.address) return;

              const tokenAssets = getAsset(
                network,
                assetData?.address as TAddress
              );

              const priceOnCreation = formatUnits(onCreationPrice[index], 18);

              const price: number = $assetsPrices[network][asset.address]
                ? Number($assetsPrices[network][asset.address].price)
                : 0;

              const creationDate = getDate(Number(created));

              /////***** CHAINLINK PRICE FEEDS (if stablecoin) *****/////
              const oracleLink =
                CHAINLINK_STABLECOINS[
                  assetData?.symbol as keyof typeof CHAINLINK_STABLECOINS
                ];
              return (
                assetData && (
                  <article
                    className="rounded-md p-3 flex flex-col justify-between gap-3 w-full md:w-1/2"
                    key={asset.address + index}
                  >
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex w-full justify-between items-center flex-wrap">
                        <div className="inline-flex items-center mb-2">
                          <img
                            data-testid={`assetLogo${index}`}
                            className="rounded-full w-[30px] m-auto mr-2"
                            src={assetData.logoURI}
                          />
                          <span
                            data-testid={`assetTicker${index}`}
                            className="mr-5 font-bold text-[18px]"
                          >
                            {assetData.symbol}
                          </span>
                          <span
                            data-testid={`assetName${index}`}
                            className="text-[18px]"
                          >
                            {assetData.name}
                          </span>
                        </div>
                        {tokenAssets?.website && (
                          <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px] mb-2">
                            <a
                              data-testid={`assetWebsite${index}`}
                              className="flex items-center"
                              href={tokenAssets?.website}
                              target="_blank"
                            >
                              Website
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-external-link ms-1"
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
                          </div>
                        )}
                      </div>
                      <div className="flex w-full">
                        {!!price && (
                          <div className="w-1/2">
                            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
                              PRICE
                            </p>
                            <p
                              data-testid={`assetPrice${index}`}
                              className="text-[16px] mt-1"
                            >
                              ${formatNumber(price, "smallNumbers")}
                            </p>
                          </div>
                        )}
                        {priceOnCreation && (
                          <div className="w-1/2">
                            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
                              PRICE AT CREATION
                            </p>
                            <p
                              data-testid={`assetPriceOnCreation${index}`}
                              className="text-[16px] mt-1"
                            >
                              ${formatNumber(priceOnCreation, "smallNumbers")} (
                              {creationDate})
                            </p>
                          </div>
                        )}
                      </div>
                      {assetData?.tags && (
                        <div className="flex items-center gap-3 flex-wrap">
                          {assetData.tags.map((tag: string, index: number) => (
                            <p
                              className="text-[14px] px-2  rounded-lg border-[2px] bg-[#486556] border-[#488B57] uppercase"
                              key={tag + index}
                            >
                              {tag}
                            </p>
                          ))}
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
                        className="text-[16px]"
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
                            asset?.symbol
                          )
                        }
                        className="px-3 py-2 bg-[#262830] rounded-md text-[16px] cursor-pointer w-[200px] flex items-center justify-center gap-2"
                      >
                        <span>Add to MetaMask </span>{" "}
                        <img src="/metamask.svg" alt="metamask" />
                      </button>
                    )}
                  </article>
                )
              );
            })}
        </div>
      </div>
    );
  }
);

export { Assets };
