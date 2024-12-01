import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  addAssetsBalance,
  addVaultData,
  calculateAPY,
  debounce,
  decodeHex,
  determineAPR,
  formatFromBigInt,
  formatNumber,
  getDate,
  getProtocolLogo,
  getStrategyInfo,
  getTimeDifference,
  get1InchRoutes,
  addAssetToWallet,
  getLocalStorageData,
  setLocalStoreHash,
  dataSorter,
  getShortAddress,
  formatTimestampToDate,
  extractDomain,
} from "@utils";

import { transactionSettings, aprFilter } from "@store";

import { CHAINS, PROTOCOLS, IL } from "@constants";

vi.mock("@store", () => ({
  transactionSettings: { set: vi.fn() },
  hideFeeApr: { set: vi.fn() },
  aprFilter: { set: vi.fn() },
  isVisibleBalance: { set: vi.fn() },
  visible: { set: vi.fn() },
}));

describe("addAssetsBalance", () => {
  it("should correctly map assets to balances", () => {
    const data = [
      ["Address1", "Address2", "Address3"],
      [],
      ["Balance1", "Balance2", "Balance3"],
    ];
    const result = addAssetsBalance(data);

    expect(result).toEqual({
      address1: "Balance1",
      address2: "Balance2",
      address3: "Balance3",
    });
  });
});

describe("addVaultData", () => {
  it("should correctly map vault addresses to their data", () => {
    const data = [
      [],
      [],
      [],
      ["0xAddress1", "0xAddress2", "0xAddress3"],
      [100, 200, 300],
      [10, 20, 30],
    ];
    const result = addVaultData(data);

    const expected = {
      "0xaddress1": {
        vaultSharePrice: 100,
        vaultUserBalance: 10,
      },
      "0xaddress2": {
        vaultSharePrice: 200,
        vaultUserBalance: 20,
      },
      "0xaddress3": {
        vaultSharePrice: 300,
        vaultUserBalance: 30,
      },
    };

    expect(result).toEqual(expected);
  });
});

describe("calculateAPY", () => {
  it("should correctly calculate with string || number", () => {
    const zeroAPY = calculateAPY(0);
    const oneHundredAPY = calculateAPY(100);
    const fractionalAPY = calculateAPY(15.54765844345345);

    const stringAPY = calculateAPY(100);

    expect(zeroAPY).toBe(0);
    expect(oneHundredAPY).toBe(171.45674820219733);
    expect(fractionalAPY).toBe(16.81759091089723);
    expect(stringAPY).toBe(171.45674820219733);
  });
  it("should correctly calculate with incorrect cases", () => {
    const undefinedAPY = calculateAPY(undefined as any);
    const NaNAPY = calculateAPY(NaN);

    expect(undefinedAPY).toBe(0);
    expect(NaNAPY).toBe(0);
  });
});

