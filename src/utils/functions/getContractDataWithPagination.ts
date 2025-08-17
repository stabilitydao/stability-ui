import { CONTRACT_PAGINATION, IFrontendABI } from "@web3";

import type { TAddress, TFrontendContractData } from "@types";

type TData = string[] | number[] | bigint[];

/**
 * Fetches paginated data from a smart contract function and combines the results into a single dataset
 *
 * This function is designed to handle cases where the data returned by the smart contract is too large to
 * fetch in a single call. It uses pagination to retrieve the data in chunks and merges them into a unified structure.
 *
 * @example
 * ```typescript
 * const $publicClient = useStore(publicClient);
 * const contractAddress = "0x123456789abcdef";
 * const functionName = "getUserBalances";
 * const userAddress = "0xabcdefabcdef1234";
 * const start = 0;
 *
 * const result = await getContractDataWithPagination(
 *   client,
 *   contractAddress,
 *   functionName,
 *   userAddress,
 *   start
 * );
 *
 * console.log(result);
 * ```
 *
 * @param {any} client - Client that is used to interact with the smart contract
 * @param {TAddress} contractAddress - Address of the smart contract
 * @param {string} functionName - Name of the smart contract function to call
 * @param {TAddress} userAddress - Address of the user
 * @param {number} start - Starting index for pagination
 *
 * @returns {Promise<TFrontendContractData>} A Promise that resolves to the combined data retrieved from the contract, or an empty array in case of an error
 *
 * @note
 * - Data is expected to be an array where the first element (`data[0]`) contains the total number of items
 *
 * @throws Will log an error if the data fetching fails and return an empty array
 */

const getContractDataWithPagination = async (
  client: any,
  contractAddress: TAddress,
  functionName: string,
  userAddress: TAddress,
  start: number
): Promise<TFrontendContractData> => {
  try {
    let data = await client?.readContract({
      address: contractAddress,
      abi: IFrontendABI,
      functionName: functionName,
      args: [
        userAddress as TAddress,
        BigInt(start),
        BigInt(CONTRACT_PAGINATION),
      ],
    });

    const dataCount = Number(data[0]);

    let receivedData = CONTRACT_PAGINATION;

    if (dataCount > CONTRACT_PAGINATION) {
      const promises = [];

      while (receivedData < dataCount) {
        promises.push(
          client?.readContract({
            address: contractAddress,
            abi: IFrontendABI,
            functionName: functionName,
            args: [
              userAddress as TAddress,
              BigInt(receivedData),
              BigInt(CONTRACT_PAGINATION),
            ],
          })
        );

        receivedData += CONTRACT_PAGINATION;
      }

      const results = await Promise.all(promises);

      results.forEach((newData) => {
        data = data.map((item: TData, index: number) => {
          if (index && Array.isArray(newData[index])) {
            return [...item, ...newData[index]];
          }
          return item;
        });
      });
    }

    data = data.map((item: TData, index: number) => {
      if (index && Array.isArray(item)) {
        return item.slice(0, dataCount);
      }
      return item;
    });

    return data;
  } catch (error) {
    console.error(`Error fetching contract data: ${error?.message}`);
    return [];
  }
};

export { getContractDataWithPagination };
