import { test, expect } from "@playwright/test";

import { formatUnits } from "viem";

import axios from "axios";

import { getStrategyInfo } from "../../src/utils/functions/getStrategyInfo";

import { determineAPR } from "../../src/utils/functions/determineAPR";

import { formatNumber } from "../../src/utils/functions/formatNumber";

import { seeds } from "@stabilitydao/stability";

import { CHAINS, ZERO_BigInt, PAGINATION_VAULTS } from "@constants";

const calculateAPR = (almEntity: number, fee: number) => {
  return almEntity - (almEntity / 100) * fee;
};

const getDaysFromLastHardWork = (lastHardWork: number) => {
  const currentTime = Date.now() / 1000;
  const targetTime = Number(lastHardWork);
  const differenceInSeconds = currentTime - targetTime;
  return Math.floor(differenceInSeconds / (60 * 60 * 24));
};

const SEARCH_VALUES = {
  valid: "WMATIC",
  invalidByNumber: String(Math.random()),
  invalidByLaguage: "вматик",
};

const NETWORKS: string[] = ["Polygon", "Base", "Re.al"];

const STRATEGIES: string[] = [
  "GRMF",
  "Y",
  "IQMF",
  "TPF",
  "GUMF",
  "QSMF",
  "CF",
  "DQMF",
  "IRMF",
  "CCF",
  "GQMF",
].sort();

const STABLECOIN_SYMBOLS = ["USD", "DAI", "MORE", "USTB"];

const SORT_CASES = [
  { name: "SYMBOL", queue: 0, dataType: "text" },
  { name: "ASSETS", queue: 1, dataType: "text" },
  { name: "INCOME APR", queue: 3, dataType: "APR" },
  { name: "VS HOLD APR", queue: 4, dataType: "APR" },
  { name: "TVL", queue: 6, dataType: "withFormat" },
];

const LINKS: string[] = [
  "https://github.com/stabilitydao",
  "https://twitter.com/stabilitydao",
  "https://t.me/stabilitydao",
  "https://discord.com/invite/R3nnetWzC9",
  "https://stabilitydao.gitbook.io/",
];

const PORTFOLIO_VALUES: string[] = [
  "Deposited",
  "Daily",
  "Monthly",
  "APR",
  "APY",
];

let allVaults: any[] = [];