describe("debounce", () => {
  it("should call the function only once if called multiple times within the interval", () => {
    vi.useFakeTimers();

    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("should not call the function if the debounce interval has not passed", () => {
    vi.useFakeTimers();

    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should reset the timer if called again within the interval", () => {
    vi.useFakeTimers();

    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe("decodeHex", () => {
  it("should decode a valid hex string", () => {
    const hexString =
      "0x4445536861726500000000000000000000000000000000000000000000000000";
    const result = decodeHex(hexString);

    expect(result).toBe("DEShare");
  });

  it("should return an empty string for an empty hex string", () => {
    const hexString = "0x";
    const result = decodeHex(hexString);
    expect(result).toBe("");
  });

  it("should return an empty string if input is not a string", () => {
    expect(decodeHex(123 as any)).toBe("");
    expect(decodeHex({} as any)).toBe("");
    expect(decodeHex([] as any)).toBe("");
  });
});

describe("determineAPR", () => {
  it("should return fallbackAPR if graphAPR is defined and APR is less than or equal to 0", () => {
    const graphAPR = "some value";
    const APR = 0;
    const fallbackAPR = 5;
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("5.00");
  });

  it("should return APR if graphAPR is not defined", () => {
    const graphAPR = undefined;
    const APR = 10;
    const fallbackAPR = 5;
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("10.00");
  });

  it("should return APR if graphAPR is defined and APR is greater than 0", () => {
    const graphAPR = "some value";
    const APR = 10;
    const fallbackAPR = 5;
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("10.00");
  });

  it("should return fallbackAPR if graphAPR is defined and APR is a negative number", () => {
    const graphAPR = "some value";
    const APR = -1;
    const fallbackAPR = 5;
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("5.00");
  });

  it("should handle string values for APR and fallbackAPR correctly", () => {
    const graphAPR = "some value";
    const APR = "0";
    const fallbackAPR = "5.1234";
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("5.12");
  });

  it("should handle string values for APR and fallbackAPR correctly when APR is positive", () => {
    const graphAPR = "some value";
    const APR = "10.5678";
    const fallbackAPR = "5.1234";
    const result = determineAPR(graphAPR, APR, fallbackAPR);
    expect(result).toBe("10.57");
  });
});

describe("formatFromBigInt", () => {
  it("should format the value with decimals and round to 5 decimal places", () => {
    const value = BigInt(12345678901234567890n);
    const decimals = 18;
    const type = "withDecimals";
    const result = formatFromBigInt(value, decimals, type);
    expect(result).toBe(12.34567);
  });

  it("should format the value with floor", () => {
    const value = BigInt(12345678901234567890n);
    const decimals = 18;
    const type = "withFloor";
    const result = formatFromBigInt(value, decimals, type);
    expect(result).toBe(12);
  });

  it("should format the value without type", () => {
    const value = BigInt(12345678901234567890n);
    const decimals = 18;
    const result = formatFromBigInt(value, decimals);
    expect(result).toBe(12.345678901234568);
  });

  it("should handle string input", () => {
    const value = "12345678901234567890";
    const decimals = 18;
    const result = formatFromBigInt(value, decimals);
    expect(result).toBe(12.345678901234568);
  });

  it("should handle number input", () => {
    const value = 12345678901234567890;
    const decimals = 18;
    const result = formatFromBigInt(value, decimals);
    expect(result).toBe(12.345678901234568);
  });

  it("should default to empty type if not provided", () => {
    const value = BigInt(12345678901234567890n);
    const decimals = 18;
    const result = formatFromBigInt(value, decimals);
    expect(result).toBe(12.345678901234568);
  });
});

describe("formatNumber", () => {
  it("should abbreviate numbers correctly", () => {
    expect(formatNumber(1500, "abbreviate")).toBe("$1.50K");
    expect(formatNumber(2000000, "abbreviate")).toBe("$2.00M");
    expect(formatNumber(1000000000, "abbreviate")).toBe("$1.00B");
  });

  it("should abbreviate integers correctly", () => {
    expect(formatNumber(1500, "abbreviateInteger")).toBe("$2K");
    expect(formatNumber(2000000, "abbreviateInteger")).toBe("$2M");
    expect(formatNumber(1000000000, "abbreviateInteger")).toBe("$1B");
  });

  it("should abbreviate numbers for charts correctly", () => {
    expect(formatNumber(1500, "chartAbbreviate")).toBe("$2K");
    expect(formatNumber(2500, "chartAbbreviate")).toBe("$3K");
    expect(formatNumber(100, "chartAbbreviate")).toBe("$100");
    expect(formatNumber(5, "chartAbbreviate")).toBe("$5.00");
    expect(formatNumber(45, "chartAbbreviate")).toBe("$45.0");
  });

  it("should format without decimal part correctly", () => {
    expect(formatNumber(12345.678, "formatWithoutDecimalPart")).toBe("12 345");
  });

  it("should format numbers correctly", () => {
    expect(formatNumber(12345.678, "format")).toBe("12 345.68");
    expect(formatNumber(12345, "format")).toBe("12 345");
  });

  it("should format with long decimal part correctly", () => {
    expect(formatNumber(12345.6789, "formatWithLongDecimalPart")).toBe(
      "12 345.6789"
    );
    expect(formatNumber(12345, "formatWithLongDecimalPart")).toBe("12 345");
  });

  it("should format small numbers correctly", () => {
    expect(formatNumber(0.05567468565431123456, "smallNumbers")).toBe(
      "0.05567"
    );

    expect(formatNumber(1000.123, "smallNumbers")).toBe("1 000.12");
  });

  it("should handle string input", () => {
    expect(formatNumber("1500", "abbreviate")).toBe("$1.50K");
    expect(formatNumber("2000000", "abbreviateInteger")).toBe("$2M");
    expect(formatNumber("12345.678", "format")).toBe("12 345.68");
  });

  it("should return undefined for unknown type", () => {
    expect(formatNumber(1500, "unknownType")).toBe("");
  });
});

describe("getDate", () => {
  it("should format date correctly for a specific locale (fr-FR)", () => {
    const unixTime = 1625097600;

    Object.defineProperty(global, "navigator", {
      value: {
        language: "fr-FR",
      },
      configurable: true,
    });

    const formattedDate = getDate(unixTime);

    expect(formattedDate).toBe("01/07/2021");
  });

  it("should default to 'en-US' if navigator is not defined", () => {
    const unixTime = 1625097600;

    Object.defineProperty(global, "navigator", {
      value: undefined,
      configurable: true,
    });

    const formattedDate = getDate(unixTime);

    expect(formattedDate).toBe("7/1/2021");
  });
});

describe("getProtocolLogo", () => {
  it("should return correct logo for Curve (CCF)", () => {
    const logo = getProtocolLogo("CCF");

    expect(logo).toBe(PROTOCOLS.curve.logoSrc);
  });

  it("should return correct logo for DefiEdge (DQMF)", () => {
    const logo = getProtocolLogo("DQMF");

    expect(logo).toBe(PROTOCOLS.defiedge.logoSrc);
  });

  it("should return correct logo for Ichi (IQMF)", () => {
    const logo = getProtocolLogo("IQMF");

    expect(logo).toBe(PROTOCOLS.ichi.logoSrc);
  });

  it("should return correct logo for Ichi (IRMF)", () => {
    const logo = getProtocolLogo("IRMF");

    expect(logo).toBe(PROTOCOLS.ichi.logoSrc);
  });

  it("should return correct logo for Yearn (Y)", () => {
    const logo = getProtocolLogo("Y");

    expect(logo).toBe(PROTOCOLS.yearn.logoSrc);
  });

  it("should return default logo for unknown strategy (example)", () => {
    const logo = getProtocolLogo("example");

    expect(logo).toBe(PROTOCOLS.gamma.logoSrc);
  });
});

describe("getStrategyInfo", () => {
  it("should return correct strategy info for GQMF", () => {
    const vaultSymbol = "GQMF";

    const strategyInfo = getStrategyInfo(
      vaultSymbol,
      "Gamma QuickSwap Merkl Farm"
    );

    expect(strategyInfo.id).toBe("Gamma QuickSwap Merkl Farm");

    expect(strategyInfo.shortId).toBe("GQMF");

    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.gamma,
      PROTOCOLS.quickSwap,
      PROTOCOLS.merkl,
    ]);

    expect(strategyInfo.il).toEqual({
      rate: 0,
      title: "None",
      desc: "None",
      color: "#4aff71",
    });
  });

  it("should return correct strategy info for CCF", () => {
    const vaultSymbol = "CCF";

    const strategyId = "Curve Convex Farm";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("Curve Convex Farm");
    expect(strategyInfo.shortId).toBe("CCF");
    expect(strategyInfo.protocols).toEqual([PROTOCOLS.curve, PROTOCOLS.convex]);
    expect(strategyInfo.il).toEqual(IL.CCF);
  });

  it("should return correct strategy info for QSF", () => {
    const vaultSymbol = "QSF";
    const strategyId = "QuickSwap Static Merkl Farm";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("QuickSwap Static Merkl Farm");
    expect(strategyInfo.shortId).toBe("QSMF");
    expect(strategyInfo.protocols).toEqual([PROTOCOLS.quickSwap]);
    expect(strategyInfo.il).toEqual(IL.QSF);
  });

  it("should return correct strategy info for DQMF", () => {
    const vaultSymbol = "DQMF";
    const strategyId = "DefiEdge QuickSwap Merkl Farm";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("DefiEdge QuickSwap Merkl Farm");
    expect(strategyInfo.shortId).toBe("DQMF");
    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.defiedge,
      PROTOCOLS.quickSwap,
      PROTOCOLS.merkl,
    ]);
    expect(strategyInfo.il).toEqual(IL.DQMFN);
  });

  it("should return correct strategy info for IRMF", () => {
    const vaultSymbol = "IRMF";
    const strategyId = "Ichi Retro Merkl Farm";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("Ichi Retro Merkl Farm");
    expect(strategyInfo.shortId).toBe("IRMF");
    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.ichi,
      PROTOCOLS.retro,
      PROTOCOLS.merkl,
    ]);
    expect(strategyInfo.il).toEqual(IL.IQMF);
  });

  it("should return correct strategy info for GRMF", () => {
    const vaultSymbol = "GRMF";

    const strategyInfo = getStrategyInfo(vaultSymbol, "Gamma Retro Merkl Farm");

    expect(strategyInfo.id).toBe("Gamma Retro Merkl Farm");
    expect(strategyInfo.shortId).toBe("GRMF");
    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.gamma,
      PROTOCOLS.retro,
      PROTOCOLS.merkl,
    ]);

    expect(strategyInfo.il).toEqual({
      rate: 0,
      title: "None",
      desc: "None",
      color: "#000000",
    });
  });

  it("should return correct strategy info for GUMF", () => {
    const vaultSymbol = "GUMF";
    const strategyId = "Gamma UniswapV3 Merkl Farm";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("Gamma UniswapV3 Merkl Farm");
    expect(strategyInfo.shortId).toBe("GUMF");
    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.gamma,
      PROTOCOLS.uniswapV3,
      PROTOCOLS.merkl,
    ]);
    expect(strategyInfo.il).toEqual(IL.LOW);
  });

  it("should return correct strategy info for unknown vaultSymbol", () => {
    const vaultSymbol = "UNKNOWN";
    const strategyId = "Unknown Strategy";

    const strategyInfo = getStrategyInfo(vaultSymbol, strategyId);

    expect(strategyInfo.id).toBe("");
    expect(strategyInfo.shortId).toBe("");
    expect(strategyInfo.protocols).toEqual([
      PROTOCOLS.quickSwap,
      PROTOCOLS.gamma,
    ]);
    expect(strategyInfo.baseStrategies).toEqual([]);
    expect(strategyInfo.il).toEqual({
      rate: 0,
      title: "None",
      desc: "None",
      color: "#000000",
    });
  });
});

