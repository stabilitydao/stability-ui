import { test, expect } from "@playwright/test";

import axios from "axios";

import { formatUnits } from "viem";

import { seeds } from "@stabilitydao/stability";

import { getDate } from "../../../src/utils/functions/getDate";
import { getTimeDifference } from "../../../src/utils/functions/getTimeDifference";

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

test("Should display vault info correctly", async ({ page, context }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='vaultType']");
    await page.waitForSelector("[data-testid='vaultStatus']");
    await page.waitForSelector("[data-testid='hardWorkOnDeposit']");

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const nativeCurrency = CHAINS.find(
      (chain) => chain?.id === chainId
    )?.nativeCurrency;

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    /* Type of Vault should be displayed correctly */

    const pageVaultType = (
      await page.getByTestId("vaultType").innerText()
    ).toLowerCase();

    const APIVaultType = vaultData.vaultType.toLowerCase();

    expect(pageVaultType).toBe(APIVaultType);

    /* All income is automatically reinvested into vault should be displayed */

    const pageIncomeText = await page
      .getByTestId("vaultIncomeText")
      .innerText();

    expect(pageIncomeText).toBe(
      "All income is automatically reinvested into vault"
    );

    /* Vault status should Active or Deposits unavailable */

    const pageVaultStatus = await page.getByTestId("vaultStatus").innerText();

    expect(pageVaultStatus).toBe(vaultData?.status);

    /* Gas reserve should be displayed correctly in native chain currency */

    const pageVaultGasReserve = await page
      .getByTestId("vaultGasReserve")
      .innerText();

    const gasReserve = !!Number(vaultData?.gasReserve)
      ? Number(formatUnits(BigInt(vaultData?.gasReserve), 18)).toFixed(5)
      : "0";

    const vaultGasReserve = pageVaultGasReserve.split(" ")[0];

    const vaultNativeCurrency = pageVaultGasReserve.split(" ")[1];

    expect(gasReserve).toBe(vaultGasReserve);
    expect(nativeCurrency).toBe(vaultNativeCurrency);

    /* Last Hardwork should be displayed in hours and minutes or none */

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

      const vaultLastHardWork = await page
        .getByTestId("vaultLastHardWork")
        .textContent();

      expect(vaultLastHardWork).toContain(expectedLastHardWorkText);
    }
    /* Hardwork on Deposit should have status YES or NO */

    const hardWorkOnDeposit = vaultData?.hardWorkOnDeposit ? "YES" : "NO";

    const pageHardWorkOnDeposit = await page
      .getByTestId("hardWorkOnDeposit")
      .textContent();

    expect(pageHardWorkOnDeposit).toBe(hardWorkOnDeposit);

    /* Created should be displayed correctly in d/mm/yyyy format and */
    /* summarised days from deployment date                          */

    const date = getDate(Number(vaultData?.created));

    const createdData = {
      time: date,
      days: getTimeDifference(vaultData?.created)?.days,
    };

    const createdText = `${createdData?.time} / ${createdData?.days} days ago`;

    const pageVaultCreated = await page
      .getByTestId("vaultCreated")
      .textContent();

    expect(pageVaultCreated).toBe(createdText);

    /* Vault version should be displayed correctly based on it's contract version */

    if (vaultData?.version) {
      const pageVaultVersion = await page
        .getByTestId("vaultVersion")
        .textContent();

      expect(pageVaultVersion).toBe(vaultData?.version);
    }

    /* Vault NFT token ID should be displayed correctly */

    const pageVaultManagerID = await page
      .getByTestId("vaultManagerID")
      .textContent();

    expect(Number(pageVaultManagerID)).toBe(vaultData?.vaultManagerId);

    await page.goBack();
  }
});
