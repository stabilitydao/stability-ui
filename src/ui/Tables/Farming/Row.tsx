import { formatNumber } from "@utils";

import { SILO_POINTS } from "@constants";

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
  const link = `/vaults/vault/${vault.network}/${vault.address}`;

  const modalData = {
    earningData: vault.earningData,
    daily: vault.daily,
    lastHardWork: vault.lastHardWork,
    symbol: vault?.risk?.symbol as string,
    state: true,
    type: "vault",
    pool: vault?.pool,
  };

  const currentLtv = vault?.leverageLending?.ltv.toFixed(2) ?? 0;
  const maxLtv = vault?.leverageLending?.maxLtv.toFixed(2) ?? 0;

  const lendingPlatform = vault.strategyInfo.protocols[0].name;

  return (
    <a
      className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center border border-[#23252A] border-b-0 w-[762px] md:w-[960px] lg:w-full"
      data-testid="vault"
      href={link}
    >
      <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[25%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A] lg:border-r-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center">
            {vault.assets.map((asset, index) => (
              <img
                src={asset?.logo}
                alt={asset?.symbol}
                className={`w-5 h-5 md:w-8 md:h-8 rounded-full ${
                  !index && vault.assets.length > 1 && "mr-[-8px] z-[5]"
                }`}
                key={asset?.logo + index}
              />
            ))}
          </div>
          <span className="font-semibold text-[16px] max-w-[100px] md:max-w-[80px] lg:max-w-[130px] truncate overflow-hidden whitespace-nowrap">
            {vault.assetsSymbol}
          </span>
        </div>

        <div className="hidden xl:flex items-center justify-center gap-1">
          {!vault.symbol.includes("PT-") && (
            <div
              title="Sonic Activity Points"
              className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
            >
              <div className="flex items-center gap-1 px-2">
                <img
                  src="/sonic.png"
                  alt="sonic"
                  className="w-3 h-3 rounded-full"
                />
                <span className="text-[10px]">x{vault.sonicActivePoints}</span>
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
                  className="w-3 h-3 rounded-full"
                />
                <span className="text-[10px]">
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
                  className="w-3 h-3 rounded-full"
                />
                <span className="text-[10px]">x{vault.ringsPoints}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-2 md:px-4 w-[80px] md:w-[15%]">
        <div className="px-2 py-1 rounded text-[12px] leading-4 text-[#97979A] bg-[#151618] border border-[#23252A]">
          {lendingPlatform}
        </div>
      </div>
      <div className="px-2 md:px-4 w-[98px] md:w-[15%] text-[16px] leading-5 text-end">
        {vault?.leverage}x
      </div>
      <div className="px-2 md:px-4 w-[120px] md:w-[20%] lg:w-[15%] text-[12px] xl:text-[14px] leading-5 text-end">
        {currentLtv}% / {maxLtv}%
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setModalState(modalData);
        }}
        className="px-4 w-[100px] md:w-[15%] lg:w-[10%] text-[16px] leading-5 text-end tooltip cursor-help"
      >
        <div
          className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
            vault?.risk?.isRektStrategy ? "text-[#818181]" : "text-[#eaecef]"
          }`}
        >
          <div className="flex flex-col justify-end">
            <p className="text-[16px]">
              {formatNumber(APRs.APR, "formatAPR")}%
            </p>
            {!!vault?.liveAPR && (
              <p className="text-[14px] text-[#97979A]">
                live. {vault?.liveAPR?.toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-2 md:px-4 w-[100px] md:w-[10%] text-[16px] leading-5 text-end">
        {formatNumber(vault.tvl, "abbreviate")}
      </div>
      <div className="px-2 md:px-4 w-[100px] md:w-[10%] text-[16px] leading-5 text-end">
        ${formatNumber(vault.balanceInUSD, "format")}
      </div>
    </a>
  );
};

export { Row };
