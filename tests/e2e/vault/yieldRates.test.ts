import { test, expect } from "@playwright/test";

import { formatUnits } from "viem";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { calculateAPY } from "../../../src/utils/functions/calculateAPY";
import { determineAPR } from "../../../src/utils/functions/determineAPR";
import { getTimeDifference } from "../../../src/utils/functions/getTimeDifference";

import { CHAINS } from "@constants";

const isDifferenceWithinTwentyPercent = (
  num1: number,
  num2: number
): boolean => {
  const larger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);

  const difference = Math.abs(larger - smaller);
  const twentyPercentOfLarger = Math.abs(larger * 0.2);

  return difference <= twentyPercentOfLarger;
};

let allVaults: any[] = [];
let underlyings: any[] = [];

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
    underlyings = response.data?.underlyings;
  } catch (error) {
    throw new Error(`API Error: ${error}`);
  }

  await page.goto("/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test("Should display yield rates info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='yieldLatestAPR']");
    await page.waitForSelector("[data-testid='yieldLatestFarmAPR']");

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const daysFromLastHardWork = getTimeDifference(
      vaultData.lastHardWork as number
    )?.days;

    const almRebalanceEntity = vaultData?.almRebalanceRawData?.[0]?.map(
      (_: string) => BigInt(_)
    );

    const underlying =
      underlyings?.[chainId]?.[
        //@ts-ignore
        vaultData?.underlying?.toLowerCase()
      ];

    let dailyAPR = 0;

    if (underlying?.apr?.daily) {
      dailyAPR = underlying.apr.daily;
    }

    ///// APR DATA CALCULATION
    let poolSwapFeesAPRDaily = 0;
    let poolSwapFeesAPRWeekly = 0;

    const dailyFarmApr = vaultData.apr?.income24h
      ? Number(vaultData.apr?.income24h)
      : 0;

    const weeklyFarmApr = vaultData.apr?.incomeWeek
      ? Number(vaultData.apr?.incomeWeek)
      : 0;

    if (underlying) {
      poolSwapFeesAPRDaily = underlying?.apr?.daily || 0;
      poolSwapFeesAPRWeekly =
        underlying?.apr?.weekly || underlying?.apr?.monthly || 0;
    }

    if (
      vaultData.strategyShortId === "IQMF" ||
      vaultData.strategyShortId === "IRMF"
    ) {
      let fee = vaultData?.almFee?.income || 0;

      //////
      poolSwapFeesAPRDaily =
        Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) -
        (Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) / 100) * fee;

      poolSwapFeesAPRWeekly =
        Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) -
        (Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) / 100) * fee;

      dailyAPR =
        Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) -
        (Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) / 100) * fee;

      if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
      if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
      if (!dailyAPR) dailyAPR = 0;
    }

    const APR = (
      Number(vaultData?.apr?.incomeLatest) + Number(dailyAPR)
    ).toFixed(2);

    const APY = calculateAPY(APR).toFixed(2);

    const APRWithoutFees = Number(vaultData?.apr?.incomeLatest).toFixed(2) || 0;

    const dailyTotalAPRWithFees =
      Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
    const weeklyTotalAPRWithFees =
      Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

    /* Total APY / Total APR / Farm APR should be correctly displayed per Latest / 24h / 7d */

    let APRArray = { latest: "0", daily: "0", weekly: "0" };
    let APYArray = { latest: "0", daily: "0", weekly: "0" };
    let farmAPR = { latest: "0", daily: "0", weekly: "0" };
    let poolSwapFeesAPR = { latest: "0", daily: "0", weekly: "0" };

    if (daysFromLastHardWork < 3) {
      APRArray = {
        latest: String(APR),
        daily: determineAPR(
          vaultData.apr?.income24h,
          dailyTotalAPRWithFees,
          APR
        ),
        weekly: determineAPR(
          vaultData.apr?.incomeWeek,
          weeklyTotalAPRWithFees,
          APR
        ),
      };

      APYArray = {
        latest: APY,
        daily: determineAPR(
          vaultData.apr?.income24h,
          calculateAPY(dailyTotalAPRWithFees).toFixed(2),
          APY
        ),
        weekly: determineAPR(
          vaultData.apr?.incomeWeek,
          calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
          APY
        ),
      };

      farmAPR = {
        latest: String(APRWithoutFees),
        daily: determineAPR(
          vaultData.apr?.income24h,
          dailyFarmApr,
          APRWithoutFees
        ),
        weekly: determineAPR(
          vaultData.apr?.incomeWeek,
          weeklyFarmApr,
          APRWithoutFees
        ),
      };
      poolSwapFeesAPR =
        vaultData.strategyShortId != "CF"
          ? {
              latest: Number(dailyAPR).toFixed(2),
              daily: `${poolSwapFeesAPRDaily.toFixed(2)}`,
              weekly: `${poolSwapFeesAPRWeekly.toFixed(2)}`,
            }
          : { latest: "-", daily: "-", weekly: "-" };
    }

    const yieldLatestAPR = await page.getByTestId("yieldLatestAPR").innerText();
    const yieldDailyAPR = await page.getByTestId("yieldDailyAPR").innerText();
    const yieldWeeklyAPR = await page.getByTestId("yieldWeeklyAPR").innerText();

    const yieldLatestAPY = await page.getByTestId("yieldLatestAPY").innerText();
    const yieldDailyAPY = await page.getByTestId("yieldDailyAPY").innerText();
    const yieldWeeklyAPY = await page.getByTestId("yieldWeeklyAPY").innerText();

    const yieldLatestFarmAPR = await page
      .getByTestId("yieldLatestFarmAPR")
      .innerText();
    const yieldDailyFarmAPR = await page
      .getByTestId("yieldDailyFarmAPR")
      .innerText();
    const yieldWeeklyFarmAPR = await page
      .getByTestId("yieldWeeklyFarmAPR")
      .innerText();

    const isYieldLatestAPR = isDifferenceWithinTwentyPercent(
      Number(yieldLatestAPR.slice(0, -1)),
      Number(APRArray.latest)
    );

    const isYieldDailyAPR = isDifferenceWithinTwentyPercent(
      Number(yieldDailyAPR.slice(0, -1)),
      Number(APRArray.daily)
    );

    const isYieldWeeklyAPR = isDifferenceWithinTwentyPercent(
      Number(yieldWeeklyAPR.slice(0, -1)),
      Number(APRArray.weekly)
    );

    const isYieldLatestAPY = isDifferenceWithinTwentyPercent(
      Number(yieldLatestAPY.slice(0, -1)),
      Number(APYArray.latest)
    );

    const isYieldDailyAPY = isDifferenceWithinTwentyPercent(
      Number(yieldDailyAPY.slice(0, -1)),
      Number(APYArray.daily)
    );

    const isYieldWeeklyAPY = isDifferenceWithinTwentyPercent(
      Number(yieldWeeklyAPY.slice(0, -1)),
      Number(APYArray.weekly)
    );

    const isYieldLatestFarmAPR = isDifferenceWithinTwentyPercent(
      Number(yieldLatestFarmAPR.slice(0, -1)),
      Number(farmAPR.latest)
    );

    const isYieldDailyFarmAPR = isDifferenceWithinTwentyPercent(
      Number(yieldDailyFarmAPR.slice(0, -1)),
      Number(farmAPR.daily)
    );

    const isYieldWeelyFarmAPR = isDifferenceWithinTwentyPercent(
      Number(yieldWeeklyFarmAPR.slice(0, -1)),
      Number(farmAPR.weekly)
    );

    expect(isYieldLatestAPR).toBeTruthy();
    expect(isYieldDailyAPR).toBeTruthy();
    expect(isYieldWeeklyAPR).toBeTruthy();

    expect(isYieldLatestAPY).toBeTruthy();
    expect(isYieldDailyAPY).toBeTruthy();
    expect(isYieldWeeklyAPY).toBeTruthy();

    expect(isYieldLatestFarmAPR).toBeTruthy();

    expect(isYieldDailyFarmAPR).toBeTruthy();
    expect(isYieldWeelyFarmAPR).toBeTruthy();

    /* Pool swap fees APR should be correctly displayed per Latest / 24h / 7d (IF EXIST) */
    if (vaultData.strategyShortId != "CF" && vaultData.pool) {
      const yieldLatestPoolAPR = await page
        .getByTestId("yieldLatestPoolAPR")
        .innerText();
      const yieldDailyPoolAPR = await page
        .getByTestId("yieldDailyPoolAPR")
        .innerText();
      const yieldWeeklyPoolAPR = await page
        .getByTestId("yieldWeeklyPoolAPR")
        .innerText();

      const isYieldLatestPoolAPR = isDifferenceWithinTwentyPercent(
        Number(yieldLatestPoolAPR.slice(0, -1)),
        Number(poolSwapFeesAPR.latest)
      );

      const isYieldDailyPoolAPR = isDifferenceWithinTwentyPercent(
        Number(yieldDailyPoolAPR.slice(0, -1)),
        Number(poolSwapFeesAPR.daily)
      );

      const isYieldWeelyPoolAPR = isDifferenceWithinTwentyPercent(
        Number(yieldWeeklyPoolAPR.slice(0, -1)),
        Number(poolSwapFeesAPR.weekly)
      );

      expect(isYieldLatestPoolAPR).toBeTruthy();
      expect(isYieldDailyPoolAPR).toBeTruthy();
      expect(isYieldWeelyPoolAPR).toBeTruthy();
    }

    /* VAULT VS HODL percentage amount should be displayed from deployed date */
    /* and Est Annual correctly                                               */

    const isVsActive =
      getTimeDifference(vaultData.created)?.days > 2 &&
      !!Number(vaultData.sharePrice);

    const lifetimeVsHoldAPR =
      vaultData.apr?.vsHoldLifetime &&
      getTimeDifference(vaultData.created)?.days >= 3
        ? Number(vaultData.apr?.vsHoldLifetime).toFixed(2)
        : 0;

    const currentTime = Math.floor(Date.now() / 1000);

    const differenceInSecondsFromCreation = currentTime - vaultData.created;

    const secondsInADay = 60 * 60 * 24;

    const daysFromCreation = Math.round(
      differenceInSecondsFromCreation / secondsInADay
    );

    const vsHoldAPR = (
      (Number(lifetimeVsHoldAPR) / 365) *
      Number(daysFromCreation)
    ).toFixed(2);

    if (isVsActive) {
      const vaultVsHold = await page.getByTestId("vaultVsHold").innerText();

      const vaultVsHoldLifetime = await page
        .getByTestId("vaultVsHoldLifetime")
        .innerText();

      let vaultVsHoldNumber = vaultVsHold.includes("+")
        ? Number(vaultVsHold.slice(1, -1)).toFixed(1)
        : Number(vaultVsHold.slice(0, -1)).toFixed(1);
      let vaultVsHoldLifetimeNumber = vaultVsHoldLifetime.includes("+")
        ? Number(vaultVsHoldLifetime.slice(1, -1)).toFixed(1)
        : Number(vaultVsHoldLifetime.slice(0, -1)).toFixed(1);

      const isVsHoldAPR = isDifferenceWithinTwentyPercent(
        Number(vsHoldAPR),
        Number(vaultVsHoldNumber)
      );
      const isVsHoldLifetimeAPR = isDifferenceWithinTwentyPercent(
        Number(lifetimeVsHoldAPR),
        Number(vaultVsHoldLifetimeNumber)
      );

      expect(isVsHoldAPR).toBeTruthy();
      expect(isVsHoldLifetimeAPR).toBeTruthy();
    }
    /* VAULT VS Vault token HODL percentage amount should be displayed */
    /* from deployed date and Est Annual correctly                     */
    let lifetimeTokensHold: any = [];

    const strategyAssets: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    if (vaultData.apr?.vsHoldAssetsLifetime) {
      lifetimeTokensHold = strategyAssets.map((_: string, index: number) => {
        const yearPercentDiff =
          Number(vaultData.apr?.vsHoldAssetsLifetime[index]) || 0;

        const percentDiff = (yearPercentDiff / 365) * daysFromCreation;

        return {
          latestAPR: percentDiff.toFixed(2),
          APR: yearPercentDiff.toFixed(2),
        };
      });
    }

    if (isVsActive) {
      for (const [index, token] of lifetimeTokensHold.entries()) {
        await page.waitForSelector(`[data-testid='tokensHold${index}']`);
        await page.waitForSelector(
          `[data-testid='lifetimeTokensHold${index}']`
        );

        const tokenHold = await page
          .getByTestId(`tokensHold${index}`)
          .innerText();
        const lifetimeTokenHold = await page
          .getByTestId(`lifetimeTokensHold${index}`)
          .innerText();

        let tokenHoldNumber = tokenHold.includes("+")
          ? Number(tokenHold.slice(1, -1))
          : Number(tokenHold.slice(0, -1));

        let lifetimeTokenHoldNumber = lifetimeTokenHold.includes("+")
          ? Number(lifetimeTokenHold.slice(1, -1))
          : Number(lifetimeTokenHold.slice(0, -1));

        const isTokenHoldNumber = isDifferenceWithinTwentyPercent(
          Number(token.latestAPR),
          tokenHoldNumber
        );

        const isLifetimeTokenHoldNumber = isDifferenceWithinTwentyPercent(
          Number(token.APR),
          lifetimeTokenHoldNumber
        );

        expect(isTokenHoldNumber).toBeTruthy();
        expect(isLifetimeTokenHoldNumber).toBeTruthy();
      }
    }

    await page.goBack();
  }
});
