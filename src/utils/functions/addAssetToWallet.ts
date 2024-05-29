export const addAssetToWallet = async (
  client: any,
  address: string,
  decimals: number,
  symbol: string
) => {
  try {
    client?.data.watchAsset({
      type: "ERC20",
      options: {
        address: address,
        decimals: decimals,
        symbol: symbol,
      },
    });
  } catch (error) {
    console.log("ADD ASSET ERROR:", error);
  }
};
