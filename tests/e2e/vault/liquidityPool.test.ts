import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";
import { formatNumber } from "../../../src/utils/functions/formatNumber";

import { getTokenData, isDifferenceWithinTwentyPercent } from "../../helpers";

import { CHAINS } from "@constants";

let allVaults: any[] = [];
let prices: any = {};

test.beforeEach(async ({ page }) => {
  try {
    const response = await axios.get(seeds[0]);

    const vaultsData = response.data?.vaults || {};

    allVaults = await Promise.all(
      CHAINS.map(async (chain) => {
        const chainVaults = vaultsData[chain?.id] || {};
        return Object.values(chainVaults).map((vault) => vault);
      })
    );
    allVaults = allVaults.flat();
    prices = response.data?.assetPrices;
  } catch (error) {
    throw new Error(`API Error: ${error}`);
  }

  await page.goto("/vaults", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test("Should display liquidity pool info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='vaultType']");
    await page.waitForSelector("[data-testid='vaultStatus']");

    const isLiquidityPool = await page.getByTestId("poolLogo").isVisible();

    if (!isLiquidityPool) {
      await page.goBack();
      continue;
    }

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const strategyInfo = getStrategyInfo(
      vaultData?.symbol,
      vaultData?.strategyId
    );

    const strategyAssets: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    const assets = strategyAssets.map((strategyAsset: string) => {
      const token = getTokenData(strategyAsset);

      if (token) {
        return {
          address: token?.address,
          symbol: token?.symbol,
        };
      }
    });

    const symbol =
      assets.length > 1
        ? `${assets[0]?.symbol}-${assets[1]?.symbol}`
        : assets[0]?.symbol;

    /* Logo, protocol name and tokens tickers should be displayed correctly */

    const poolLogo = await page.getByTestId("poolLogo").getAttribute("src");
    const poolName = await page.getByTestId("poolName").innerText();
    const poolSymbol = await page.getByTestId("poolSymbol").innerText();

    expect(poolLogo).toBe(
      vaultData?.strategyId === "Curve Convex Farm"
        ? strategyInfo.protocols[0].logoSrc
        : strategyInfo.protocols[1].logoSrc
    );
    expect(poolName).toBe(
      vaultData?.strategyId === "Curve Convex Farm"
        ? strategyInfo.protocols[0].name
        : strategyInfo.protocols[1].name
    );
    expect(poolSymbol).toBe(symbol);

    /* Pool TVL should be displayed correctly in USD */
    const TVL = String(formatNumber(vaultData.pool.tvl || 0, "abbreviate"));

    const poolTVL = await page.getByTestId("poolTVL").innerText();

    let lastChar = poolTVL[poolTVL.length - 1];

    const formattedPoolTVL = isNaN(Number(lastChar))
      ? Number(poolTVL.slice(1, -1))
      : Number(poolTVL.slice(1));

    lastChar = TVL[TVL.length - 1];

    const formattedTVL = isNaN(Number(lastChar))
      ? Number(TVL.slice(1, -1))
      : Number(TVL.slice(1));

    const isPoolTVL = isDifferenceWithinTwentyPercent(
      formattedTVL,
      formattedPoolTVL
    );

    expect(isPoolTVL).toBeTruthy();
    /* Pool tokens native amounts and ratio in pool in percents should be displayed correctly */

    if (prices[chainId]) {
      const poolAssets = assets.map((asset, index) => {
        const price = Number(prices[chainId][asset?.address].price);

        //@ts-ignore
        const amount = vaultData?.pool?.[`amountToken${index}`] || 0;

        const amountInUSD = price * amount;

        return {
          symbol: asset?.symbol,
          amountInUSD: amountInUSD,
          amount: amount,
        };
      });

      const vaultLiquidity = poolAssets.reduce(
        (acc, curr) => (acc += curr?.amountInUSD),
        0
      );

      const assetsWithPercents = poolAssets.map((asset) => {
        return {
          ...asset,
          percent: asset?.amountInUSD
            ? (asset?.amountInUSD / vaultLiquidity) * 100
            : 0,
        };
      });

      for (let i = 0; i < assetsWithPercents.length; i++) {
        const asset = await page.getByTestId(`poolAsset${i}`).innerText();

        const assetArr = asset.split(" ");

        const assetPercent = Number(assetArr[assetArr.length - 1].slice(1, -2));

        assetArr.pop();

        let assetAmount = Number(
          assetArr.reduce((acc, cur) => (acc += cur), "")
        );

        const isAssetAmount = isDifferenceWithinTwentyPercent(
          Number(assetsWithPercents[i].amount),
          assetAmount
        );

        const isAssetPercent = isDifferenceWithinTwentyPercent(
          assetsWithPercents[i]?.percent,
          assetPercent
        );

        expect(isAssetPercent).toBeTruthy();
        expect(isAssetAmount).toBeTruthy();
      }
    }

    /* Pool fee should be displayed correctly */
    if (vaultData?.pool?.fee) {
      const fee = `${vaultData?.pool?.fee}%`;

      const poolFee = await page.getByTestId("poolFee").innerText();

      expect(poolFee).toBe(fee);
    }
    await page.goBack();
  }
});
