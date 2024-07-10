import { test, expect } from "@playwright/test";

const CURRENT_ACTIVE_VAULTS = 19;

const SEARCH_VALUES = {
  valid: "WMATIC",
  invalidByNumber: String(Math.random()),
  invalidByLaguage: "вматик",
};

const NETWORKS = ["Polygon", "Base"];

const STRATEGY = "Y";

const SORT_CASES = [
  { name: "INCOME APR", queue: 3, dataType: "APR" },
  { name: "VS HOLD APR", queue: 4, dataType: "APR" },
  { name: "PRICE", queue: 6, dataType: "withCurrency" },
  { name: "TVL", queue: 7, dataType: "withFormat" },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test.describe("Vaults page tests", () => {
  test("should be active vaults", async ({ page }) => {
    await page.waitForSelector("[data-testid='vault']");

    const activeVaults = await page.getByTestId("vault").count();

    await expect(activeVaults).toBe(CURRENT_ACTIVE_VAULTS);
  });

  test("should be search", async ({ page }) => {
    const search = await page.getByPlaceholder("Search");

    await search.fill(SEARCH_VALUES.valid);
    await search.waitFor();

    const vaults = await page.getByTestId("vault");
    const vaultsCount = await vaults.count();

    const searchResult = [];

    for (let i = 0; i < vaultsCount; i++) {
      const vault = vaults.nth(i);
      const symbolTd = await vault.locator("td").nth(0).innerText();
      const assetsTd = await vault.locator("td").nth(1).innerText();

      if (
        symbolTd.includes(SEARCH_VALUES.valid) ||
        assetsTd.includes(SEARCH_VALUES.valid)
      ) {
        searchResult.push(symbolTd);
      }
    }

    await expect(searchResult.length).toBe(vaultsCount);

    await search.fill(SEARCH_VALUES.invalidByLaguage);
    await search.waitFor();

    let vaultsAfterInvalidSearch = await page.getByTestId("vault").count();

    await expect(vaultsAfterInvalidSearch).toBe(0);

    await search.fill(SEARCH_VALUES.invalidByNumber);
    await search.waitFor();

    vaultsAfterInvalidSearch = await page.getByTestId("vault").count();

    await expect(vaultsAfterInvalidSearch).toBe(0);
  });

  test("should be filter by network", async ({ page }) => {
    const networks = await page.getByTestId("network");
    const networksCount = await networks.count();

    const currentNetworks = [];

    for (let i = 0; i < networksCount; i++) {
      const networkName = await networks.nth(i).getAttribute("title");

      currentNetworks.push(networkName);
    }

    // to be all networks
    await expect(currentNetworks).toEqual(NETWORKS);

    await networks.nth(1).click();
    // await networks.waitFor();

    const vaults = await page.getByTestId("vault");
    const vaultsCount = await vaults.count();

    let baseVaultsCount = 0;

    for (let i = 0; i < vaultsCount; i++) {
      const vault = vaults.nth(i);

      const name = await vault
        .locator("td")
        .nth(0)
        .getByRole("img")
        .nth(0)
        .getAttribute("alt");

      if (name === NETWORKS[1]) {
        baseVaultsCount++;
      }
    }

    // to be filtred by "Base" network
    await expect(baseVaultsCount).toEqual(vaultsCount);
  });

  test("should be filter by stablecoins", async ({ page }) => {
    const stablecoinsFilter = await page.getByTestId("filter").first();

    await stablecoinsFilter.click();
    await stablecoinsFilter.waitFor();

    const vaults = await page.getByTestId("vault");
    const vaultsCount = await vaults.count();

    let stablecoinsVaultsCount = 0;

    for (let i = 0; i < vaultsCount; i++) {
      const vault = vaults.nth(i);

      const assets = await vault.locator("td").nth(1).textContent();

      const isStablecoins = assets
        ?.split("+")
        .every((asset) => asset.includes("USD") || asset.includes("DAI"));

      if (isStablecoins) stablecoinsVaultsCount++;
    }

    await expect(stablecoinsVaultsCount).toEqual(vaultsCount);
  });

  test("should be filter by strategy", async ({ page }) => {
    const strategyFilter = await page.getByTestId("filter").nth(1);

    await strategyFilter.click();
    await page.waitForTimeout(1000);

    const firstStrategySelector = await page.getByTestId("strategy").first();

    await firstStrategySelector.click();
    await page.waitForTimeout(1000);

    const vaults = await page.getByTestId("vault");
    const vaultsCount = await vaults.count();

    let strategyVaultsCount = 0;

    for (let i = 0; i < vaultsCount; i++) {
      const vault = vaults.nth(i);

      const symbol = await vault.locator("td").first().textContent();

      if (STRATEGY === symbol?.slice(-1)) strategyVaultsCount++;
    }
    // to be filtred by "Y" strategy
    await expect(strategyVaultsCount).toEqual(vaultsCount);
  });
  // maybe add "my vaults" test
  // add "active" test, after icons

  // only "income apr", "vs hold apr","price" and "tvl" by descendent
  test("should be sort", async ({ page }) => {
    const allSorts = await page.getByTestId("sort");

    let vaults, vaultsCount, isDescendent;

    for (const { name, queue, dataType } of SORT_CASES) {
      const sortCol = await allSorts.nth(queue);

      await sortCol.click();
      await sortCol.waitFor();

      vaults = await page.getByTestId("vault");
      vaultsCount = await vaults.count();

      const formattedValues = [];

      switch (dataType) {
        case "APR":
          for (let i = 0; i < vaultsCount; i++) {
            const vault = vaults.nth(i);

            const value = await vault
              .locator("td")
              .nth(queue)
              .locator("p")
              .first()
              .textContent();

            const formattedValue = Number(value?.slice(0, -1));

            if (!isNaN(formattedValue)) {
              formattedValues.push(formattedValue);
            } else {
              throw new Error(`Invalid value: ${formattedValue}`);
            }
          }
          break;
        case "withCurrency":
          for (let i = 0; i < vaultsCount; i++) {
            const vault = vaults.nth(i);

            const vsHoldTdCount = await vault
              .getByTestId("vsHoldAPRTable")
              .locator("td")
              .count();

            const price = await vault
              .locator("td")
              .nth(queue + vsHoldTdCount)
              .textContent();

            const formattedPrice = Number(price?.slice(1));

            if (!isNaN(formattedPrice)) {
              formattedValues.push(formattedPrice);
            } else {
              throw new Error(`Invalid price value: ${price}`);
            }
          }
          break;
        case "withFormat":
          for (let i = 0; i < vaultsCount; i++) {
            const vault = vaults.nth(i);

            const vsHoldTdCount = await vault
              .getByTestId("vsHoldAPRTable")
              .locator("td")
              .count();

            const TVL = await vault
              .locator("td")
              .nth(queue + vsHoldTdCount)
              .textContent();

            let formattedTVL = TVL?.slice(1)?.includes("K")
              ? Number(TVL?.slice(1, -1)) * 1000
              : Number(TVL?.slice(1));

            if (!isNaN(formattedTVL)) {
              formattedValues.push(formattedTVL);
            } else {
              throw new Error(`Invalid TVL value: ${TVL}`);
            }
          }
          break;
        default:
          throw new Error(`Invalid data type: ${dataType}`);
      }

      isDescendent = formattedValues.every((value, index, array) => {
        return index === 0 || array[index - 1] >= value;
      });

      await expect(isDescendent).toBeTruthy();
    }
  });
});
