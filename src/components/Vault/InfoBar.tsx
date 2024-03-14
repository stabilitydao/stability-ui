import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { APRtimeSwitcher, HideFeesHandler, FeeAPRModal } from "@components";

import { hideFeeApr, aprFilter } from "@store";

import { formatFromBigInt, formatNumber } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ vault }) => {
  const $hideFeeAPR = useStore(hideFeeApr);
  const $aprFilter = useStore(aprFilter);

  const [feeAPRModal, setFeeAPRModal] = useState(false);
  const [earnData, setEarnData] = useState({ apr: "", apy: "" });

  const shareBalance = formatNumber(
    formatFromBigInt(vault.balance, 18).toFixed(5),
    "format"
  );

  const USDBalance = Number(
    formatNumber(
      (
        formatFromBigInt(vault.shareprice, 18, "withDecimals") *
        Number(formatFromBigInt(vault.balance, 18, "withDecimals"))
      ).toFixed(2),
      "format"
    )
  );

  const dailyEarn = ((USDBalance * vault.daily) / 100).toFixed(2);

  useEffect(() => {
    let apr, apy;
    if ($hideFeeAPR) {
      switch ($aprFilter) {
        case "24h":
          apr = vault.earningData.apr.withoutFees.daily;
          apy = vault.earningData.apy.withoutFees.daily;
          break;
        case "week":
          apr = vault.earningData.apr.withoutFees.weekly;
          apy = vault.earningData.apy.withoutFees.weekly;
          break;
        default:
          apr = vault.earningData.apr.withoutFees[$aprFilter];
          apy = vault.earningData.apy.withoutFees[$aprFilter];
          break;
      }
    } else {
      switch ($aprFilter) {
        case "24h":
          apr = vault.earningData.apr.withFees.daily;
          apy = vault.earningData.apy.withFees.daily;
          break;
        case "week":
          apr = vault.earningData.apr.withFees.weekly;
          apy = vault.earningData.apy.withFees.weekly;
          break;
        default:
          apr = vault.earningData.apr.withFees[$aprFilter];
          apy = vault.earningData.apy.withFees[$aprFilter];
          break;
      }
    }
    setEarnData({ apr: apr, apy: apy });
  }, [$hideFeeAPR, $aprFilter]);

  return (
    <div className="bg-button rounded-md">
      <div className="flex flex-wrap justify-between gap-2 md:gap-0 items-center p-4 md:h-[80px] mt-[-40px] md:mt-0">
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            TVL
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            {formatNumber(
              formatFromBigInt(vault.tvl, 18, "withFloor"),
              "abbreviate"
            )}
          </p>
        </div>
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            SHARE PRICE
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
          </p>
        </div>
        <div>
          <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
            APR / APY
          </p>
          <p className="text-[20px] md:text-[14px] min-[950px]:text-[20px]">
            {earnData.apr}% / {earnData.apy}%
          </p>
        </div>
      </div>
      <div className="flex justify-between flex-wrap items-center px-5 py-2 md:py-4 md:h-[80px] mt-3">
        <div className="flex items-center gap-5">
          <div className="flex flex-col my-2 md:my-0">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
              Your Balance
            </p>
            <div className="text-[20px] h-8 flex">
              <p className="mr-1">{shareBalance}</p>
              <p className="whitespace-nowrap md:hidden lg:block">
                / ${USDBalance}
              </p>
            </div>
          </div>
          <div className="flex flex-col my-2 md:my-0">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
              Daily
            </p>
            <p>
              {vault.daily}% / {dailyEarn}$
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HideFeesHandler setModalState={setFeeAPRModal} />
          <APRtimeSwitcher />
        </div>
      </div>
      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { InfoBar };
