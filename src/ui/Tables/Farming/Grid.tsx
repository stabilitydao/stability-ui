import { RewardsCarousel } from "../../RewardsCarousel";

import { formatNumber } from "@utils";

import { TVault } from "@types";

interface IProps {
  APRs: {
    APR: string;
    APY: string;
    swapFees: string;
    strategyAPR: string;
    dailyAPR: string;
    gemsAPR: string;
  };
  vault: TVault;
}

const Grid: React.FC<IProps> = ({ APRs, vault }) => {
  const POINTS = { sonic: vault.sonicPoints, rings: vault.ringsPoints };

  const link = `/vaults/vault/${vault.network}/${vault.address}`;

  const currentLtv = vault?.leverageLending?.ltv.toFixed(2) ?? 0;
  const maxLtv = vault?.leverageLending?.maxLtv.toFixed(2) ?? 0;

  const lendingPlatform = vault.strategyInfo.protocols[0].name;

  return (
    <a
      className="bg-[#101012] cursor-pointer font-medium relative border border-[#23252A] rounded-lg overflow-hidden"
      data-testid="vault"
      href={link}
    >
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0">
            {vault.assets.map((asset, index) => (
              <img
                src={asset?.logo}
                alt={asset?.symbol}
                className={`w-10 h-10 rounded-full ${
                  !index && vault.assets.length > 1 && "mr-[-16px] z-[5]"
                }`}
                key={asset?.logo + index}
              />
            ))}
          </div>

          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-[16px] max-w-[130px] truncate overflow-hidden whitespace-nowrap">
              {vault?.isMetaVault ? vault.symbol : vault.assetsSymbol}
            </span>
            <RewardsCarousel address={vault.address} points={POINTS} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#97979A]">Lending Platform</span>
            <span className="font-bold">{lendingPlatform}</span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#97979A]">Leverage</span>
            <span className="font-bold">{vault?.leverage}x</span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#97979A]">LTV / Max LTV</span>
            <span className="font-bold text-[12px]">
              {currentLtv}% / {maxLtv}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#97979A] text-[14px]">APR</span>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="cursor-help"
            >
              <div
                className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
                  vault?.risk?.isRektStrategy
                    ? "text-[#818181]"
                    : "text-[#eaecef]"
                }`}
              >
                <p className="text-[14px] font-bold">
                  {formatNumber(APRs.APR, "formatAPR")}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#97979A]">TVL</span>
            <span className="font-bold">
              {formatNumber(vault.tvl, "abbreviate")}
            </span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#97979A]">Deposit</span>
            <p className="font-bold">
              ${formatNumber(vault.balanceInUSD, "format")}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
};

export { Grid };
