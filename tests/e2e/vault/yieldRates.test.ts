// import { test, expect } from "@playwright/test";

// import { formatUnits } from "viem";

// import axios from "axios";

// import { seeds } from "@stabilitydao/stability";

// import { calculateAPY } from "../../../src/utils/functions/calculateAPY";
// import { determineAPR } from "../../../src/utils/functions/determineAPR";
// import { getTimeDifference } from "../../../src/utils/functions/getTimeDifference";

// import { CHAINS } from "@constants";

// let allVaults: any[] = [];
// let underlyings: any[] = [];
// let prices = {};

// test.beforeEach(async ({ page }) => {
//   try {
//     const response = await axios.get(seeds[0]);

//     const vaultsData = response.data?.vaults || {};

//     allVaults = await Promise.all(
//       CHAINS.map(async (chain) => {
//         const chainVaults = vaultsData[chain?.id] || {};
//         return Object.values(chainVaults).map((vault) => vault);
//       })
//     );
//     allVaults = allVaults.flat();
//     underlyings = response.data?.underlyings;
//     prices = response.data?.assetPrices;
//   } catch (error) {
//     throw new Error(`API Error: ${error}`);
//   }

//   await page.goto("/", { waitUntil: "load", timeout: 60000 });
//   await page.waitForTimeout(5000);
// });

// test("Should be yield rates info", async ({ page }) => {
//   test.setTimeout(500000);

//   await page.waitForSelector("[data-testid='vault']");

//   const activeVaults = await page.getByTestId("vault").count();

//   for (let i = 0; i < activeVaults; i++) {
//     await page.getByTestId("vault").nth(i).click();

//     await page.waitForSelector("[data-testid='yieldLatestAPY']");
//     await page.waitForSelector("[data-testid='yieldLatestAPY']");
//     await page.waitForSelector("[data-testid='yieldLatestFarmAPR']");

//     const currentVaultAddress = page.url().slice(-42);

//     const currentChain = page.url().match(/\/vault\/(\d+)\//)?.[1] || 137;

//     const currentVault = allVaults.find(
//       ({ address }) => address.toLowerCase() === currentVaultAddress
//     );

//     const almRebalanceEntity = currentVault?.almRebalanceRawData?.[0]?.map(
//       (_: string) => BigInt(_)
//     );

//     const underlying =
//       underlyings?.[currentChain]?.[
//         //@ts-ignore
//         currentVault?.underlying?.toLowerCase()
//       ];

//     let dailyAPR = 0;

//     if (underlying?.apr?.daily) {
//       dailyAPR = underlying.apr.daily;
//     }

//     ///// APR DATA CALCULATION
//     let poolSwapFeesAPRDaily = 0;
//     let poolSwapFeesAPRWeekly = 0;

//     const dailyFarmApr = currentVault.apr?.income24h
//       ? Number(currentVault.apr?.income24h)
//       : 0;

//     const weeklyFarmApr = currentVault.apr?.incomeWeek
//       ? Number(currentVault.apr?.incomeWeek)
//       : 0;

//     if (underlying) {
//       poolSwapFeesAPRDaily = underlying?.apr?.daily || 0;
//       poolSwapFeesAPRWeekly =
//         underlying?.apr?.weekly || underlying?.apr?.monthly || 0;
//     }

//     if (
//       currentVault.strategyShortId === "IQMF" ||
//       currentVault.strategyShortId === "IRMF"
//     ) {
//       let fee = currentVault?.almFee?.income || 0;

//       //////
//       poolSwapFeesAPRDaily =
//         Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) -
//         (Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) / 100) * fee;

//       poolSwapFeesAPRWeekly =
//         Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) -
//         (Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) / 100) * fee;

//       dailyAPR =
//         Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) -
//         (Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) / 100) * fee;

//       if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
//       if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
//       if (!dailyAPR) dailyAPR = 0;
//     }

//     const APR = (
//       Number(currentVault?.apr?.incomeLatest) + Number(dailyAPR)
//     ).toFixed(2);

//     const APY = calculateAPY(APR).toFixed(2);

//     const APRWithoutFees =
//       Number(currentVault?.apr?.incomeLatest).toFixed(2) || 0;

//     const dailyTotalAPRWithFees =
//       Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
//     const weeklyTotalAPRWithFees =
//       Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