test.beforeEach(async ({ page }) => {
  try {
    const response = await axios.get(seeds[0]);

    const vaultsData = response.data?.vaults || {};

    const underlyings = response.data?.underlyings || {};

    allVaults = await Promise.all(
      CHAINS.map(async (chain) => {
        const chainVaults = vaultsData[chain?.id] || {};
        return Object.values(chainVaults).map((vault) => ({
          ...vault,
          underlyingData:
            underlyings[chain?.id][vault?.underlying.toLowerCase()],
        }));
      })
    );

    allVaults = allVaults.flat().map((vault) => ({
      ...vault,
      sharePrice:
        !Number(vault.sharePrice) && !Number(vault.tvl)
          ? "1"
          : vault.sharePrice,
    }));
  } catch (error) {
    throw new Error(`API Error: ${error}`);
  }

  await page.goto("/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test.describe("Vaults page tests", () => {
  test("logo and vaults tab is clickable and refers to main page", async ({
    page,
  }) => {
    const ids = ["stability-logo", "vaults-link"];

    for (const id of ids) {
      await page.getByTestId(id).click();

      await page.waitForLoadState("load");

      const isCorrectPageURL =
        page.url() === "https://stability.farm/" ||
        page.url() === "http://localhost:4321/";

      expect(isCorrectPageURL).toBeTruthy();
    }
  });
  test("should be active vaults", async ({ page }) => {
    await page.waitForSelector("[data-testid='vault']");

    const activeVaults = await page.getByTestId("vault").count();

    await expect(activeVaults).toBe(PAGINATION_VAULTS);
  });

  test("should be hide portfolio data", async ({ page }) => {
    await page.getByTestId("visibleSwitcher").click();

    let allValuesAreMasked = true;

    for (const value of PORTFOLIO_VALUES) {
      const portfolioValue = await page
        .getByTestId(`portfolio${value}`)
        .textContent();

      if (portfolioValue !== "****") {
        allValuesAreMasked = false;
      }
    }

    await expect(allValuesAreMasked).toBeTruthy();
  });

  test("should be change APR by latest/24h/7d", async ({ page }) => {
    const APRTimeSwitcher = await page.getByTestId("APRTimeSwitcher").first();
    const APRTypes = await page.getByTestId("APRType");
    const vaults = await page.getByTestId("vault");
    const vaultsCount = await vaults.count();

    const vaultsWithAPR = allVaults.map((vault) => {
      const daysFromLastHardWork = getDaysFromLastHardWork(vault.lastHardWork);
      const almRebalanceEntity = vault.almRebalanceRawData?.[0]?.map(BigInt);
      const fee = vault?.almFee?.income || 0;

      let APR = "0";
      let APRArray = { latest: "0", daily: "0", weekly: "0" };

      if (daysFromLastHardWork < 3) {
        let dailyFarmApr = Number(vault.apr?.income24h || 0);
        let weeklyFarmApr = Number(vault.apr?.incomeWeek || 0);
        let dailyAPR = 0;
        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;

        if (vault.underlyingData) {
          dailyAPR = Number(vault.underlyingData.apr?.daily || 0);
          poolSwapFeesAPRDaily = dailyAPR;
          poolSwapFeesAPRWeekly =
            vault.underlyingData.apr?.weekly ||
            vault.underlyingData.apr?.monthly ||
            0;
        }

        const strategyInfo = getStrategyInfo(vault?.symbol, vault.strategyId);
        const strategyName = strategyInfo?.shortId;

        if (["IQMF", "IRMF"].includes(strategyName)) {
          const alm0 = Number(
            formatUnits(almRebalanceEntity?.[0] || ZERO_BigInt, 8)
          );
          const alm1 = Number(
            formatUnits(almRebalanceEntity?.[1] || ZERO_BigInt, 8)
          );
          const alm2 = Number(
            formatUnits(almRebalanceEntity?.[2] || ZERO_BigInt, 8)
          );

          poolSwapFeesAPRDaily = calculateAPR(alm0, fee);
          poolSwapFeesAPRWeekly = calculateAPR(alm2, fee);
          dailyAPR = calculateAPR(alm1, fee);
        }

        APR = (Number(vault?.apr?.incomeLatest) + dailyAPR).toFixed(2);
        const dailyTotalAPRWithFees = poolSwapFeesAPRDaily + dailyFarmApr;
        const weeklyTotalAPRWithFees = poolSwapFeesAPRWeekly + weeklyFarmApr;

        APRArray = {
          latest: APR,
          daily: determineAPR(vault.apr?.income24h, dailyTotalAPRWithFees, APR),
          weekly: determineAPR(
            vault.apr?.incomeWeek,
            weeklyTotalAPRWithFees,
            APR
          ),
        };
      }

      return { ...vault, almRebalanceEntity, daysFromLastHardWork, APRArray };
    });

    const incomeLatestAPRs: number[] = vaultsWithAPR.map(({ APRArray }) =>
      Number(Number(APRArray.latest).toFixed(2))
    );
    const income24hAPRs: number[] = vaultsWithAPR.map(({ APRArray }) =>
      Number(Number(APRArray.daily).toFixed(2))
    );
    const incomeWeekAPRs: number[] = vaultsWithAPR.map(({ APRArray }) =>
      Number(Number(APRArray.weekly).toFixed(2))
    );

    const allAPRs = [incomeLatestAPRs, income24hAPRs, incomeWeekAPRs];

    const checkAPR = async (i: number, currentArr: number[]) => {
      await APRTimeSwitcher.click();
      await page.waitForTimeout(500);

      await APRTypes.nth(i).click();
      await page.waitForTimeout(500);

      let isCorrectly = true;

      for (let j = 0; j < vaultsCount; j++) {
        const vault = vaults.nth(j);
        const value = await vault
          .locator("td")
          .nth(3)
          .locator("p")
          .first()
          .textContent();

        const aprValue = Number(Number(value?.slice(0, -1)).toFixed(2));
        if (!currentArr.includes(aprValue)) {
          isCorrectly = false;
        }
      }

      expect(isCorrectly).toBeTruthy();
    };

    for (let i = 0; i < allAPRs.length; i++) {
      await checkAPR(i, allAPRs[i]);
    }
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
    await page.waitForTimeout(5000);

    const networks = await page.getByTestId("network");
    const networksCount = await networks.count();

    const currentNetworks = [];

    for (let i = 0; i < networksCount; i++) {
      const networkName = await networks.nth(i).getAttribute("title");

      currentNetworks.push(networkName);
    }

    // to be all networks
    await expect(currentNetworks).toEqual(NETWORKS);

    for (let i = 0; i < NETWORKS.length; i++) {
      await networks.nth(i).click();
      if (i) await networks.nth(i - 1).click();

      await page.waitForTimeout(3000);

      const vaults = await page.getByTestId("vault");
      const vaultsCount = await vaults.count();

      let networkVaultsCount = 0;

      for (let j = 0; j < vaultsCount; j++) {
        const vault = vaults.nth(j);

        const name = await vault
          .locator("td")
          .nth(0)
          .getByRole("img")
          .nth(0)
          .getAttribute("alt");

        if (name === NETWORKS[i]) {
          networkVaultsCount++;
        }
      }

      await expect(networkVaultsCount).toEqual(vaultsCount);
    }
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
        .every((asset) =>
          STABLECOIN_SYMBOLS.some((symbol) => asset.includes(symbol))
        );

      if (isStablecoins) stablecoinsVaultsCount++;
    }

    await expect(stablecoinsVaultsCount).toEqual(vaultsCount);
  });

  test("should be all strategy filters", async ({ page }) => {
    const strategiesCount = await page.getByTestId("strategy").count();

    const dropdownStrategies = [];

    for (let i = 0; i < strategiesCount; i++) {
      const strategy = await page.getByTestId("strategy").nth(i).textContent();

      dropdownStrategies.push(strategy);
    }

    expect(dropdownStrategies.sort()).toEqual(STRATEGIES);
    expect(strategiesCount).toBe(STRATEGIES.length);
  });

  test("should be filter by strategy", async ({ page }) => {
    const strategiesCount = await page.getByTestId("strategy").count();

    for (let i = 0; i < strategiesCount; i++) {
      const strategyName = await page
        .getByTestId("strategy")
        .nth(i)
        .textContent();

      await page.getByTestId("strategyFilterDropdown").click();
      await page.waitForTimeout(500);

      await page.getByTestId("strategy").nth(i).click();
      await page.waitForTimeout(500);

      const vaults = await page.getByTestId("vault");
      const vaultsCount = await vaults.count();

      let strategyVaultsCount = 0;

      for (let i = 0; i < vaultsCount; i++) {
        const vault = vaults.nth(i);

        const symbol = await vault.locator("td").first().textContent();

        if (strategyName === symbol?.slice(-strategyName?.length))
          strategyVaultsCount++;
      }
      await expect(strategyVaultsCount).toEqual(vaultsCount);
    }
  });

  test("should be sort", async ({ page }) => {
    const allSorts = await page.getByTestId("sort");

    let isSortedCorrectly;

    for (const { name, queue, dataType } of SORT_CASES) {
      for (const sortOrder of ["desc", "asc"]) {
        const sortCol = await allSorts.nth(queue);

        await sortCol.click();
        await sortCol.waitFor();

        const vaults = await page.getByTestId("vault");
        const vaultsCount = await vaults.count();

        const formattedValues = [];

        switch (dataType) {
          case "text":
            for (let i = 0; i < vaultsCount; i++) {
              let value = "";
              const vault = vaults.nth(i);
              if (name === "SYMBOL") {
                value =
                  (await vault
                    .locator("td")
                    .nth(queue)
                    .locator("p")
                    .first()
                    .textContent()) || "";
              }
              if (name === "ASSETS") {
                value =
                  (await vault
                    .locator("td")
                    .nth(queue)
                    .locator("span")
                    .first()
                    .textContent()) || "";
              }

              formattedValues.push(value);
            }
            break;
          case "APR":
            for (let i = 0; i < vaultsCount; i++) {
              const vault = vaults.nth(i);

              let value = await vault
                .locator("td")
                .nth(queue)
                .locator("p")
                .first()
                .textContent();

              if (value === "-") value = "0%";

              const formattedValue = Number(value?.slice(0, -1));

              if (!isNaN(formattedValue)) {
                formattedValues.push(formattedValue);
              } else {
                throw new Error(`Invalid APR: ${formattedValue}`);
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

        if (dataType === "text") {
          isSortedCorrectly = formattedValues.every((value, index, array) => {
            return (
              index === 0 ||
              (sortOrder === "desc"
                ? array[index - 1]?.localeCompare(value) >= 0
                : array[index - 1]?.localeCompare(value) <= 0)
            );
          });
        } else {
          isSortedCorrectly = formattedValues.every((value, index, array) => {
            return (
              index === 0 ||
              (sortOrder === "desc"
                ? array[index - 1] >= value
                : array[index - 1] <= value)
            );
          });
        }

        await expect(isSortedCorrectly).toBeTruthy();
      }
    }
  });

  test("should be share price", async ({ page }) => {
    const pageSharePrices = await page.getByTestId("sharePrice");
    const pageSharePricesCount = await pageSharePrices.count();

    const APISharePrices = allVaults.map((vault) =>
      Number(Number(vault.sharePrice).toFixed(3))
    );

    let isCorrectSharePrices = true;

    for (let i = 0; i < pageSharePricesCount; i++) {
      const sharePrice = (await pageSharePrices.nth(i).textContent())?.slice(1);

      if (!APISharePrices?.includes(Number(sharePrice)))
        isCorrectSharePrices = false;
    }

    expect(isCorrectSharePrices).toBeTruthy();
  });

  test("should be correct footer links", async ({ page }) => {
    for (let i = 0; i < LINKS.length; i++) {
      const href = await page.locator("footer a").nth(i).getAttribute("href");

      expect(href).toBe(LINKS[i]);
    }
  });
});

// test("should be tvl", async ({ page }) => {
//   try {
//     const TVLs = allVaults.map((vault) => vault.tvl);

//     const totalTVL = TVLs.reduce((acc, tvl) => acc + Number(tvl), 0);

//     const formattedTVL = formatNumber(totalTVL, "abbreviate");

//     await page.waitForSelector("[data-testid='tvl']");

//     const pageTVL = await page.getByTestId("tvl").textContent();

//     expect(pageTVL).toBe(formattedTVL);
//   } catch (error) {
//     console.error("Error fetching or processing data:", error);
//   }
// });
