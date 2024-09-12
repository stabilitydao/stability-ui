// import { test, expect } from "@playwright/test";

// import axios from "axios";

// import { formatUnits } from "viem";

// import { seeds } from "@stabilitydao/stability";

// // import { getAsset } from "@stabilitydao/stability";

// // import { getProtocolLogo } from "../../../src/utils/functions/getProtocolLogo";
// // import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";

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

// test("Should be contracts info", async ({ page, context }) => {
//   test.setTimeout(500000);

//   await page.waitForSelector("[data-testid='vault']");

//   const activeVaults = await page.getByTestId("vault").count();

//   for (let i = 0; i < activeVaults; i++) {
//     await page.getByTestId("vault").nth(i).click();

//     await page.waitForSelector("[data-testid='vaultType']");
//     // await page.waitForSelector("[data-testid='contractsSymbol']");
//     // await page.waitForSelector("[data-testid='contractsType']");

//     const currentVaultAddress = page.url().slice(-42);

//     const currentChain = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

//     const nativeCurrency = CHAINS.find(
//       (chain) => chain?.id === currentChain
//     )?.nativeCurrency;

//     const currentVault = allVaults.find(
//       ({ address }) => address.toLowerCase() === currentVaultAddress
//     );

//     /* Type of Vault should be displayed correctly */

//     const pageVaultType = (
//       await page.getByTestId("vaultType").innerText()
//     ).toLowerCase();

//     const APIVaultType = currentVault.vaultType.toLowerCase();

//     expect(pageVaultType).toBe(APIVaultType);

//     /* All income is automatically reinvested into vault should be displayed */

//     const pageIncomeText = await page
//       .getByTestId("vaultIncomeText")
//       .innerText();

//     expect(pageIncomeText).toBe(
//       "All income is automatically reinvested into vault"
//     );

//     /* Vault status should Active or Deposits unavailable */

//     const pageVaultStatus = await page.getByTestId("vaultStatus").innerText();

//     expect(pageVaultStatus).toBe(currentVault?.status);

//     /* Gas reserve should be displayed correctly in native chain currency */

//     const pageVaultGasReserve = await page
//       .getByTestId("vaultGasReserve")
//       .innerText();

//     const gasReserve = !!Number(currentVault?.gasReserve)
//       ? Number(formatUnits(BigInt(currentVault?.gasReserve), 18)).toFixed(5)
//       : "0";

//     const vaultGasReserve = pageVaultGasReserve.split(" ")[0];

//     const vaultNativeCurrency = pageVaultGasReserve.split(" ")[1];

//     expect(gasReserve).toBe(vaultGasReserve);
//     expect(nativeCurrency).toBe(vaultNativeCurrency);

//     /* Last Hardwork should be displayed in hours and minutes or none */

//     await page.goBack();
//   }
// });
