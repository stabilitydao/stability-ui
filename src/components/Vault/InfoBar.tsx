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
  const [balances, setBalances] = useState({ shareBalance: 0, USDBalance: 0 });
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
    monthlyEarn = String(((balances.USDBalance * monthlyAPR) / 100).toFixed(2));
    monthlyAPR = String(monthlyAPR.toFixed(2));

    dailyAPR = Number(apr) / 365;
    dailyEarn = String(((balances.USDBalance * dailyAPR) / 100).toFixed(2));
    dailyAPR = String(dailyAPR.toFixed(2));

    setEarnData({ apr, apy, monthlyAPR, monthlyEarn, dailyAPR, dailyEarn });
  }, [$hideFeeAPR, $aprFilter, balances]);

  useEffect(() => {
    if (vault?.balance && vault?.shareprice) {
      const vaultBalance = BigInt(vault?.balance);

      const shareBalance = Number(
        formatNumber(formatFromBigInt(vault?.balance, 18).toFixed(5), "format")
      );

      const USDBalance = Number(
        formatNumber(
          (
            formatFromBigInt(vault.shareprice, 18, "withDecimals") *
            Number(formatUnits(vaultBalance, 18))
          ).toFixed(2),
          "format"
        )
      );

      setBalances({ shareBalance, USDBalance });
    }
  }, [vault]);
  return (
    <div className="bg-button rounded-md">
      <div className="flex items-start min-[1150px]:items-center flex-col min-[1150px]:flex-row justify-between py-8 px-2 min-[1150px]:p-4">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-start gap-2 h-[90px]">
            <div>
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                TVL
              </p>
              <p className="text-[18px] md:text-[14px] min-[950px]:text-[18px]">
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
              <div className="text-[18px] h-8 flex">
                <p className="mr-1">{balances.shareBalance}</p>
                <p className="whitespace-nowrap md:hidden lg:block">
                  / ${balances.USDBalance}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 h-[90px]">
            <div>
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                SHARE PRICE
              </p>
              <p className="text-[18px] md:text-[14px] min-[950px]:text-[18px]">
                ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
              </p>
            </div>
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                Daily
              </p>
              <p className="text-[18px]">
                {earnData.dailyAPR}% / {earnData.dailyEarn}$
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between h-[90px] mt-5 min-[1150px]:mt-0">
          <div className="flex items-center justify-start gap-3">
            <HideFeesHandler setModalState={setFeeAPRModal} />
            <APRtimeSwitcher />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                MONTHLY
              </p>
              <p className="text-[18px]">
                {earnData.monthlyAPR}% / {earnData.monthlyEarn}$
              </p>
            </div>
            <div className="flex flex-col my-2 md:my-0">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                APR / APY
              </p>
              <p className="text-[18px]">
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
