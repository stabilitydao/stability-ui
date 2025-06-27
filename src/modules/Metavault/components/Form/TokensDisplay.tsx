import type React from "react";

import { META_VAULTS_TYPE } from "@constants";

import { TransactionTypes, TTokenData } from "@types";

interface IProps {
  actionType: TransactionTypes;
  symbol: string;
  activeAsset: {
    deposit: TTokenData;
    withdraw: TTokenData;
    wrap: TTokenData;
    unwrap: TTokenData;
  };
}

const TokensDisplay: React.FC<IProps> = ({
  actionType,
  symbol,
  activeAsset,
}) => {
  const currentToken = activeAsset?.[actionType];

  const isFeatureIcon =
    ([TransactionTypes.Wrap, TransactionTypes.Unwrap].includes(actionType) &&
      META_VAULTS_TYPE[symbol] === "metaVault") ||
    (actionType === TransactionTypes.Unwrap &&
      META_VAULTS_TYPE[symbol] === "multiVault");

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
