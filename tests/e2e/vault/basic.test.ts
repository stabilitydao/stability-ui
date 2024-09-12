// import { test, expect } from "@playwright/test";

// import axios from "axios";

// import { seeds } from "@stabilitydao/stability";

// import { formatNumber } from "../../../src/utils/functions/formatNumber";

// import { CHAINS } from "@constants";

// let allVaults: any[] = [];

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
//   } catch (error) {
//     throw new Error(`API Error: ${error}`);
//   }

//   await page.goto("/", { waitUntil: "load", timeout: 60000 });
//   await page.waitForTimeout(5000);
// });

// test("Should be vault basic info", async ({ page }) => {
//   test.setTimeout(500000);

//   await page.waitForSelector("[data-testid='vault']");

//   const activeVaults = await page.getByTestId("vault").count();

//   for (let i = 0; i < activeVaults; i++) {
//     await page.getByTestId("vault").nth(i).click();

//     await page.waitForSelector("[data-testid='vaultSymbol']");
//     await page.waitForSelector("[data-testid='vaultName']");
//     await page.waitForSelector("[data-testid='infoBarLogo']");

//     const currentVaultAddress = page.url().slice(-42);

//     const currentVault = allVaults.find(
//       ({ address }) => address.toLowerCase() === currentVaultAddress
//     );

//     /* Short and full vault name should display correctly */

//     const symbol = await page.getByTestId("vaultSymbol").innerText();
//     const name = await page.getByTestId("vaultName").innerText();

//     expect(currentVault.symbol === symbol).toBeTruthy();
//     expect(currentVault.name === name).toBeTruthy();

//     /* Vault logo, chain logo and protocols logos under strategy */
//     /* should be displayed correctly in one line                 */

//     const logo = await page.getByTestId("infoBarLogo");

//     const strategyesLogo = await page.getByTestId("infoBarStrategyesLogo");

//     const protocolsLogo = await page.getByTestId("infoBarProtocolsLogo");

//     const isLogoFlex = await logo.evaluate((element) => {
//       return window.getComputedStyle(element).display === "flex";
//     });

//     let isStrategyFlex = false;

//     const strategyLogoCount = await strategyesLogo.count();

//     if (strategyLogoCount > 0) {
//       isStrategyFlex = await strategyesLogo.evaluate((element) => {
//         return window.getComputedStyle(element).display === "flex";
//       });
//     }

//     let isProtocolsFlex = false;

//     const protocolsLogoCount = await protocolsLogo.count();

//     if (protocolsLogoCount > 0) {
//       isProtocolsFlex = await protocolsLogo.evaluate((element) => {
//         return window.getComputedStyle(element).display === "flex";
//       });
//     }

//     expect(isLogoFlex).toBeTruthy();

//     if (strategyLogoCount > 0) {
//       expect(isStrategyFlex).toBeTruthy();
//     }
//     if (protocolsLogoCount > 0) {
//       expect(isProtocolsFlex).toBeTruthy();
//     }

//     /* TVL should be displayed correctly per vault */
//     const vaultTVL = await page.getByTestId("infoBarTVL").innerText();

//     expect(vaultTVL).toBe(formatNumber(Number(currentVault.tvl), "abbreviate"));

//     /* Share price should be displayed correctly */
//     const vaultSP = await page.getByTestId("infoBarSP").innerText();

//     expect(Number(vaultSP.slice(1)).toFixed(3)).toBe(
//       Number(currentVault.sharePrice).toFixed(3)
//     );

//     /* Deposited amount should be 0 if user have no deps in vault or disconnected */

//     const deposited = await page.getByTestId("infoBarDeposited").innerText();

//     expect(deposited).toBe("0");

//     /* Daily/Monthly percentage amounts should be displayed correctly */
//     /* APRs terms rate should filter APR/APY by latest/24h/7d         */
//     await page.getByTestId("hideSwapFee").first().click();

//     const APRSwitcher = await page.getByTestId("APRTimeSwitcher").first();
//     const APRTypes = await page.getByTestId("APRType");

//     const APRs = [
//       currentVault.apr.incomeLatest,
//       currentVault.apr.income24h,
//       currentVault.apr.incomeWeek,
//     ];

//     const toAPR = (apr: number) => ({
//       APR: apr.toFixed(1),
//       dailyAPR: (apr / 365).toFixed(2),
//       monthlyAPR: (apr / 12).toFixed(2),
//     });

//     const allAPRs = APRs.map((apr) => toAPR(Number(apr)));

//     for (let i = 0; i < allAPRs.length; i++) {
//       await APRSwitcher.click();
//       await APRTypes.nth(i).click();
//       await page.waitForTimeout(500);

//       const { APR, dailyAPR, monthlyAPR } = allAPRs[i];

//       const APRText = await page.getByTestId("infoBarAPR").innerText();
//       const dailyAPRText = await page
//         .getByTestId("infoBarDailyAPR")
//         .innerText();
//       const monthlyAPRText = await page
//         .getByTestId("infoBarMonthlyAPR")
//         .innerText();

//       const extractAPR = (text: string) =>
//         Number(text.slice(0, text.indexOf("%")).trim());

//       expect(extractAPR(APRText).toFixed(1)).toBe(APR);
//       expect(extractAPR(dailyAPRText).toFixed(2)).toBe(dailyAPR);
//       expect(extractAPR(monthlyAPRText).toFixed(2)).toBe(monthlyAPR);
//     }

//     await page.goBack();
//   }
// });
