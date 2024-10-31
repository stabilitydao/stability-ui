import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";
import { formatNumber } from "../../../src/utils/functions/formatNumber";

import { CHAINS } from "@constants";

// Playwright doesn't work with json
const tokenlist = {
  name: "Stability Token List",
  logoURI: "https://stability.farm/logo.svg",
  keywords: [],
  timestamp: "2024-10-22T00:00:00+00:00",
  version: {
    major: 1,
    minor: 4,
    patch: 2,
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
    {
      chainId: 111188,
      address: "0x25ea98ac87A38142561eA70143fd44c4772A16b6",
      symbol: "MORE",
      name: "MORE",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/MORE.png",
      tags: ["stablecoin"],
    },
    {
      chainId: 111188,
      address: "0x83feDBc0B85c6e29B589aA6BdefB1Cc581935ECD",
      symbol: "USTB",
      name: "US T-Bill",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/USTB.png",
      tags: ["stablecoin"],
    },
    {
      chainId: 111188,
      address: "0xAEC9e50e3397f9ddC635C6c429C8C7eca418a143",
      symbol: "arcUSD",
      name: "arcUSD",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/arcUSD.png",
      tags: ["stablecoin"],
    },
    {
      chainId: 111188,
      address: "0x90c6E93849E06EC7478ba24522329d14A5954Df4",
      symbol: "WREETH",
      name: "Wrapped Real Ether",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/WREETH.png",
      tags: ["wNative"],
    },
    {
      chainId: 111188,
      address: "0xCE1581d7b4bA40176f0e219b2CaC30088Ad50C7A",
      symbol: "PEARL",
      name: "Pearl",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/PEARL.png",
    },
    {
      chainId: 111188,
      address: "0x4644066f535Ead0cde82D209dF78d94572fCbf14",
      symbol: "RWA",
      name: "re.al",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/RWA.png",
    },
    {
      chainId: 111188,
      address: "0xB08F026f8a096E6d92eb5BcbE102c273A7a2d51C",
      symbol: "CVR",
      name: "CAVIAR",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/CVR.png",
    },
    {
      chainId: 111188,
      address: "0x835d3E1C0aA079C6164AAd21DCb23E60eb71AF48",
      symbol: "UKRE",
      name: "UK Real Estate",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/UKRE.svg",
    },
    {
      chainId: 111188,
      address: "0x75d0cBF342060b14c2fC756fd6E717dFeb5B1B70",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 111188,
      address: "0x6B2e0fACD2F2A8f407aC591067Ac06b5d29247E4",
      symbol: "SACRA",
      name: "Sacra token",
      decimals: 18,
      logoURI: "https://www.pearl.exchange/tokens/SACRA.png",
    },
    {
      chainId: 111188,
      address: "0xc518A88c67CECA8B3f24c4562CB71deeB2AF86B7",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
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

test("Should display liquidity pool info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='vaultType']");
    await page.waitForSelector("[data-testid='vaultStatus']");

    const isLiquidityPool = await page.getByTestId("poolLogo").isVisible();

    if (!isLiquidityPool) {
      await page.goBack();
      continue;
    }

    const vaultAddress = page.url().slice(-42);

    const chainId = page.url().match(/\/vault\/(\d+)\//)?.[1] || "137";

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    const strategyInfo = getStrategyInfo(
      vaultData?.symbol,
      vaultData?.strategyId
    );

    const strategyAssets: string[] =
      vaultData?.assets?.map((asset: string) => asset.toLowerCase()) || [];

    const assets = strategyAssets.map((strategyAsset: string) => {
      const token = getTokenData(strategyAsset);

      if (token) {
        return {
          address: token?.address,
          symbol: token?.symbol,
        };
      }
    });

    const symbol =
      assets.length > 1
        ? `${assets[0]?.symbol}-${assets[1]?.symbol}`
        : assets[0]?.symbol;

    /* Logo, protocol name and tokens tickers should be displayed correctly */

    const poolLogo = await page.getByTestId("poolLogo").getAttribute("src");
    const poolName = await page.getByTestId("poolName").innerText();
    const poolSymbol = await page.getByTestId("poolSymbol").innerText();

    expect(poolLogo).toBe(
      vaultData?.strategyId === "Curve Convex Farm"
        ? strategyInfo.protocols[0].logoSrc
        : strategyInfo.protocols[1].logoSrc
    );
    expect(poolName).toBe(
      vaultData?.strategyId === "Curve Convex Farm"
        ? strategyInfo.protocols[0].name
        : strategyInfo.protocols[1].name
    );
    expect(poolSymbol).toBe(symbol);

    /* Pool TVL should be displayed correctly in USD */
    const TVL = String(formatNumber(vaultData.pool.tvl || 0, "abbreviate"));

    const poolTVL = await page.getByTestId("poolTVL").innerText();

    let lastChar = poolTVL[poolTVL.length - 1];

    const formattedPoolTVL = isNaN(Number(lastChar))
      ? Number(poolTVL.slice(1, -1))
      : Number(poolTVL.slice(1));

    lastChar = TVL[TVL.length - 1];

    const formattedTVL = isNaN(Number(lastChar))
      ? Number(TVL.slice(1, -1))
      : Number(TVL.slice(1));

    const isPoolTVL = isDifferenceWithinTenPercents(
      formattedTVL,
      formattedPoolTVL
    );

    expect(isPoolTVL).toBeTruthy();
    /* Pool tokens native amounts and ratio in pool in percents should be displayed correctly */

    if (prices[chainId]) {
      const poolAssets = assets.map((asset, index) => {
        const price = Number(prices[chainId][asset?.address].price);

        //@ts-ignore
        const amount = vaultData?.pool?.[`amountToken${index}`] || 0;

        const amountInUSD = price * amount;

        return {
          symbol: asset?.symbol,
          amountInUSD: amountInUSD,
          amount: amount,
        };
      });

      const vaultLiquidity = poolAssets.reduce(
        (acc, curr) => (acc += curr?.amountInUSD),
        0
      );

      const assetsWithPercents = poolAssets.map((asset) => {
        return {
          ...asset,
          percent: asset?.amountInUSD
            ? (asset?.amountInUSD / vaultLiquidity) * 100
            : 0,
        };
      });

      for (let i = 0; i < assetsWithPercents.length; i++) {
        const asset = await page.getByTestId(`poolAsset${i}`).innerText();

        const assetArr = asset.split(" ");

        const assetPercent = Number(assetArr[assetArr.length - 1].slice(1, -2));

        assetArr.pop();

        let assetAmount = Number(
          assetArr.reduce((acc, cur) => (acc += cur), "")
        );

        const isAssetAmount = isDifferenceWithinTenPercents(
          Number(assetsWithPercents[i].amount),
          assetAmount
        );

        const isAssetPercent = isDifferenceWithinTenPercents(
          assetsWithPercents[i]?.percent,
          assetPercent
        );

        expect(isAssetPercent).toBeTruthy();
        expect(isAssetAmount).toBeTruthy();
      }
    }

    /* Pool fee should be displayed correctly */
    if (vaultData?.pool?.fee) {
      const fee = `${vaultData?.pool?.fee}%`;

      const poolFee = await page.getByTestId("poolFee").innerText();

      expect(poolFee).toBe(fee);
    }
    await page.goBack();
  }
});
