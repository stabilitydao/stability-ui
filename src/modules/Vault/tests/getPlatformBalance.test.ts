import { describe, it, expect, vi } from "vitest";

import { getPlatformBalance } from "../functions";

import { addAssetsBalance, getContractDataWithPagination } from "@utils";
import { assetsBalances } from "@store";
import { frontendContracts } from "@web3";

const mockPublicClient = {
  callContract: vi.fn(),
};

const mockNetwork = "137";
const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
const mockContractBalance = {
  "0xabcdefabcdefabcdefabcdefabcdefabcdef": BigInt(1000),
};

vi.mock("@utils", () => ({
  addAssetsBalance: vi.fn(),
  getContractDataWithPagination: vi.fn(),
}));

vi.mock("@store", () => ({
  assetsBalances: {
    get: vi.fn().mockReturnValue({}),
    set: vi.fn(),
  },
}));

describe("getPlatformBalance", () => {
  it("should correctly fetch and update platform balances", async () => {
    const mockCurrentChainBalances = {
      "0xabcdefabcdefabcdefabcdefabcdefabcdef": "1000",
    };

    getContractDataWithPagination.mockResolvedValue(mockContractBalance);
    addAssetsBalance.mockReturnValue(mockCurrentChainBalances);

    const result = await getPlatformBalance(
      mockPublicClient,
      mockNetwork,
      mockAddress
    );

    expect(getContractDataWithPagination).toHaveBeenCalledWith(
      mockPublicClient,
      frontendContracts[mockNetwork],
      "getBalanceAssets",
      mockAddress,
      0
    );

    expect(addAssetsBalance).toHaveBeenCalledWith(mockContractBalance);

    expect(assetsBalances.get).toHaveBeenCalled();
    expect(assetsBalances.set).toHaveBeenCalledWith(
      expect.objectContaining({ [mockNetwork]: mockCurrentChainBalances })
    );

    expect(result).toEqual(mockCurrentChainBalances);
  });
});
