import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { PlatformModal } from "./modals/PlatformModal";

import {
  Skeleton,
  FeeAPRModal,
  // BalanceVisibilityToggler,
} from "@ui";

import { connected, visible, isWeb3Load, aprFilter } from "@store";

import { formatNumber, calculateAPY, cn } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vaults: TVault[];
}

const Portfolio: React.FC<IProps> = memo(({ vaults }) => {
  const $connected = useStore(connected);
  const $visible = useStore(visible);
  const $isWeb3Load = useStore(isWeb3Load);
  const $aprFilter = useStore(aprFilter);

  const [feeAPRModal, setFeeAPRModal] = useState(false);
  const [platformModal, setPlatformModal] = useState(false);

  const [portfolio, setPortfolio] = useState({
    deposited: "0",
    monthly: "0",
    dailySum: "0",
    dailyPercent: "",
    monthPercent: "",
    apr: "0",
    apy: "0",
    tvl: "",
  });

  const initPortfolio = () => {
    if (!$connected) {
      const totalTvl = vaults.reduce((accumulator, v) => {
        return accumulator + (v.tvl ? Number(v.tvl) : 0);
      }, 0);
      setPortfolio({
        deposited: "0",
        monthly: "0",
        dailySum: "0",
        dailyPercent: "",
        monthPercent: "",
        apr: "0",
        apy: "0",
        tvl: formatNumber(totalTvl, "abbreviate") as string,
      });
      return;
    }

    let tvl = 0;
    let deposited = 0;
    let monthly = 0;
    let avgApr = 0;

    vaults.forEach((v) => {
      if (v.balance) {
        let apr =
          v?.type != "Vault"
            ? Number(v.APR)
            : Number(v?.earningData?.apr?.[$aprFilter]);

        const balance = Number(v.balanceInUSD);

        deposited += balance;
        monthly += ((apr / 100) * balance) / 12;
      }

      if (v.tvl) {
        tvl += Number(v.tvl);
      }
    });

    const dailySum = monthly / 30;
    avgApr = deposited !== 0 ? (100 * dailySum * 365) / deposited : 0;

    const dailyPercent = avgApr !== 0 ? String(avgApr / 365) : "0";
    const monthPercent = avgApr !== 0 ? String(avgApr / 12) : "0";
    setPortfolio({
      deposited: String(deposited.toFixed(2)),
      monthly: String(monthly.toFixed(2)),
      dailySum: String(dailySum.toFixed(2)),
      dailyPercent: dailyPercent,
      monthPercent: monthPercent,
      apr: String(avgApr.toFixed(3)),
      apy: String(calculateAPY(avgApr).toFixed(3)),
      tvl: formatNumber(tvl, "abbreviate") as string,
    });
  };

  const dailyYield = $connected
    ? `$${formatNumber(portfolio.dailySum, "format")}`
    : "-";

  const monthlyYield = $connected
    ? `$${formatNumber(portfolio.monthly, "format")}`
    : "-";
  const avgApr = $connected
    ? `${formatNumber(portfolio.apr, "formatAPR")}%`
    : "-";
  const avgApy = $connected
    ? `${formatNumber(portfolio.apy, "formatAPR")}%`
    : "-";

  useEffect(() => {
    localStorage.setItem("APRsFiler", JSON.stringify($aprFilter));
    if (vaults) {
      initPortfolio();
    }
  }, [$aprFilter, vaults]);

  return (
    <div className="font-manrope mt-4 md:mt-10 bg-[#101012] border border-[#23252A] rounded-lg">
      <div className="md:pt-6 md:pb-7 md:px-6 p-4">
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[1.4rem] font-medium">Portfolio</h3>
            <BalanceVisibilityToggler />
          </div>
        </div> */}
        <div className="flex items-center justify-start gap-6 flex-wrap whitespace-nowrap w-full">
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-[14px] select-none text-[#97979A] leading-5">
              Deposited
            </h2>
            <div
              data-testid="portfolioDeposited"
              className="portfolio__font text-white"
            >
              {$isWeb3Load ? (
                <div className="mt-2">
                  <Skeleton height={40} width={100} />
                </div>
              ) : (
                <p className={`${!$visible && "blur select-none"}`}>
                  {$visible
                    ? `$${formatNumber(portfolio.deposited, "format")}`
                    : "000$"}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-[14px] select-none text-[#97979A] leading-5">
              Daily Yield
            </h2>
            <div
              data-testid="portfolioDaily"
              className="portfolio__font text-white"
            >
              {$isWeb3Load ? (
                <div className="mt-2">
                  <Skeleton height={40} width={100} />
                </div>
              ) : (
                <p className={cn(!$visible && "blur select-none")}>
                  {$visible ? dailyYield : "000$"}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-[14px] select-none text-[#97979A] leading-5">
              Monthly Yield
            </h2>
            <div
              data-testid="portfolioMonthly"
              className="portfolio__font text-white"
            >
              {$isWeb3Load ? (
                <div className="mt-2">
                  <Skeleton height={40} width={100} />
                </div>
              ) : (
                <p className={cn(!$visible && "blur select-none")}>
                  {$visible ? monthlyYield : "000$"}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-[14px] select-none text-[#97979A] leading-5">
              AVG. APR
            </h2>
            <div
              data-testid="portfolioAPR"
              className="portfolio__font text-white"
            >
              {$isWeb3Load ? (
                <div className="mt-2">
                  <Skeleton height={40} width={100} />
                </div>
              ) : (
                <p className={cn(!$visible && "blur select-none")}>
                  {$visible ? avgApr : "000$"}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-[14px] select-none leading-5 text-[#8D8E96]">
              AVG. APY
            </h2>
            <div
              data-testid="portfolioAPY"
              className="portfolio__font text-white"
            >
              {$isWeb3Load ? (
                <div className="mt-2">
                  <Skeleton height={40} width={100} />
                </div>
              ) : (
                <p className={cn(!$visible && "blur select-none")}>
                  {$visible ? avgApy : "0000"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
      {platformModal && <PlatformModal setModalState={setPlatformModal} />}
    </div>
  );
});

export { Portfolio };
