type TOptions = {
  address: string;
  decimals: string | number;
  symbol: string;
  image?: string;
};

/**
 * Adds an ERC20 asset to a wallet using the provided client
 *
 * @example
 * ```
 * const client = ...; // Initialize client
 * const address = '0x1234567890abcdef';
 * const decimals = 18;
 * const symbol = 'ETH';
 * const image = 'https://example.com/eth.png';
 *
 * addAssetToWallet(client, address, decimals, symbol, image)
 *   .then(() => console.log('Asset added successfully'))
 *   .catch(error => console.error('Failed to add asset:', error));
 * ```
 *
 * @param {any} client - Client object used to interact with the wallet
 * @param {string} address - Contract address of the ERC20 asset
 * @param {number} decimals - Number of decimals the ERC20 asset uses
 * @param {string} symbol - Symbol of the ERC20 asset
 * @param {string} [image] - (Optional) URL of the asset's image
 *
 * @returns {Promise<void>} Promise that resolves when the asset is successfully added or rejects with an error
 */

export const addAssetToWallet = async (
  client: any,
  address: string,
  decimals: number,
  symbol: string,
  image?: string
): Promise<void> => {
  try {
    const options: TOptions = {
      address: address,
      decimals: decimals,
      symbol: symbol,
    };

    if (image) {
      options.image = image;
    }

    await client?.data.watchAsset({
      type: "ERC20",
      options: options,
    });
  } catch (error) {
    console.log("ADD ASSET ERROR:", error);
  }
};
