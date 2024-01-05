import { vaultData } from "@store";

import type { TVaults } from "@types";

const addVaultData = (data: any[]) => {
  const vaultAddress = data[3];
  const vaultSharePrice = data[4];
  const vaultUserBalance = data[5];
  const vault: TVaults = {};
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
    vaultData.set(vault);
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
};

export { addVaultData };
