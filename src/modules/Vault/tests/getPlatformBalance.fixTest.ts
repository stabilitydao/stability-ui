// import { describe, it, expect, vi } from "vitest";

// import { getPlatformBalance } from "../functions";

// import { addAssetsBalance } from "@utils";

// import { assetsBalances } from "@store";

// import { platforms, PlatformABI } from "@web3";

// const mockPublicClient = {
//   readContract: vi.fn(),
// };

// const mockNetwork = "137";

// const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";

// const mockContractBalance = {
//   "0xabcdefabcdefabcdefabcdefabcdefabcdef": BigInt(1000),
// };

// vi.mock("@utils", () => ({
//   addAssetsBalance: vi.fn(),
// }));

// vi.mock("@store", () => ({
//   assetsBalances: {
//     get: vi.fn().mockReturnValue({}),
//     set: vi.fn(),
//   },
// }));

// describe("getPlatformBalance", () => {
//   it("should correctly fetch and update platform balances", async () => {
//     const mockCurrentChainBalances = {
//       "0xabcdefabcdefabcdefabcdefabcdefabcdef": "1000",
//     };

//     mockPublicClient.readContract.mockResolvedValue(mockContractBalance);
//     (addAssetsBalance as vi.Mock).mockReturnValue(mockCurrentChainBalances);

//     const result = await getPlatformBalance(
//       mockPublicClient,
//       mockNetwork,
//       mockAddress
//     );

//     expect(mockPublicClient.readContract).toHaveBeenCalledWith({
//       address: platforms[mockNetwork],
//       abi: PlatformABI,
//       functionName: "getBalance",
//       args: [mockAddress],
//     });

//     expect(addAssetsBalance).toHaveBeenCalledWith(mockContractBalance);

//     expect(assetsBalances.set).toHaveBeenCalledWith({
//       [mockNetwork]: mockCurrentChainBalances,
//     });

//     expect(result).toEqual(mockCurrentChainBalances);
//   });
// });
