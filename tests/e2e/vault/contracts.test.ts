import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { getProtocolLogo } from "../../../src/utils/functions/getProtocolLogo";
import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";

import { getTokenData } from "../../helpers";

import { CHAINS, DEXes } from "@constants";

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

  await page.goto("/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test("Should display contracts info correctly", async ({ page }) => {
  test.setTimeout(500000);
  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='contractsLogo']");
    await page.waitForSelector("[data-testid='contractsSymbol']");
    await page.waitForSelector("[data-testid='contractsType']");

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const strategyAssets: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    const strategyInfo = getStrategyInfo(
      vaultData?.symbol,
      vaultData?.strategyId
    );

    const assets = strategyAssets.map((strategyAsset: string) => {
      const token = getTokenData(strategyAsset);
      if (token) {
        return {
          address: token?.address,
          logo: token?.logoURI,
          symbol: token?.symbol,
        };
      }
    });

    const isALM =
      vaultData?.alm &&
      ["Ichi", "DefiEdge", "Gamma"].includes(vaultData.alm.protocol);

    const isUnderlying = vaultData.strategyId === "Yearn";

    let underlyingToken = {};

    if (isALM || isUnderlying) {
      const logo = getProtocolLogo(vaultData.strategyShortId);

      underlyingToken = { symbol: vaultData.underlyingSymbol, logo: logo };
    }
    let contractsInfo: any = [];

    if (vaultData?.address) {
      contractsInfo = [
        {
          logo: "proportions",
          symbol: vaultData?.symbol,
          type: "Vault",
          address: vaultData?.address.toLowerCase(),
          isCopy: false,
        },
        {
          logo: "/logo.svg",
          symbol: vaultData.strategyShortId,
          type: "Strategy",
          address: vaultData?.strategy?.toLowerCase(),
          isCopy: false,
        },
      ];
      if (underlyingToken?.symbol) {
        contractsInfo.push({
          logo: underlyingToken?.logo,
          symbol: underlyingToken?.symbol,
          type: isALM ? "ALM" : "Underlying",
          address: vaultData?.underlying,
          isCopy: false,
        });
      }
      if (vaultData?.pool?.address) {
        const poolSymbol =
          assets.length > 1
            ? `${assets[0]?.symbol}-${assets[1]?.symbol}`
            : assets[0]?.symbol;

        const dexPool = DEXes.find((dex) =>
          strategyInfo.protocols.some((protocol) => protocol.name === dex.name)
        );

        contractsInfo.push({
          logo: dexPool?.img as string,
          symbol: poolSymbol,
          type: "Pool",
          address: vaultData?.pool?.address,
          isCopy: false,
        });
      }
      if (assets) {
        assets.map((asset) => {
          contractsInfo.push({
            logo: asset?.logo,
            symbol: asset?.symbol,
            type: "Asset",
            address: asset?.address,
            isCopy: false,
          });
        });
      }
    }

    if (contractsInfo.length) {
      for (let i = 0; i < contractsInfo.length; i++) {
        /* Row should contain logo, short title, one-word description, first and last part of it's address */
        const contractsLogoSrc = await page
          .locator('[data-testid="contractsLogo"] img')
          .nth(i)
          .getAttribute("src");

        const contractsSymbol = await page
          .getByTestId("contractsSymbol")
          .nth(i)
          .innerText();

        const contractsType = await page
          .getByTestId("contractsType")
          .nth(i)
          .innerText();

        const contractsAddress = await page
          .getByTestId("contractsAddress")
          .nth(i)
          .innerText();

        const address = `${contractsInfo[i].address.slice(0, 6)}...${contractsInfo[i].address.slice(-4)}`;
        let logo = contractsInfo[i].logo;

        if (contractsInfo[i].logo === "proportions") {
          logo =
            `https://api.stabilitydao.org/vault/${chainId}/${vaultData.address}/logo.svg`.toLowerCase();
        }
        expect(contractsLogoSrc).toBe(logo);
        expect(contractsSymbol).toBe(contractsInfo[i].symbol);
        expect(contractsType).toBe(contractsInfo[i].type);
        expect(contractsAddress).toBe(address);

        /* Copy CTA should works correctly and copy entire address */

        // await context.grantPermissions(["clipboard-read", "clipboard-write"]);

        // await page.getByTestId("contractCopyBtn").nth(i).click();

        // await page.waitForTimeout(3000);

        // const clipboardText = await page.evaluate(async () => {
        //   try {
        //     return await navigator.clipboard.readText();
        //   } catch (err) {
        //     return null;
        //   }
        // });

        // console.log(clipboardText?.toLowerCase(), contractsInfo[i].address);

        // expect(clipboardText?.toLowerCase()).toBe(contractsInfo[i].address);

        /* Open in new tab CTA should open corresponding chain scan website */
        /* with it's address                                                */

        const explorer =
          CHAINS.find((chain) => chain.id === chainId)?.explorer ||
          CHAINS[0].explorer;

        const link = `${explorer}${contractsInfo[i].address}`;

        const contractLinkBtn = await page
          .getByTestId("contractLinkBtn")
          .nth(i)
          .getAttribute("href");

        expect(contractLinkBtn).toBe(link);
      }
    }

    await page.goBack();
  }
});
