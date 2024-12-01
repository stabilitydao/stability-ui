import { describe, it, expect, vi } from "vitest";
import { getAssetAllowance } from "../functions";

import { ERC20ABI } from "@web3";

const mockClient = {
  readContract: vi.fn(),
};

const mockAccount = "0x1234567890abcdef1234567890abcdef12345678";
const mockAsset = "0xabcdefabcdefabcdefabcdefabcdefabcdef";
const mockVaultAddress = "0xa1b2c3d4e5f6a7b8c9d0e1f2g3h4i5j6k7l8m9n0";
const mockUnderlyingAddress = "0xa0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9";
const mockZap = "0xabcdefabcdefabcdefabcdefabcdefabcdef";

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAddress: vi.fn((address) => address),
  };
});

vi.mock("@store", () => ({
  account: {
    get: () => mockAccount,
  },
}));

describe("getAssetAllowance", () => {
  it("should return the correct allowance for deposit", async () => {
    const mockAllowance = BigInt(1000);
    mockClient.readContract.mockResolvedValue(mockAllowance);

    const result = await getAssetAllowance(
      mockClient,
      mockAsset,
      "Deposit",
      mockZap,
      mockUnderlyingAddress,
      mockVaultAddress
    );

    expect(result).toBe(mockAllowance);

    expect(mockClient.readContract).toHaveBeenCalledWith({
      address: mockAsset,
      abi: ERC20ABI,
      functionName: "allowance",
      args: [mockAccount, mockVaultAddress],
    });
  });

  it("should return the correct allowance for withdrawal", async () => {
    const mockAllowance = BigInt(2000);
    mockClient.readContract.mockResolvedValue(mockAllowance);

    const result = await getAssetAllowance(
      mockClient,
      mockAsset,
      "Withdraw",
      mockVaultAddress,
      mockUnderlyingAddress,
      mockZap
    );

    expect(result).toBe(mockAllowance);

    expect(mockClient.readContract).toHaveBeenCalledWith({
      address: mockVaultAddress,
      abi: ERC20ABI,
      functionName: "allowance",
      args: [mockAccount, mockZap],
    });
  });
});
