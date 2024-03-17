import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { APRtimeSwitcher, HideFeesHandler, FeeAPRModal } from "@components";

import { hideFeeApr, aprFilter } from "@store";

import { formatFromBigInt, formatNumber } from "@utils";

import type { TVault } from "@types";
import { formatUnits, parseUnits } from "viem";

interface IProps {
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ vault }) => {
  const $hideFeeAPR = useStore(hideFeeApr);
  const $aprFilter = useStore(aprFilter);

  const [feeAPRModal, setFeeAPRModal] = useState(false);
  const [userBalances, setUserBalances] = useState({
    shareBalance: 0,
    USDBalance: 0,
  });
  const [earnData, setEarnData] = useState({
    apr: "",
    apy: "",
    monthlyAPR: "",
    monthlyEarn: "",
    dailyAPR: "",
    dailyEarn: "",
  });

  useEffect(() => {
    let apr, apy, monthlyAPR, monthlyEarn, dailyAPR, dailyEarn;

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
    monthlyAPR = Number(apr) / 12;
    monthlyEarn = String(
      ((userBalances.USDBalance * monthlyAPR) / 100).toFixed(2)
    );
    monthlyAPR = String(monthlyAPR.toFixed(2));

    dailyAPR = Number(apr) / 365;
    dailyEarn = String(((userBalances.USDBalance * dailyAPR) / 100).toFixed(2));
    dailyAPR = String(dailyAPR.toFixed(2));

    setEarnData({ apr, apy, monthlyAPR, monthlyEarn, dailyAPR, dailyEarn });
  }, [$hideFeeAPR, $aprFilter, userBalances]);

  useEffect(() => {
    if (vault?.balance && vault?.shareprice) {
      const vaultBalance = BigInt(vault?.balance);

      const shareBalance = Number(
        formatFromBigInt(vault?.balance, 18).toFixed(5)
      );

      const USDBalance = Number(
        (
          formatFromBigInt(vault.shareprice, 18, "withDecimals") *
          Number(formatUnits(vaultBalance, 18))
        ).toFixed(2)
      );

      setUserBalances({ shareBalance, USDBalance });
    }
  }, [vault]);
  return (
    <div className="bg-button rounded-md">
      <div className="flex items-start min-[1150px]:items-center flex-col min-[1150px]:flex-row justify-between py-8 px-2 min-[1150px]:p-4">
        <div className="flex items-center justify-between gap-5">
          <div className="flex flex-col items-start justify-between gap-2 h-[90px]">
            <div>
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                TVL
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {formatNumber(
                  formatFromBigInt(vault.tvl, 18, "withFloor"),
                  "abbreviate"
                )}
              </p>
            </div>
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                DEPOSITED
              </p>
              <div className="text-[16px] flex whitespace-nowrap">
                <p className="mr-1">
                  {formatNumber(userBalances.shareBalance, "format")}
                </p>
                <p className="whitespace-nowrap md:hidden lg:block">
                  / ${formatNumber(userBalances.USDBalance, "format")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-[1150px]:hidden flex-col items-start justify-between gap-2 h-[90px]">
            <div>
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                SHARE PRICE
              </p>
              <p className="text-[16px] whitespace-nowrap">
                ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
              </p>
            </div>
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                Daily
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.dailyAPR}% / {earnData.dailyEarn}$
              </p>
            </div>
          </div>
        </div>
        <div className="hidden min-[1150px]:flex flex-col items-start justify-between gap-2 h-[90px]">
          <div>
            <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
              SHARE PRICE
            </p>
            <p className="text-[16px] whitespace-nowrap">
              ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
            </p>
          </div>
          <div className="flex flex-col my-2 md:my-0">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
              Daily
            </p>
            <p className="text-[16px] whitespace-nowrap">
              {earnData.dailyAPR}% / {earnData.dailyEarn}$
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between h-[90px] mt-5 min-[1150px]:mt-0">
          <div className="flex items-center justify-start gap-3">
            <HideFeesHandler setModalState={setFeeAPRModal} />
            <APRtimeSwitcher />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                MONTHLY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.monthlyAPR}% / {earnData.monthlyEarn}$
              </p>
            </div>
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                APR / APY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.apr}% / {earnData.apy}%
              </p>
            </div>
          </div>
        </div>
      </div>
      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { InfoBar };
