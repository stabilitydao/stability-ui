// import { RewardsCarousel } from "../../RewardsCarousel";

import { formatNumber } from "@utils";

import { VAULTS_WITH_NAME } from "@constants";

import { TVault, TAPRModal } from "@types";

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
  setModalState?: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const Grid: React.FC<IProps> = ({ APRs, vault }) => {
  // const POINTS = { sonic: vault.sonicActivePoints, rings: vault.ringsPoints };

  return (
    <a
      className="bg-[#101012] cursor-pointer font-medium relative border border-[#23252A] rounded-lg w-full md:w-[48%] overflow-hidden"
      data-testid="vault"
      href={`/vaults/vault/${vault.network}/${vault.address}`}
    >
      <div className="p-6 flex flex-col gap-3 md:gap-6">
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
            <span className="font-semibold text-[16px] truncate overflow-hidden whitespace-nowrap">
              {VAULTS_WITH_NAME[vault.address] || vault.assetsSymbol}
            </span>
            {/* <RewardsCarousel
              address={vault.address}
              symbol={vault.symbol}
              points={POINTS}
            /> */}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#97979A] text-[14px]">APR</span>
            <div
            // onClick={(e) => {
            // e.stopPropagation();
            // e.preventDefault();
            // setModalState({
            //   earningData: vault.earningData,
            //   daily: vault.daily,
            //   lastHardWork: vault.lastHardWork,
            //   symbol: vault?.risk?.symbol as string,
            //   state: true,
            //   pool: vault?.pool,
            // });
            // }}
            // className="cursor-help"
            >
              <div
                className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
                  vault?.risk?.isRektStrategy
                    ? "text-[#818181]"
                    : "text-[#eaecef]"
                }`}
              >
                <p className="text-[14px] font-bold text-[#48c05c]">
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
        </div>
      </div>
    </a>
  );
};

export { Grid };
