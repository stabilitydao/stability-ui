import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { formatNumber } from "../../../src/utils/functions/formatNumber";
import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";
import { getTimeDifference } from "../../../src/utils/functions/getTimeDifference";

import { getTokenData, isDifferenceWithinTwentyPercent } from "../../helpers";

import { CHAINS } from "@constants";

let allVaults: any[] = [];

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
  } catch (error) {
    throw new Error(`API Error: ${error}`);
  }

  await page.goto("/vaults", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test("Should display basic info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='infoBarHeader']");

    const vaultAddress = page.url().slice(-42);

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    /* Vault symbol should display correctly */
    const infoBarHeader = await page.getByTestId("infoBarHeader").innerText();

    const isVaultSymbol = infoBarHeader.includes(vaultData.symbol);

    expect(isVaultSymbol).toBeTruthy();

    /* Vault type should display correctly */
    const barVaultType = await page.getByTestId("infoBarVaultType").innerText();

    const APIVaultType = vaultData.vaultType.toLowerCase();

    expect(barVaultType.toLowerCase()).toBe(APIVaultType);

    /* Assets should display correctly */
    const logoDiv = await page.getByTestId("infoBarAssetsLogo");

    const imgElements = await logoDiv.locator("img");

    const imgCount = await imgElements.count();

    for (let i = 0; i < imgCount; i++) {
      const imgSrc = await imgElements.nth(i).getAttribute("title");

      const tokenSymbol = getTokenData(vaultData.assets[i]).symbol;

      expect(imgSrc).toBe(tokenSymbol);
    }

    /* Strategies should display correctly */
    const strategyesLogo = await page.getByTestId("infoBarStrategyesLogo");

    const strategyesImg = await strategyesLogo.locator("img");

    const strategyesCount = await strategyesImg.count();

    const strategyInfo = getStrategyInfo(
      vaultData?.symbol,
      vaultData.strategyId
    );

    for (let i = 0; i < strategyesCount; i++) {
      const imgSrc = await strategyesImg.nth(i).getAttribute("title");

      expect(imgSrc).toBe(strategyInfo.protocols[i].name);
    }
    /* Income APR should be displayed correctly */
    // const incomeAPR = await page.getByTestId("infoBarAPR").innerText();

    // todo: income apr + period

    /* VS HODL APR should be displayed correctly */

    const vsHodlAPR = (
      await page.getByTestId("infoBarVSHodlAPR").innerText()
    ).slice(0, -1);

    const lifetimeVsHoldAPR =
      vaultData.vsHold?.aprLifetime &&
      getTimeDifference(vaultData.created)?.days >= 3
        ? Number(vaultData.vsHold?.aprLifetime).toFixed(2)
        : 0;

    expect(Number(vsHodlAPR)).toBe(Number(lifetimeVsHoldAPR));

    // /* TVL should be displayed correctly per vault */
    const vaultTVL = await page.getByTestId("infoBarTVL").innerText();

    let lastChar = vaultTVL[vaultTVL.length - 1];

    const formattedTVL = isNaN(Number(lastChar))
      ? Number(vaultTVL.slice(1, -1))
      : Number(vaultTVL.slice(1));

    const totalTVL = String(formatNumber(vaultData.tvl, "abbreviate"));

    lastChar = totalTVL[totalTVL.length - 1];

    const formattedTotalTVL = isNaN(Number(lastChar))
      ? Number(totalTVL.slice(1, -1))
      : Number(totalTVL.slice(1));

    const isTVL = isDifferenceWithinTwentyPercent(
      formattedTVL,
      formattedTotalTVL
    );

    expect(isTVL).toBeTruthy();

    /* ALM TVL should be dispalyed correctly */
    if (vaultData?.alm?.tvl) {
      const infoBarAlmTVL = await page.getByTestId("infoBarAlmTVL").innerText();

      const almTVL = formatNumber(Number(vaultData?.alm?.tvl), "abbreviate");

      expect(infoBarAlmTVL).toBe(almTVL);
    }

    /* Pool TVL should be dispalyed correctly */
    if (vaultData?.pool?.tvl) {
      const infoBarPoolTVL = await page
        .getByTestId("infoBarPoolTVL")
        .innerText();

      const poolTVL = formatNumber(Number(vaultData?.pool?.tvl), "abbreviate");

      expect(infoBarPoolTVL).toBe(poolTVL);
    }

    /* Share price should be displayed correctly */
    const vaultSP = await page.getByTestId("infoBarSP").innerText();

    const sharePrice = Number(vaultData.sharePrice)
      ? Number(vaultData.sharePrice).toFixed(1)
      : "1.0";

    expect(Number(vaultSP.slice(1)).toFixed(1)).toBe(sharePrice);

    /* Last Hardwork should be displayed in hours and minutes or none */
    const infoBarHardWork = await page
      .getByTestId("infoBarHardWork")
      .innerText();

    const timeDifference = getTimeDifference(vaultData?.lastHardWork);

    if (timeDifference) {
      let expectedLastHardWorkText = "None";

      if (timeDifference.days) {
        if (timeDifference.days < 1000) {
          expectedLastHardWorkText = `${timeDifference.days} ${timeDifference.days > 1 ? "days" : "day"} ${timeDifference.hours}h ago`;
        }
      } else {
        expectedLastHardWorkText = `${timeDifference.hours}h ago`;
      }

      expect(infoBarHardWork).toContain(expectedLastHardWorkText);
    }
    /* Deposited amount should be 0 if user have no deps in vault or disconnected */
    const deposited = await page.getByTestId("infoBarDeposited").innerText();

    expect(deposited).toBe("0");

    await page.goBack();
  }
});
