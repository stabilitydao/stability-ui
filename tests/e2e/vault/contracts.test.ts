import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { getProtocolLogo } from "../../../src/utils/functions/getProtocolLogo";
import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";

import { CHAINS, DEXes } from "@constants";

// Playwright doesn't work with json
const tokenlist = {
  name: "Stability Token List",
  logoURI: "https://stability.farm/logo.svg",
  keywords: [],
  timestamp: "2024-06-28T00:00:00+00:00",
  version: {
    major: 1,
    minor: 3,
    patch: 0,
  },
  tags: {
    stablecoin: {
      name: "Stablecoin",
      description:
        "Tokens that are fixed to an external asset, e.g. the US dollar",
    },
    bridged: {
      name: "Bridged",
      description: "Tokens that are bridged to current chain from another",
    },
    lst: {
      name: "Liquid Staking",
      description: "Liquid staking token",
    },
    wNative: {
      name: "Wrapped native coin",
      description:
        "WETH9 or similar contract for wrapping native coin to ERC20 token",
    },
  },
  tokens: [
    {
      chainId: 137,
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      symbol: "USDC.e",
      name: "Bridged USDC",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 137,
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 137,
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      symbol: "USDT",
      name: "(PoS) Tether USD",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 137,
      address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 137,
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      symbol: "WMATIC",
      name: "Wrapped Matic",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/polygon.jpg",
      tags: ["wNative"],
    },
    {
      chainId: 137,
      address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/eth.jpg",
      tags: ["bridged"],
    },
    {
      chainId: 137,
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      symbol: "WBTC",
      name: "(PoS) Wrapped BTC",
      decimals: 8,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/btc.jpg",
      tags: ["bridged"],
    },
    {
      chainId: 137,
      address: "0x48469a0481254d5945e7e56c1eb9861429c02f44",
      symbol: "PROFIT",
      name: "Stability",
      decimals: 18,
      logoURI: "https://stabilitydao.org/profit.png",
    },
    {
      chainId: 137,
      address: "0x9844a1c30462b55cd383a2c06f90bb4171f9d4bb",
      symbol: "SDIV",
      name: "Stability Dividend",
      decimals: 18,
      logoURI: "https://stabilitydao.org/SDIV.svg",
    },
    {
      chainId: 137,
      address: "0xc4ce1d6f5d98d65ee25cf85e9f2e9dcfee6cb5d6",
      symbol: "crvUSD",
      name: "Curve.Fi USD",
      decimals: 18,
      logoURI: "https://polygonscan.com/token/images/crvusd_32.png",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 8453,
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/eth.jpg",
      tags: ["wNative"],
    },
    {
      chainId: 8453,
      address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
      symbol: "wstETH",
      name: "Wrapped Liquid Staked Ether 2.0",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/wsteth.jpg",
      tags: ["lst", "bridged"],
    },
    {
      chainId: 8453,
      address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      symbol: "cbETH",
      name: "Coinbase Wrapped Staked ETH",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/network/ethereum/0xBe9895146f7AF43049ca1c1AE358B0541Ea49704.jpg",
      tags: ["lst"],
    },
    {
      chainId: 8453,
      address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 8453,
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      name: "USDC",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 8453,
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      symbol: "USDbC",
      name: "USD Base Coin",
      decimals: 6,
      logoURI: "https://basescan.org/token/images/usdbc_ofc_32.png",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 8453,
      address: "0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93",
      symbol: "crvUSD",
      name: "Curve.Fi USD",
      decimals: 18,
      logoURI: "https://polygonscan.com/token/images/crvusd_32.png",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 8453,
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin", "bridged"],
    },
  ],
};

const getTokenData = (address: string): any => {
  for (const token of tokenlist.tokens) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return {
        address: token.address.toLowerCase(),
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token?.tags,
      };
    }
  }
  return undefined;
};

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

test("Should display contracts info correctly", async ({ page, context }) => {
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

    const isUnderlying = vaultData.strategy === "Yearn";

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

        await context.grantPermissions(["clipboard-read", "clipboard-write"]);

        await page.getByTestId("contractCopyBtn").nth(i).click();
        await page.waitForTimeout(3000);

        const clipboardText = await page.evaluate(async () => {
          try {
            return await navigator.clipboard.readText();
          } catch (err) {
            return null;
          }
        });

        expect(clipboardText?.toLowerCase()).toBe(contractsInfo[i].address);

        /* Open in new tab CTA should open corresponding chain scan website */
        /* with it's address                                                */

        const link =
          chainId === "137"
            ? `https://polygonscan.com/address/${contractsInfo[i].address}`
            : `https://basescan.org/address/${contractsInfo[i].address}`;

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