describe("getTimeDifference", () => {
  it("should correctly calculate time difference in days and hours", () => {
    const currentTime = new Date().getTime();
    const unixTime = currentTime - 3 * 24 * 60 * 60 * 1000;

    const result = getTimeDifference(unixTime / 1000);

    const differenceInSeconds = (currentTime - unixTime) / 1000;
    const expectedDays = Math.floor(differenceInSeconds / (60 * 60 * 24));
    const expectedHours = Math.floor(
      (differenceInSeconds % (60 * 60 * 24)) / (60 * 60)
    );

    expect(result.days).toBe(expectedDays);
    expect(result.hours).toBe(expectedHours);
  });
});

// describe("get1InchRoutes", () => {
//   it("should get correct amountOut for polygon", async () => {
//     const setAction = () => {};

//     const result = await get1InchRoutes(
//       CHAINS[0].id,
//       "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
//       "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
//       6,
//       "100000000",
//       setAction,
//       "deposit"
//     );
//     expect(result?.amountOut).toBeDefined();

//     expect(typeof result?.amountOut).toBe("string");

//     expect(result?.amountOut).not.toBe("");
//     expect(result?.amountOut).not.toBe(0);

//     const amountOutNumber = Number(result?.amountOut.slice(0, 3));

//     expect(amountOutNumber >= 99 && amountOutNumber <= 101).toBe(true);
//   });
//   it("should get correct amountOut for base", async () => {
//     const setAction = () => {};

