import { describe, it, expect, vi } from "vitest";

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
} from "@utils";

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

  it("should handle arrays of different lengths gracefully", () => {
    const data = [
      ["Address1", "Address2"],
      [],
      ["Balance1", "Balance2", "Balance3"],
    ];
    const result = addAssetsBalance(data);

    expect(result).toBeUndefined();
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

  it("should handle arrays of different lengths gracefully", () => {
    const data = [
      [],
      [],
      [],
      ["0xAddress1", "0xAddress2"],
      [100, 200, 300],
      [10, 20],
    ];

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = addVaultData(data);

    expect(result).toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "There is an error, arrays length are different."
    );

    consoleErrorSpy.mockRestore();
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
    expect(formatNumber(0.05, "smallNumbers")).toBe("0.05");
    expect(formatNumber(1000.123, "smallNumbers")).toBe("1 000.12");
  });

  it("should handle string input", () => {
    expect(formatNumber("1500", "abbreviate")).toBe("$1.50K");
    expect(formatNumber("2000000", "abbreviateInteger")).toBe("$2M");
    expect(formatNumber("12345.678", "format")).toBe("12 345.68");
  });

  it("should return undefined for unknown type", () => {
    expect(formatNumber(1500, "unknownType")).toBeUndefined();
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
  it("should be correct logo for Curve", () => {
    const logo = getProtocolLogo("CCF");

    expect(logo).toBe("/protocols/Curve.png");
  });

  it("should be gamma for incorrect input", () => {
    const logo = getProtocolLogo("example");

    expect(logo).toBe("/protocols/Gamma.png");
  });
});

describe("getStrategyInfo", () => {
  it("should return correct strategy info for GQFS", () => {
    const vaultSymbol = "GQFS";
    const strategyInfo = getStrategyInfo(vaultSymbol);

    expect(strategyInfo.name).toBe("Gamma QuickSwap Farm");
    expect(strategyInfo.shortName).toBe("GQF");
    expect(strategyInfo.features).toContainEqual({
      name: "Farming",
      svg: expect.any(String),
    });
    expect(strategyInfo.color).toBe("#de43ff");
    expect(strategyInfo.il).toEqual({
      rate: 1,
      title: "Zero exp",
      desc: "The strategy of the underlying liquidity provider (Gamma Stable LP) can rebalance the position by expanding it, but this happens extremely rarely, only at times of high volatility of the assets in the pool.",
      color: "#7af996",
    });
  });

  it("should return correct strategy info for unknown vaultSymbol", () => {
    const vaultSymbol = "UNKNOWN";
    const strategyInfo = getStrategyInfo(vaultSymbol);

    expect(strategyInfo.name).toBe("");
    expect(strategyInfo.shortName).toBe("");
    expect(strategyInfo.protocols).toEqual([]);
    expect(strategyInfo.features).toEqual([]);
    expect(strategyInfo.color).toBe("");
    expect(strategyInfo.il).toBeUndefined();
  });
});

describe("getTimeDifference function", () => {
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

// add asset to wallet
// tests from 1inch routes
// tests for getTokenData
/// tests for setLocalStoreHash
