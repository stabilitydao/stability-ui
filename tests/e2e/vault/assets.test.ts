import { test, expect } from "@playwright/test";

import axios from "axios";

import { formatUnits } from "viem";

import { seeds, getAsset } from "@stabilitydao/stability";

import { formatNumber } from "../../../src/utils/functions/formatNumber";
import { getDate } from "../../../src/utils/functions/getDate";

import { isDifferenceWithinTwentyPercent, getTokenData } from "../../helpers";

import { CHAINS, CHAINLINK_STABLECOINS } from "@constants";

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

test("Should display assets info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='assetLogo0']");

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const assetSymbols: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    const assetDetails = assetSymbols.map((symbol: string) => {
      const tokenData = getTokenData(symbol);
      if (tokenData) {
        const tokenExtended = getAsset(chainId, tokenData.address);
        return {
          address: tokenData?.address,
          logo: tokenData?.logoURI,
          symbol: tokenData?.symbol,
          name: tokenData?.name,
          website: tokenExtended?.website,
          description: tokenExtended?.description,
        };
      }
    });

    for (let assetIndex = 0; assetIndex < assetDetails.length; assetIndex++) {
      const asset = assetDetails[assetIndex];

      /* Token(s) logo, ticker, full name and link to official website should be displayed correctly */

      const assetLogoSrc = await page
        .getByTestId(`assetLogo${assetIndex}`)
        .getAttribute("src");

      const assetTicker = await page
        .getByTestId(`assetTicker${assetIndex}`)
        .textContent();
      const assetName = await page
        .getByTestId(`assetName${assetIndex}`)
        .textContent();

      if (asset?.website) {
        const assetWebsiteLink = await page
          .getByTestId(`assetWebsite${assetIndex}`)
          .getAttribute("href");
        expect(assetWebsiteLink).toBe(asset?.website);
      }

      expect(assetLogoSrc).toBe(asset?.logo);
      expect(assetTicker).toBe(asset?.symbol);
      expect(assetName).toBe(asset?.name);

      /* Token(s) current price and price on a moment of vault creation should be displayed in USD */

      const displayedPrice = await page
        .getByTestId(`assetPrice${assetIndex}`)
        .textContent();
      const formattedDisplayedPrice = Number(
        displayedPrice?.slice(1).split(" ").join("")
      );

      const creationPrice = await page
        .getByTestId(`assetPriceOnCreation${assetIndex}`)
        .textContent();
      const vaultCreationDate = getDate(Number(vaultData.created));

      const currentPrice = prices[chainId][asset?.address]
        ? Number(prices[chainId][asset?.address].price)
        : 0;

      const priceAtCreation = formatUnits(
        BigInt(vaultData.assetsPricesOnCreation[assetIndex]),
        18
      );
      const formattedCreationPrice = `$${formatNumber(priceAtCreation, "smallNumbers")} (${vaultCreationDate})`;

      const isCurrentPrice = isDifferenceWithinTwentyPercent(
        formattedDisplayedPrice,
        currentPrice
      );

      expect(isCurrentPrice).toBeTruthy();

      expect(creationPrice).toBe(formattedCreationPrice);

      /* Token(s) description should be displayed */

      const tokenDescriptionText = await page
        .getByTestId(`tokenDescription${assetIndex}`)
        .innerText();
      expect(tokenDescriptionText?.trim()).toBe(asset?.description?.trim());

      /* If price feed provided by oracle - oracle label should be displayed */

      //   const oracleLink =
      //     CHAINLINK_STABLECOINS[
      //       asset?.symbol as keyof typeof CHAINLINK_STABLECOINS
      //     ];

      //   if (oracleLink) {
      //     const trustedOracleLink = await page
      //       .getByTestId(`trustedToken${assetIndex}`)
      //       .getAttribute("href");
      //     expect(trustedOracleLink?.trim()).toBe(oracleLink?.trim());
      //   }
    }

    await page.goBack();
  }
});