//     const result = await get1InchRoutes(
//       CHAINS[1].id,
//       "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
//       "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
//       6,
//       "100000000",
//       setAction,
//       "deposit"
//     );

//     expect(result?.amountOut).toBeDefined();

//     expect(typeof result?.amountOut).toBe("string");

//     expect(result?.amountOut).not.toBe("");
//     expect(result?.amountOut).not.toBe(0);

//     const amountOutNumber = Number(result?.amountOut.slice(0, 3));

//     expect(amountOutNumber >= 99 && amountOutNumber <= 101).toBe(true);
//   });
//   it("should get correct amountOut for zero", async () => {
//     const setAction = () => {};

//     const result = await get1InchRoutes(
//       CHAINS[1].id,
//       "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
//       "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
//       6,
//       "0",
//       setAction,
//       "deposit"
//     );
//     expect(result?.amountOut).toBe("0");
//   });
// }, 10000);

describe("addAssetToWallet", () => {
  it("should call client.data.watchAsset with correct parameters when image is provided", async () => {
    const mockClient = {
      data: {
        watchAsset: vi.fn().mockResolvedValue(true),
      },
    };

    const address = "0xMockedAssetAddress";
    const decimals = 18;
    const symbol = "MOCK";
    const image = "https://example.com/image.png";

    await addAssetToWallet(mockClient, address, decimals, symbol, image);

    expect(mockClient.data.watchAsset).toHaveBeenCalledWith({
      type: "ERC20",
      options: {
        address: address,
        decimals: decimals,
        symbol: symbol,
        image: image,
      },
    });
  });

  it("should call client.data.watchAsset with correct parameters when image is not provided", async () => {
    const mockClient = {
      data: {
        watchAsset: vi.fn().mockResolvedValue(true),
      },
    };

    const address = "0xMockedAssetAddress";
    const decimals = 18;
    const symbol = "MOCK";

    await addAssetToWallet(mockClient, address, decimals, symbol);

    expect(mockClient.data.watchAsset).toHaveBeenCalledWith({
      type: "ERC20",
      options: {
        address: address,
        decimals: decimals,
        symbol: symbol,
      },
    });
  });

  it("should handle errors gracefully", async () => {
    const mockClient = {
      data: {
        watchAsset: vi.fn().mockRejectedValue(new Error("Test Error")),
      },
    };

    const address = "0xMockedAssetAddress";
    const decimals = 18;
    const symbol = "MOCK";

    const consoleSpy = vi.spyOn(console, "log");

    await addAssetToWallet(mockClient, address, decimals, symbol);

    expect(consoleSpy).toHaveBeenCalledWith(
      "ADD ASSET ERROR:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe("getLocalStorageData", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should load transactionSettings from localStorage and set the store", () => {
    const savedSettings = JSON.stringify({ gasLimit: 21000 });
    localStorage.setItem("transactionSettings", savedSettings);

    getLocalStorageData();

    expect(transactionSettings.set).toHaveBeenCalledWith({ gasLimit: 21000 });
  });

  it("should set aprFilter to 'weekly' if localStorage value is 'week'", () => {
    localStorage.setItem("APRsFiler", JSON.stringify("week"));

    getLocalStorageData();

    expect(aprFilter.set).toHaveBeenCalledWith("weekly");
  });

  it("should set aprFilter to 'daily' if localStorage value is '24h'", () => {
    localStorage.setItem("APRsFiler", JSON.stringify("24h"));

    getLocalStorageData();

    expect(aprFilter.set).toHaveBeenCalledWith("daily");
  });

  it("should set aprFilter to default value 'weekly' if nothing is in localStorage", () => {
    getLocalStorageData();

    expect(aprFilter.set).toHaveBeenCalledWith("weekly");
  });

  it("should not set transactionSettings if there is no data in localStorage", () => {
    getLocalStorageData();

    expect(transactionSettings.set).not.toHaveBeenCalled();
  });
});

describe("setLocalStoreHash", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store the object in localStorage under the key "lastTx"', () => {
    const testObj = {
      hash: "0x123",
      status: "pending",
      timestamp: 1234567890,
      tokens: [
        {
          "0xabc": { amount: "100" },
          "0xdef": { amount: "200" },
        },
      ],
      type: "transfer",
      vault: "0x456",
    };

    setLocalStoreHash(testObj);

    const storedItem = localStorage.getItem("lastTx");
    expect(storedItem).not.toBeNull();
    expect(JSON.parse(storedItem as string)).toEqual(testObj);
  });
});

