import { test, expect } from "@playwright/test";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import { formatNumber } from "../../../src/utils/functions/formatNumber";
import { getStrategyInfo } from "../../../src/utils/functions/getStrategyInfo";
import { getTimeDifference } from "../../../src/utils/functions/getTimeDifference";

import { CHAINS } from "@constants";

// Playwright doesn't work with json
const tokenlist = {
  name: "Stability Token List",
  logoURI: "https://stability.farm/logo.svg",
  keywords: [],
  timestamp: "2024-11-03T18:30:00+00:00",
  version: {
    major: 1,
    minor: 5,
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
      chainId: 1,
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 1,
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 1,
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 1,
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/btc.jpg",
    },
    {
      chainId: 1,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped ETH",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/eth.jpg",
      tags: ["wNative"],
    },
    {
      chainId: 137,
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      symbol: "USDC",
      name: "USD Coin (PoS)",
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
      name: "(PoS) Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 137,
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      symbol: "WPOL",
      name: "Wrapped Polygon Ecosystem Token",
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
      name: "Curve.Fi USD Stablecoin(PoS)",
      decimals: 18,
      logoURI: "https://polygonscan.com/token/images/crvusd_32.png",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 137,
      address: "0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD",
      symbol: "wstETH",
      name: "Wrapped liquid staked Ether 2.0 (PoS)",
      decimals: 18,
      logoURI: "https://polygonscan.com/token/images/wsteth_32.png",
      tags: ["bridged"],
    },
    {
      chainId: 42161,
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      symbol: "USDC",
      name: "USD Coin (Arb1)",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 42161,
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin"],
    },
    {
      chainId: 42161,
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 42161,
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 42161,
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/eth.jpg",
      tags: ["bridged"],
    },
    {
      chainId: 42161,
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/btc.jpg",
      tags: ["bridged"],
    },
    {
      chainId: 42420,
      address: "0x2B7C1342Cc64add10B2a79C8f9767d2667DE64B2",
      symbol: "USDC",
      name: "Bridged USDC (Asset Chain)",
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 42420,
      address: "0x26E490d30e73c36800788DC6d6315946C4BbEa24",
      symbol: "USDT",
      name: "Tether USD (Bridged)",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg",
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 42420,
      address: "0xDBDc8c7B96286899aB624F6a59dd0250DD4Ce9bC",
      symbol: "BTC",
      name: "Bitlayer Bitcoin (Bridged)",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/btc.jpg",
      tags: ["bridged"],
    },
    {
      chainId: 42420,
      address: "0xbe231A8492487aAe6096278A97050FAe6B9d5BEc",
      symbol: "WETH",
      name: "Wrapped Ether (Bridged)",
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/eth.jpg",
      tags: ["bridged"],
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
      name: "Wrapped liquid staked Ether 2.0",
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
      tags: ["stablecoin", "bridged"],
    },
    {
      chainId: 8453,
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      name: "USD Coin",
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
      name: "Curve.Fi USD Stablecoin",
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

let allVaults: any[] = [];

const isDifferenceWithinTenPercents = (num1: number, num2: number): boolean => {
  const larger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);

  const difference = Math.abs(larger - smaller);
  const twentyPercentOfLarger = Math.abs(larger * 0.2);

  return difference <= twentyPercentOfLarger;
};

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

test("Should display basic info correctly", async ({ page }) => {
  test.setTimeout(500000);

  await page.waitForSelector("[data-testid='vault']");

  const vaultsCount = await page.getByTestId("vault").count();

  for (let vaultIndex = 0; vaultIndex < vaultsCount; vaultIndex++) {
    await page.getByTestId("vault").nth(vaultIndex).click();

    await page.waitForSelector("[data-testid='infoBarHeader']");

    const vaultAddress = page.url().slice(-42);

    const vaultData = allVaults.find(
      ({ address }) => address.toLowerCase() === vaultAddress
    );

    /* Vault symbol should display correctly */
    const infoBarHeader = await page.getByTestId("infoBarHeader").innerText();

    const isVaultSymbol = infoBarHeader.includes(vaultData.symbol);

    expect(isVaultSymbol).toBeTruthy();

    /* Vault type should display correctly */
    const barVaultType = await page.getByTestId("infoBarVaultType").innerText();

    const APIVaultType = vaultData.vaultType.toLowerCase();

    expect(barVaultType.toLowerCase()).toBe(APIVaultType);

    /* Assets should display correctly */
    // const logoDiv = await page.getByTestId("infoBarAssetsLogo");

    // const imgElements = await logoDiv.locator("img");

    // const imgCount = await imgElements.count();

    // for (let i = 0; i < imgCount; i++) {
    //   const imgSrc = await imgElements.nth(i).getAttribute("title");

    //   const tokenSymbol = getTokenData(vaultData.assets[i]).symbol;

    //   expect(imgSrc).toBe(tokenSymbol);
    // }

    /* Strategies should display correctly */
    const strategyesLogo = await page.getByTestId("infoBarStrategyesLogo");

    const strategyesImg = await strategyesLogo.locator("img");

    const strategyesCount = await strategyesImg.count();

    const strategyInfo = getStrategyInfo(
      vaultData?.symbol,
      vaultData.strategyId
    );

    for (let i = 0; i < strategyesCount; i++) {
      const imgSrc = await strategyesImg.nth(i).getAttribute("title");

      expect(imgSrc).toBe(strategyInfo.protocols[i].name);
    }
    /* Income APR should be displayed correctly */
    const incomeAPR = await page.getByTestId("infoBarAPR").innerText();

    // todo: income apr + period

    /* VS HODL APR should be displayed correctly */
    // const vsHodlAPR = (
    //   await page.getByTestId("infoBarVSHodlAPR").innerText()
    // ).slice(0, -1);

    // const lifetimeVsHoldAPR =
    //   vaultData.apr?.vsHoldLifetime &&
    //   getTimeDifference(vaultData.created)?.days >= 3
    //     ? Number(vaultData.apr?.vsHoldLifetime).toFixed(2)
    //     : 0;

    // expect(Number(vsHodlAPR)).toBe(Number(lifetimeVsHoldAPR));

    // /* TVL should be displayed correctly per vault */
    const vaultTVL = await page.getByTestId("infoBarTVL").innerText();

    let lastChar = vaultTVL[vaultTVL.length - 1];

    const formattedTVL = isNaN(Number(lastChar))
      ? Number(vaultTVL.slice(1, -1))
      : Number(vaultTVL.slice(1));

    const totalTVL = String(formatNumber(vaultData.tvl, "abbreviate"));

    lastChar = totalTVL[totalTVL.length - 1];

    const formattedTotalTVL = isNaN(Number(lastChar))
      ? Number(totalTVL.slice(1, -1))
      : Number(totalTVL.slice(1));

    const isTVL = isDifferenceWithinTenPercents(
      formattedTVL,
      formattedTotalTVL
    );

    expect(isTVL).toBeTruthy();

    /* ALM TVL should be dispalyed correctly */
    // if (vaultData?.alm?.tvl) {
    //   const infoBarAlmTVL = await page.getByTestId("infoBarAlmTVL").innerText();

    //   const almTVL = formatNumber(Number(vaultData?.alm?.tvl), "abbreviate");

    //   expect(infoBarAlmTVL).toBe(almTVL);
    // }

    /* Pool TVL should be dispalyed correctly */
    // if (vaultData?.pool?.tvl) {
    //   const infoBarPoolTVL = await page
    //     .getByTestId("infoBarPoolTVL")
    //     .innerText();

    //   const poolTVL = formatNumber(Number(vaultData?.pool?.tvl), "abbreviate");

    //   expect(infoBarPoolTVL).toBe(poolTVL);
    // }

    /* Share price should be displayed correctly */
    // const vaultSP = await page.getByTestId("infoBarSP").innerText();

    // const sharePrice = Number(vaultData.sharePrice)
    //   ? Number(vaultData.sharePrice).toFixed(1)
    //   : "1.0";

    // expect(Number(vaultSP.slice(1)).toFixed(1)).toBe(sharePrice);

    /* Last Hardwork should be displayed in hours and minutes or none */
    // const infoBarHardWork = await page
    //   .getByTestId("infoBarHardWork")
    //   .innerText();

    // const timeDifference = getTimeDifference(vaultData?.lastHardWork);

    // if (timeDifference) {
    //   let expectedLastHardWorkText = "None";

    //   if (timeDifference.days) {
    //     if (timeDifference.days < 1000) {
    //       expectedLastHardWorkText = `${timeDifference.days} ${timeDifference.days > 1 ? "days" : "day"} ${timeDifference.hours}h ago`;
    //     }
    //   } else {
    //     expectedLastHardWorkText = `${timeDifference.hours}h ago`;
    //   }

    //   expect(infoBarHardWork).toContain(expectedLastHardWorkText);
    // }

    /* Deposited amount should be 0 if user have no deps in vault or disconnected */
    const deposited = await page.getByTestId("infoBarDeposited").innerText();

    expect(deposited).toBe("0");

    await page.goBack();
  }
});
