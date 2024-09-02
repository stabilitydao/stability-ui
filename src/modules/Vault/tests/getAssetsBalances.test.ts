import { describe, it, expect, vi } from "vitest";
import { formatUnits } from "viem";
import { getTokenData } from "@utils";
import { getAssetsBalances } from "../functions";

vi.mock("@utils", () => ({
  getTokenData: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    formatUnits: vi.fn((balance: bigint, decimals: number) =>
      (Number(balance) / 10 ** decimals).toString()
    ),
  };
});

describe("getAssetsBalances", () => {
  it("should correctly format and set balances", () => {
    const balances = {
      "0xabc123": BigInt(1000),
    };

    const setBalances = vi.fn();

    const options = ["0xabc123"];

    const underlyingToken = {
      address: "0xabc123",
      balance: "500",
    };

    (getTokenData as vi.Mock).mockReturnValue({ decimals: 18 });

    getAssetsBalances(balances, setBalances, options, underlyingToken);

    expect(formatUnits).toHaveBeenCalledWith(BigInt(1000), 18);

    expect(setBalances).toHaveBeenCalledWith({
      "0xabc123": "500",
    });
  });

  it("should skip tokens without decimals data", () => {
    const balances = {
      "0xabc123": BigInt(1000),
    };
    const setBalances = vi.fn();
    const options = ["0xabc123"];
    const underlyingToken = {
      address: "0xdef456",
      balance: "500",
    };

    (getTokenData as vi.Mock).mockReturnValue(null);

    getAssetsBalances(balances, setBalances, options, underlyingToken);

    expect(setBalances).toHaveBeenCalledWith({});
  });
});
