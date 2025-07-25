import { StrategyBadge } from "@ui";

import { formatNumber } from "@utils";

import { SILO_POINTS, VAULTS_WITH_NAME } from "@constants";

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
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const Row: React.FC<IProps> = ({ APRs, vault, setModalState }) => {
  // const isSTBLVault =
  //   Array.isArray(vault?.assets) &&
  //   vault.assets.some((asset) => asset?.symbol && asset?.symbol === "STBL");

  const link = vault?.isMetaVault
    ? `/metavaults/metavault/${vault.address}`
    : `/vaults/vault/${vault.network}/${vault.address}`;

  const modalData = !vault?.isMetaVault
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

  return (
    <div className="border border-[#23252A] border-b-0">
      <a
        className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center"
        data-testid="vault"
        href={link}
      >
        <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[30%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A] lg:border-r-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center">
              {vault?.isMetaVault ? (
                <img
                  className="md:w-8 md:h-8 w-5 h-5 rounded-full flex-shrink-0"
                  src={`/features/${vault.symbol}.png`}
                  alt="logo"
                />
              ) : (
                vault.assets.map((asset, index) => (
                  <img
                    src={asset?.logo}
                    alt={asset?.symbol}
                    className={`md:w-8 md:h-8 w-5 h-5 rounded-full flex-shrink-0 ${
                      !index && vault.assets.length > 1 && "mr-[-8px] z-[5]"
                    }`}
                    key={asset?.logo + index}
                  />
                ))
              )}
            </div>
            <span className="font-semibold text-[16px] max-w-[100px] md:max-w-[130px] truncate overflow-hidden whitespace-nowrap">
              {vault?.isMetaVault
                ? vault.symbol
                : (VAULTS_WITH_NAME[vault.address] ?? vault.assetsSymbol)}
            </span>
          </div>

          <div className="hidden lg:flex items-center justify-center gap-1">
            {!vault.symbol.includes("PT-") && !!vault?.sonicPoints && (
              <div
                title="Sonic Activity Points"
                className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 px-2">
                  <img
                    src="/sonic.png"
                    alt="sonic"
                    className="w-4 h-4 rounded-full"
                  />

                  <span className="text-[12px]">x{vault?.sonicPoints}</span>
                </div>
              </div>
            )}
            {SILO_POINTS[vault.address as keyof typeof SILO_POINTS] && (
              <div
                title="Silo Points per $ / day"
                className="rounded-[4px] border border-[#FFA500] bg-[#36280f] h-6 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 px-2">
                  <img
                    src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                    alt="silo"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-[12px]">
                    {SILO_POINTS[vault.address as keyof typeof SILO_POINTS]}
                  </span>
                </div>
              </div>
            )}

            {!!vault.ringsPoints && (
              <div
                title="Rings Points"
                className="rounded-[4px] border border-[#5E6AD2] bg-[#1C1E31] h-6 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 px-2">
                  <img
                    src="/rings.png"
                    alt="rings"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-[12px]">x{vault.ringsPoints}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-2 md:px-4 w-[150px] md:w-[17.5%]">
          {!vault?.isMetaVault ? (
            <StrategyBadge
              info={vault.strategyInfo}
              specific={vault.strategySpecific}
            />
          ) : null}
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setModalState(modalData);
          }}
          className="px-2 md:px-4 w-[100px] md:w-[17.5%] tooltip cursor-help"
        >
          <div
            className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
              vault?.risk?.isRektStrategy ? "text-[#818181]" : "text-[#eaecef]"
            }`}
          >
            <div className="flex flex-col justify-end">
              <p className="text-[16px]">
                {formatNumber(
                  vault.isMetaVault ? vault.totalAPR : APRs.APR,
                  "formatAPR"
                )}
                %
              </p>
              {!!vault?.liveAPR && (
                <p className="text-[14px] text-[#97979A]">
                  live. {vault?.liveAPR?.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
          {formatNumber(vault.tvl, "abbreviate")}
        </div>
        <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
          <p>${formatNumber(vault.balanceInUSD, "format")}</p>
        </div>
      </a>
    </div>
  );
};

export { Row };
