import { memo, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { readContract } from "@wagmi/core";

import { assetsPrices, connected } from "@store";

import { StrategyABI, wagmiConfig } from "@web3";

import { getTokenData, getDate, formatNumber } from "@utils";

import { TOKENS_ASSETS } from "@constants";

import type { TAddress, TAsset, TToken } from "@types";

interface IProps {
  assets: TAsset[];
  created: string;
  pricesOnCreation: string[];
  strategy: TAddress;
}

const Assets: React.FC<IProps> = memo(
  ({ assets, created, pricesOnCreation, strategy }) => {
    const $assetsPrices = useStore(assetsPrices);
    const $connected = useStore(connected);

    const onCreationPrice: bigint[] = pricesOnCreation.map((price: string) =>
      BigInt(price)
    );

    const [invested, setInvested] = useState<any>(false);

    const getInvested = async () => {
      const userAssets = await readContract(wagmiConfig, {
        address: strategy,
        abi: StrategyABI,
        functionName: "assetsAmounts",
      });
      if (!userAssets || !$assetsPrices) return;
      const tokens = userAssets[0].map((token) => getTokenData(token));

      const amounts = userAssets[1].map((amount, index) =>
        formatUnits(amount, tokens[index]?.decimals as number)
      );
      const amountsInUSD = amounts.map((amount, index) => {
        const tokenAddress: any = tokens[index]?.address;

        const tokenPrice: bigint = $assetsPrices[tokenAddress];
        return Number(formatUnits(tokenPrice, 18)) * Number(amount);
      });

      const sum = amountsInUSD.reduce((acc: number, num: any) => acc + num, 0);

      const investedAssets = amountsInUSD.map((amount, index) => ({
        symbol: tokens[index]?.symbol,
        amount: amounts[index],
        amountInUSD: amount,
        percent: amount ? (Number(amount) / sum) * 100 : 0,
      }));

      setInvested(investedAssets);
    };

    useEffect(() => {
      if ($connected) getInvested();
    }, [$connected, $assetsPrices]);

    return (
      <div className="rounded-md p-3 mt-5 bg-button">
        <h2 className="mb-2 text-[24px] text-start h-[50px] flex items-center ml-1">
          Assets
        </h2>
        {assets &&
          assets.map((asset: any, index: number) => {
            const assetData: TToken | any = getTokenData(asset.address);

            const tokenAssets = TOKENS_ASSETS.find((tokenAsset) => {
              return tokenAsset.addresses.includes(assetData?.address);
            });

            const priceOnCreation = formatUnits(onCreationPrice[index], 18);
            const price: number = $assetsPrices
              ? Number(formatUnits($assetsPrices[asset.address], 18))
              : 0;

            const creationDate = getDate(Number(created));
            return (
              assetData && (
                <article
                  className="rounded-md p-3 mb-4 flex bg-[#32343f]"
                  key={asset.address}
                >
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex w-full justify-between items-center  flex-wrap">
                      <div className="inline-flex items-center mb-2">
                        <img
                          className="rounded-full w-[30px] m-auto mr-2"
                          src={assetData.logoURI}
                        />
                        <span className="mr-5 font-bold text-[18px]">
                          {assetData.symbol}
                        </span>
                        <span className="text-[18px]">{assetData.name}</span>
                      </div>
                      <div className="flex flex-row flex-wrap gap-1 md:gap-3 md:mt-0 mt-2">
                        {tokenAssets?.website && (
                          <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                            <a
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
                        <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                          <a
                            className="flex items-center"
                            href={`https://polygonscan.com/token/${asset.address}`}
                            target="_blank"
                          >
                            Contract
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
                        {tokenAssets?.docs && (
                          <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                            <a
                              className="flex items-center"
                              href={tokenAssets?.docs}
                              target="_blank"
                            >
                              Docs
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
                    </div>

                    {!!price && (
                      <div className="flex justify-start items-center text-[16px]">
                        <p>Price: ${formatNumber(price, "smallNumbers")}</p>
                      </div>
                    )}
                    {priceOnCreation && (
                      <div className="flex justify-start items-center text-[16px]">
                        <p>
                          Price at creation: $
                          {formatNumber(priceOnCreation, "smallNumbers")} (
                          {creationDate})
                        </p>
                      </div>
                    )}

                    {invested && (
                      <div className="flex justify-start items-center text-[16px]">
                        <p>
                          Invested:{" "}
                          {formatNumber(
                            invested[index].amount,
                            price > 1000
                              ? "formatWithLongDecimalPart"
                              : "format"
                          )}{" "}
                          {invested[index].symbol} / $
                          {formatNumber(invested[index].amountInUSD, "format")}{" "}
                          / {invested[index].percent.toFixed(2)}%
                        </p>
                      </div>
                    )}

                    <p className="text-[16px]">{tokenAssets?.description}</p>
                    {assetData?.tags && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {assetData.tags.map((tag: string) => (
                          <p
                            className="text-[14px] px-2  rounded-lg border-[2px] bg-[#486556] border-[#488B57] uppercase"
                            key={tag}
                          >
                            {tag}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )
            );
          })}
      </div>
    );
  }
);

export { Assets };