//     /* Total APY / Total APR / Farm APR should be correctly displayed per Latest / 24h / 7d */

//     const APRArray = {
//       latest: String(APR),
//       daily: determineAPR(
//         currentVault.apr?.income24h,
//         dailyTotalAPRWithFees,
//         APR
//       ),
//       weekly: determineAPR(
//         currentVault.apr?.incomeWeek,
//         weeklyTotalAPRWithFees,
//         APR
//       ),
//     };
//     const APYArray = {
//       latest: APY,
//       daily: determineAPR(
//         currentVault.apr?.income24h,
//         calculateAPY(dailyTotalAPRWithFees).toFixed(2),
//         APY
//       ),
//       weekly: determineAPR(
//         currentVault.apr?.incomeWeek,
//         calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
//         APY
//       ),
//     };
//     const farmAPR = {
//       latest: APRWithoutFees,
//       daily: determineAPR(
//         currentVault.apr?.income24h,
//         dailyFarmApr,
//         APRWithoutFees
//       ),
//       weekly: determineAPR(
//         currentVault.apr?.incomeWeek,
//         weeklyFarmApr,
//         APRWithoutFees
//       ),
//     };
//     const poolSwapFeesAPR =
//       currentVault.strategyShortId != "CF"
//         ? {
//             latest: Number(dailyAPR).toFixed(2),
//             daily: `${poolSwapFeesAPRDaily.toFixed(2)}`,
//             weekly: `${poolSwapFeesAPRWeekly.toFixed(2)}`,
//           }
//         : { latest: "-", daily: "-", weekly: "-" };

//     const yieldLatestAPR = await page.getByTestId("yieldLatestAPR").innerText();
//     const yieldDailyAPR = await page.getByTestId("yieldDailyAPR").innerText();
//     const yieldWeeklyAPR = await page.getByTestId("yieldWeeklyAPR").innerText();

//     const yieldLatestAPY = await page.getByTestId("yieldLatestAPY").innerText();
//     const yieldDailyAPY = await page.getByTestId("yieldDailyAPY").innerText();
//     const yieldWeeklyAPY = await page.getByTestId("yieldWeeklyAPY").innerText();

//     const yieldLatestFarmAPR = await page
//       .getByTestId("yieldLatestFarmAPR")
//       .innerText();
//     const yieldDailyFarmAPR = await page
//       .getByTestId("yieldDailyFarmAPR")
//       .innerText();
//     const yieldWeeklyFarmAPR = await page
//       .getByTestId("yieldWeeklyFarmAPR")
//       .innerText();

//     expect(Number(yieldLatestAPR.slice(0, -1))).toBe(Number(APRArray.latest));
//     expect(Number(yieldDailyAPR.slice(0, -1))).toBe(Number(APRArray.daily));
//     expect(Number(yieldWeeklyAPR.slice(0, -1))).toBe(Number(APRArray.weekly));

//     expect(Number(yieldLatestAPY.slice(0, -1))).toBe(Number(APYArray.latest));
//     expect(Number(yieldDailyAPY.slice(0, -1))).toBe(Number(APYArray.daily));
//     expect(Number(yieldWeeklyAPY.slice(0, -1))).toBe(Number(APYArray.weekly));

//     expect(Number(yieldLatestFarmAPR.slice(0, -1))).toBe(
//       Number(farmAPR.latest)
//     );
//     expect(Number(yieldDailyFarmAPR.slice(0, -1))).toBe(Number(farmAPR.daily));
//     expect(Number(yieldWeeklyFarmAPR.slice(0, -1))).toBe(
//       Number(farmAPR.weekly)
//     );

//     /* Pool swap fees APR should be correctly displayed per Latest / 24h / 7d (IF EXIST) */
//     if (currentVault.strategyShortId != "CF" && currentVault.pool) {
//       const yieldLatestPoolAPR = await page
//         .getByTestId("yieldLatestPoolAPR")
//         .innerText();
//       const yieldDailyPoolAPR = await page
//         .getByTestId("yieldDailyPoolAPR")
//         .innerText();
//       const yieldWeeklyPoolAPR = await page
//         .getByTestId("yieldWeeklyPoolAPR")
//         .innerText();

