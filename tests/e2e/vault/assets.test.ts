import { test, expect } from "@playwright/test";

import axios from "axios";

import { formatUnits } from "viem";

import { seeds, getAsset } from "@stabilitydao/stability";

import { formatNumber } from "../../../src/utils/functions/formatNumber";
import { getDate } from "../../../src/utils/functions/getDate";

import { CHAINS, CHAINLINK_STABLECOINS } from "@constants";

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

const isDifferenceWithinTenPercents = (num1: number, num2: number): boolean => {
  const larger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);

  const difference = Math.abs(larger - smaller);
  const twentyPercentOfLarger = Math.abs(larger * 0.2);

  return difference <= twentyPercentOfLarger;
};

let allVaults: any[] = [];
let prices: any = {};

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
    prices = response.data?.assetPrices;
  } catch (error) {
    throw new Error(`API Error: ${error}`);
  }

  await page.goto("/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
});

test("Should display assets info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='assetLogo0']");

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const assetSymbols: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    const assetDetails = assetSymbols.map((symbol: string) => {
      const tokenData = getTokenData(symbol);
      if (tokenData) {
        const tokenExtended = getAsset(chainId, tokenData.address);
        return {
          address: tokenData?.address,
          logo: tokenData?.logoURI,
          symbol: tokenData?.symbol,
          name: tokenData?.name,
          website: tokenExtended?.website,
          description: tokenExtended?.description,
        };
      }
    });

    for (let assetIndex = 0; assetIndex < assetDetails.length; assetIndex++) {
      const asset = assetDetails[assetIndex];

      /* Token(s) logo, ticker, full name and link to official website should be displayed correctly */

      const assetLogoSrc = await page
        .getByTestId(`assetLogo${assetIndex}`)
        .getAttribute("src");
      const assetTicker = await page
        .getByTestId(`assetTicker${assetIndex}`)
        .textContent();
      const assetName = await page
        .getByTestId(`assetName${assetIndex}`)
        .textContent();

      if (asset?.website) {
        const assetWebsiteLink = await page
          .getByTestId(`assetWebsite${assetIndex}`)
          .getAttribute("href");
        expect(assetWebsiteLink).toBe(asset?.website);
      }

      expect(assetLogoSrc).toBe(asset?.logo);
      expect(assetTicker).toBe(asset?.symbol);
      expect(assetName).toBe(asset?.name);

      /* Token(s) current price and price on a moment of vault creation should be displayed in USD */

      const displayedPrice = await page
        .getByTestId(`assetPrice${assetIndex}`)
        .textContent();
      const formattedDisplayedPrice = Number(
        displayedPrice?.slice(1).split(" ").join("")
      );

      const creationPrice = await page
        .getByTestId(`assetPriceOnCreation${assetIndex}`)
        .textContent();
      const vaultCreationDate = getDate(Number(vaultData.created));

      const currentPrice = prices[chainId][asset?.address]
        ? Number(prices[chainId][asset?.address].price)
        : 0;

      const priceAtCreation = formatUnits(
        BigInt(vaultData.assetsPricesOnCreation[assetIndex]),
        18
      );
      const formattedCreationPrice = `$${formatNumber(priceAtCreation, "smallNumbers")} (${vaultCreationDate})`;

      const isCurrentPrice = isDifferenceWithinTenPercents(
        formattedDisplayedPrice,
        currentPrice
      );

      expect(isCurrentPrice).toBeTruthy();

      expect(creationPrice).toBe(formattedCreationPrice);

      /* Token(s) description should be displayed */

      const tokenDescriptionText = await page
        .getByTestId(`tokenDescription${assetIndex}`)
        .innerText();
      expect(tokenDescriptionText).toBe(asset?.description);

      /* If price feed provided by oracle - oracle label should be displayed */

      const oracleLink =
        CHAINLINK_STABLECOINS[
          asset?.symbol as keyof typeof CHAINLINK_STABLECOINS
        ];

      if (oracleLink) {
        const trustedOracleLink = await page
          .getByTestId(`trustedToken${assetIndex}`)
          .getAttribute("href");
        expect(trustedOracleLink).toBe(oracleLink);
      }
    }

    await page.goBack();
  }
});
