import type { TVaultDataKey, TPlatformGetBalance } from "@types";

const addVaultData = (data: TPlatformGetBalance): TVaultDataKey | undefined => {
  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
  const vault: TVaultDataKey = {};
  if (
    vaultAddress.length === vaultSharePrice.length &&
    vaultAddress.length === vaultUserBalance.length
  ) {
    for (let i = 0; i < vaultAddress.length; i++) {
      vault[vaultAddress[i].toLowerCase()] = {
        vaultSharePrice: vaultSharePrice[i],
        vaultUserBalance: vaultUserBalance[i],
      };
    }
    return vault;
  } else {
    console.error("There is an error, arrays length are different.");
  }
};

export { addVaultData };