//       expect(Number(yieldLatestPoolAPR.slice(0, -1))).toBe(
//         Number(poolSwapFeesAPR.latest)
//       );
//       expect(Number(yieldDailyPoolAPR.slice(0, -1))).toBe(
//         Number(poolSwapFeesAPR.daily)
//       );
//       expect(Number(yieldWeeklyPoolAPR.slice(0, -1))).toBe(
//         Number(poolSwapFeesAPR.weekly)
//       );
//     }

//     /* VAULT VS HODL percentage amount should be displayed from deployed date */
//     /* and Est Annual correctly                                               */

//     const isVsActive =
//       getTimeDifference(currentVault.created)?.days > 2 &&
//       !!Number(currentVault.sharePrice);

//     const lifetimeVsHoldAPR =
//       currentVault.apr?.vsHoldLifetime &&
//       getTimeDifference(currentVault.created)?.days >= 3
//         ? Number(currentVault.apr?.vsHoldLifetime).toFixed(1)
//         : 0;

//     const currentTime = Math.floor(Date.now() / 1000);

//     const differenceInSecondsFromCreation = currentTime - currentVault.created;

//     const secondsInADay = 60 * 60 * 24;

//     const daysFromCreation = Math.round(
//       differenceInSecondsFromCreation / secondsInADay
//     );

//     const vsHoldAPR = (
//       (Number(lifetimeVsHoldAPR) / 365) *
//       Number(daysFromCreation)
//     ).toFixed(1);

//     if (isVsActive) {
//       const vaultVsHold = await page.getByTestId("vaultVsHold").innerText();
//       const vaultVsHoldLifetime = await page
//         .getByTestId("vaultVsHoldLifetime")
//         .innerText();

//       let vaultVsHoldNumber = vaultVsHold.includes("+")
//         ? Number(vaultVsHold.slice(1, -1)).toFixed(1)
//         : Number(vaultVsHold.slice(0, -1)).toFixed(1);
//       let vaultVsHoldLifetimeNumber = vaultVsHoldLifetime.includes("+")
//         ? Number(vaultVsHoldLifetime.slice(1, -1)).toFixed(1)
//         : Number(vaultVsHoldLifetime.slice(0, -1)).toFixed(1);

//       expect(vaultVsHoldNumber).toBe(vsHoldAPR);
//       expect(vaultVsHoldLifetimeNumber).toBe(lifetimeVsHoldAPR);
//     }

//     /* VAULT VS Vault token HODL percentage amount should be displayed */
//     /* from deployed date and Est Annual correctly                     */

//     let lifetimeTokensHold: any = [];

//     const strategyAssets: string[] =
//       currentVault?.assets?.map((asset: string) => asset.toLowerCase()) || [];

//     if (currentVault.apr?.vsHoldAssetsLifetime && prices) {
//       lifetimeTokensHold = strategyAssets.map((_: string, index: number) => {
//         const yearPercentDiff =
//           Number(currentVault.apr?.vsHoldAssetsLifetime[index]) || 0;

//         const percentDiff = (yearPercentDiff / 365) * daysFromCreation;

//         return {
//           latestAPR: percentDiff.toFixed(1),
//           APR: yearPercentDiff.toFixed(1),
//         };
//       });
//     }

//     if (isVsActive) {
//       lifetimeTokensHold.forEach(async (token: any, index: number) => {
//         const tokenHold = await page
//           .getByTestId(`tokensHold${index}`)
//           .innerText();
//         const lifetimeTokenHold = await page
//           .getByTestId(`lifetimeTokensHold${index}`)
//           .innerText();

//         let tokenHoldNumber = tokenHold.includes("+")
//           ? Number(tokenHold.slice(1, -1)).toFixed(1)
//           : Number(tokenHold.slice(0, -1)).toFixed(1);
//         let lifetimeTokenHoldNumber = lifetimeTokenHold.includes("+")
//           ? Number(lifetimeTokenHold.slice(1, -1)).toFixed(1)
//           : Number(lifetimeTokenHold.slice(0, -1)).toFixed(1);

//         expect(token.latestAPR).toBe(tokenHoldNumber);
//         expect(token.APR).toBe(lifetimeTokenHoldNumber);
//       });
//     }

//     await page.goBack();
//   }
// });
