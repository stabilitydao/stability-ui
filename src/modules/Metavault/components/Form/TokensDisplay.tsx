import type React from "react";

import { TransactionTypes, TTokenData, VaultTypes } from "@types";

interface IProps {
  actionType: TransactionTypes;
  type: VaultTypes;
  activeAsset: {
    deposit: TTokenData;
    withdraw: TTokenData;
    wrap: TTokenData;
    unwrap: TTokenData;
  };
}

const BASE_TOKEN = {
  address: "0x29219dd400f2bf60e5a23d13be72b486d4038894",
  chainId: 146,
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg",
  name: "USD Coin",
  symbol: "USDC",
};

const TokensDisplay: React.FC<IProps> = ({ actionType, type, activeAsset }) => {
  const currentToken = Object.values(activeAsset?.[actionType]).length
    ? activeAsset?.[actionType]
    : BASE_TOKEN;

  const isFeatureIcon =
    ([TransactionTypes.Wrap, TransactionTypes.Unwrap].includes(actionType) &&
      type === VaultTypes.MetaVault) ||
    (actionType === TransactionTypes.Unwrap && type === VaultTypes.MultiVault);

  const iconSrc = isFeatureIcon
    ? `/features/${currentToken.symbol}.png`
    : currentToken.logoURI;

  return (
    <div className="bg-[#1B1D21] border border-[#23252A] rounded-lg py-3 px-4 flex items-center gap-3">
      <img
        src={iconSrc}
        alt={currentToken.symbol}
        title={currentToken.symbol}
        className="w-4 h-4 rounded-full"
      />
      <span className="text-[16px] leading-6 font-medium">
        {currentToken.symbol}
      </span>
    </div>
  );
};

export { TokensDisplay };