describe("dataSorter ", () => {
  it("should sort numbers in ascending order", () => {
    expect(dataSorter("1", "2", "number", "ascendentic")).toBeLessThan(0);
    expect(dataSorter("2", "1", "number", "ascendentic")).toBeGreaterThan(0);
    expect(dataSorter("1", "1", "number", "ascendentic")).toBe(0);
  });

  it("should sort numbers in descending order", () => {
    expect(dataSorter("1", "2", "number", "descendentic")).toBeGreaterThan(0);
    expect(dataSorter("2", "1", "number", "descendentic")).toBeLessThan(0);
    expect(dataSorter("1", "1", "number", "descendentic")).toBe(0);
  });

  it("should sort strings in ascending order", () => {
    expect(dataSorter("apple", "banana", "string", "ascendentic")).toBeLessThan(
      0
    );
    expect(
      dataSorter("banana", "apple", "string", "ascendentic")
    ).toBeGreaterThan(0);
    expect(dataSorter("apple", "apple", "string", "ascendentic")).toBe(0);
  });

  it("should sort strings in descending order", () => {
    expect(
      dataSorter("apple", "banana", "string", "descendentic")
    ).toBeGreaterThan(0);
    expect(
      dataSorter("banana", "apple", "string", "descendentic")
    ).toBeLessThan(0);
    expect(dataSorter("apple", "apple", "string", "descendentic")).toBe(0);
  });

  it("should return 0 for unknown data types", () => {
    expect(dataSorter("any", "thing", "unknown", "ascendentic")).toBe(0);
    expect(dataSorter("any", "thing", "unknown", "descendentic")).toBe(0);
  });
});

