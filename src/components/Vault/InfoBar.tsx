import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";

import {
  APRtimeSwitcher,
  HideFeesHandler,
  FeeAPRModal,
  AssetsProportion,
} from "@components";

import { hideFeeApr, aprFilter } from "@store";

import { formatFromBigInt, formatNumber } from "@utils";

import { CHAINS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ vault }) => {
  const _publicClient = usePublicClient();

  const $hideFeeAPR = useStore(hideFeeApr);
  const $aprFilter = useStore(aprFilter);
  const [currentChain, setCurrentChain] = useState<any>();

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
    if (_publicClient) {
      setCurrentChain(
        CHAINS.find((item) => item.name === _publicClient.chain.name)
      );
    }
  }, [_publicClient]);

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
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px] px-4">
        <div className="hidden lg:flex items-center gap-1">
          <AssetsProportion
            proportions={vault.assetsProportions}
            assets={vault?.assets}
            type="vault"
          />
          <img
            className="w-7 h-7 rounded-full mr-3 hidden lg:flex"
            src={currentChain?.logoURI}
            alt={currentChain?.name}
            title={currentChain?.name}
          />
        </div>
        <div className="flex items-center gap-3">
          <HideFeesHandler setModalState={setFeeAPRModal} />
          <APRtimeSwitcher />
        </div>
      </div>
      <div className="flex w-full gap-5 p-4">
        <div className="flex items-center flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="flex flex-row lg:flex-col items-start gap-5 w-full">
            <div className="w-1/2 lg:w-auto ">
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
            <div className="hidden lg:block">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                DAILY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.dailyAPR}% / {earnData.dailyEarn}$
              </p>
            </div>
            <div className="block lg:hidden w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                APR / APY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.apr}% / {earnData.apy}%
              </p>
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-5">
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                SHARE PRICE
              </p>
              <p className="text-[16px] whitespace-nowrap">
                ${formatFromBigInt(vault.shareprice, 18, "withDecimals")}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                MONTHLY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.monthlyAPR}% / {earnData.monthlyEarn}$
              </p>
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-5">
            <div className="w-1/2 lg:w-auto">
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
            <div className="block lg:hidden w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                DAILY
              </p>
              <p className="text-[16px] whitespace-nowrap">
                {earnData.dailyAPR}% / {earnData.dailyEarn}$
              </p>
            </div>
            <div className="hidden lg:block">
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
