import { RewardsCarousel } from "../../RewardsCarousel";
import { StrategyBadge } from "../../StrategyBadge";
import { MetaVaultStrategies } from "../../MetaVaultStrategies";

import { formatNumber } from "@utils";

import { VAULTS_WITH_NAME, CHAINS } from "@constants";

import { TVault, TAPRModal, VaultTypes } from "@types";

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
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const Grid: React.FC<IProps> = ({ APRs, vault, setModalState }) => {
  const POINTS = {
    sonic: vault.sonicPoints,
    rings: vault.ringsPoints,
  };

  const link =
    vault?.type === VaultTypes.Vault
      ? `/vaults/vault/${vault.network}/${vault.address}`
      : `/metavaults/metavault/${vault.address}`;

  const modalData =
    vault?.type === VaultTypes.Vault
      ? {
          earningData: vault.earningData,
          daily: vault.daily,
          lastHardWork: vault.lastHardWork,
          symbol: vault?.risk?.symbol as string,
          state: true,
          type: "vault",
          pool: vault?.pool,
        }
      : {
          APR: vault?.APR,
          merklAPR: vault?.merklAPR,
          gemsAPR: vault?.gemsAPR,
          totalAPR: vault?.totalAPR,
          state: true,
          type: "metaVault",
        };

  const chainData = CHAINS.find(({ id }) => id == vault.network);

  return (
    <a
      className="bg-[#101012] cursor-pointer font-medium relative border border-[#23252A] rounded-lg overflow-hidden"
      data-testid="vault"
      href={link}
    >
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0 relative">
            {vault?.type != VaultTypes.Vault ? (
              <img
                className="w-10 h-10 rounded-full flex-shrink-0"
                src={`/features/${vault.symbol}.png`}
                alt={vault.symbol}
              />
            ) : (
              vault.assets.map((asset, index) => (
                <img
                  src={asset?.logo}
                  alt={asset?.symbol}
                  className={`w-10 h-10 rounded-full ${
                    !index && vault.assets.length > 1 && "mr-[-16px] z-[5]"
                  }`}
                  key={asset?.logo + index}
                />
              ))
            )}
            {chainData ? (
              <div
                className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center absolute bottom-0 right-0 rounded-md"
                style={{ backgroundColor: chainData.color }}
              >
                <img
                  src={chainData.logoURI}
                  alt={chainData.name}
                  className="md:w-3 md:h-3"
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-[16px] max-w-[130px] truncate overflow-hidden whitespace-nowrap">
              {vault?.type != VaultTypes.Vault
                ? vault.symbol
                : (VAULTS_WITH_NAME[vault.address] ?? vault.assetsSymbol)}
            </span>
            <RewardsCarousel address={vault.address} points={POINTS} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#97979A] text-[14px]">
              {vault?.type === VaultTypes.Vault ? "Strategy" : "Strategies"}
            </span>
            {vault?.type === VaultTypes.Vault ? (
              <StrategyBadge
                info={vault.strategyInfo}
                specific={vault.strategySpecific}
              />
            ) : (
              <MetaVaultStrategies strategies={vault?.strategies} />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#97979A] text-[14px]">APR</span>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setModalState(modalData);
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
            <span className="text-[#97979A]">Balance</span>
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