describe("getShortAddress", () => {
  it("should return shortened address with default first and last characters", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    const result = getShortAddress(address);
    expect(result).toBe("0x12..78");
  });

  it("should return shortened address with custom first and last characters", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    const result = getShortAddress(address, 6, 4);
    expect(result).toBe("0x1234..5678");
  });

  it("should handle very short addresses correctly", () => {
    const address = "0x12";
    const result = getShortAddress(address);
    expect(result).toBe("0x12..12");
  });

  it("should handle edge cases when firstChars + lastChars exceed the address length", () => {
    const address = "0x1234";
    const result = getShortAddress(address, 6, 4);
    expect(result).toBe("0x1234..1234");
  });

  it("should return full address if firstChars + lastChars covers the whole address", () => {
    const address = "0xabcdef";
    const result = getShortAddress(address, 3, 3);
    expect(result).toBe("0xa..def");
  });
});

describe("formatTimestampToDate", () => {
  it("should format timestamp correctly for 1st January", () => {
    const timestamp = 1672541199;
    expect(formatTimestampToDate(timestamp)).toBe("1st Jan");
  });

  it("should format timestamp correctly for 2nd January", () => {
    const timestamp = 1672666300;
    expect(formatTimestampToDate(timestamp)).toBe("2nd Jan");
  });

  it("should format timestamp correctly for 3rd January", () => {
    const timestamp = 1672766300;
    expect(formatTimestampToDate(timestamp)).toBe("3rd Jan");
  });

  it("should format timestamp correctly for 4th January", () => {
    const timestamp = 1672866300;
    expect(formatTimestampToDate(timestamp)).toBe("4th Jan");
  });

  it("should format timestamp correctly for 11th January", () => {
    const timestamp = 1673446300;
    expect(formatTimestampToDate(timestamp)).toBe("11th Jan");
  });

  it("should format timestamp correctly for 12th January", () => {
    const timestamp = 1673546300;
    expect(formatTimestampToDate(timestamp)).toBe("12th Jan");
  });

  it("should format timestamp correctly for 13th January", () => {
    const timestamp = 1673646300;
    expect(formatTimestampToDate(timestamp)).toBe("13th Jan");
  });

  it("should format timestamp correctly for 21st January", () => {
    const timestamp = 1674276300;
    expect(formatTimestampToDate(timestamp)).toBe("21st Jan");
  });

  it("should format timestamp correctly for 22nd January", () => {
    const timestamp = 1674376300;
    expect(formatTimestampToDate(timestamp)).toBe("22nd Jan");
  });

  it("should format timestamp correctly for 23rd January", () => {
    const timestamp = 1674476300;
    expect(formatTimestampToDate(timestamp)).toBe("23rd Jan");
  });

  it("should format timestamp correctly for 1st January with year", () => {
    const timestamp = 1672541199;
    expect(formatTimestampToDate(timestamp, true)).toBe("1st Jan 2023");
  });

  it("should format timestamp correctly for 2nd January with year", () => {
    const timestamp = 1672666300;
    expect(formatTimestampToDate(timestamp, true)).toBe("2nd Jan 2023");
  });

  it("should format timestamp correctly for 11th January with year", () => {
    const timestamp = 1673446300;
    expect(formatTimestampToDate(timestamp, true)).toBe("11th Jan 2023");
  });

  it("should format timestamp correctly for 21st January with year", () => {
    const timestamp = 1674276300;
    expect(formatTimestampToDate(timestamp, true)).toBe("21st Jan 2023");
  });

  it("should format timestamp correctly for 23rd January with year", () => {
    const timestamp = 1674476300;
    expect(formatTimestampToDate(timestamp, true)).toBe("23rd Jan 2023");
  });
});

describe("extractDomain", () => {
  it("should return the domain without 'https://'", () => {
    const url = "https://example.com";
    expect(extractDomain(url)).toBe("example.com");
  });

  it("should return the domain without 'http://'", () => {
    const url = "http://example.com";
    expect(extractDomain(url)).toBe("example.com");
  });

  it("should return the domain without 'www'", () => {
    const url = "https://www.example.com";
    expect(extractDomain(url)).toBe("example.com");
  });

  it("should handle subdomains correctly", () => {
    const url = "https://subdomain.example.com";
    expect(extractDomain(url)).toBe("subdomain.example.com");
  });

  it("should handle URLs with paths after the domain", () => {
    const url = "https://example.com/path/to/page";
    expect(extractDomain(url)).toBe("example.com");
  });

  it("should handle URLs with 'www' and paths", () => {
    const url = "https://www.example.com/path/to/page";
    expect(extractDomain(url)).toBe("example.com");
  });

  it("should handle undefined or empty input gracefully", () => {
    const url = "";

    expect(extractDomain(url)).toBe("");
    expect(extractDomain(undefined)).toBe("");
  });
});
