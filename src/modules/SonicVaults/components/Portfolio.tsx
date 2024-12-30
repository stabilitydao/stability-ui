import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { PlatformModal } from "./modals/PlatformModal";

import {
  Skeleton,
  APRtimeSwitcher,
  FeeAPRModal,
  BalanceVisibilityToggler,
} from "@ui";

import { connected, visible, isWeb3Load, aprFilter } from "@store";

import { formatNumber, calculateAPY } from "@utils";

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
        let apr = Number(v?.earningData?.apr?.[$aprFilter]);

        let vaultBalance = Number(formatUnits(BigInt(v.balance), 18));
        let vaultSharePrice = Number(v.shareprice);
        apr = Number(apr);
        const balance = vaultBalance * vaultSharePrice;
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
    ? `$${formatNumber(portfolio.dailySum, "format")} / ${formatNumber(
        portfolio.dailyPercent,
        "format"
      )}%`
    : "-";
  const monthlyYield = $connected
    ? `$${formatNumber(portfolio.monthly, "format")} / ${formatNumber(
        portfolio.monthPercent,
        "format"
      )}%`
    : "-";
  const avgApr = $connected ? `${formatNumber(portfolio.apr, "format")}%` : "-";
  const avgApy = $connected ? `${formatNumber(portfolio.apy, "format")}%` : "-";

  useEffect(() => {
    localStorage.setItem("APRsFiler", JSON.stringify($aprFilter));
    if (vaults) {
      initPortfolio();
    }
  }, [$aprFilter, vaults]);

  return (
    <div className="my-2 rounded-sm font-manrope">
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[1.4rem] font-medium">Portfolio</h3>
            <BalanceVisibilityToggler />
          </div>
          <div className="hidden items-start justify-center flex-col md:flex">
            <APRtimeSwitcher withText={true} />
          </div>
        </div>
        <div className="flex items-start justify-between flex-wrap lg:flex-nowrap gap-3 mt-[6px]">
          <div className="hidden md:flex items-center justify-start gap-5 flex-wrap whitespace-nowrap w-full">
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                DEPOSITED
              </h2>
              <div
                data-testid="portfolioDeposited"
                className="text-[18px] text-neutral-50 font-semibold"
              >
                {$isWeb3Load ? (
                  <div className="mt-2">
                    <Skeleton height={21} width={100} />
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
            <div className="max-w-[130px] w-full md:max-w-[150px]  flex flex-col items-start">
              <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                DAILY YIELD
              </h2>
              <div
                data-testid="portfolioDaily"
                className="text-[18px] text-neutral-50 font-semibold"
              >
                {$isWeb3Load ? (
                  <div className="mt-2">
                    <Skeleton height={21} width={100} />
                  </div>
                ) : (
                  <p className={`${!$visible && "blur select-none"}`}>
                    {$visible ? dailyYield : "000$"}
                  </p>
                )}
              </div>
            </div>
            <div className="w-[120px] md:w-[180px] flex flex-col items-start">
              <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                MONTHLY YIELD
              </h2>
              <div
                data-testid="portfolioMonthly"
                className="text-[18px] text-neutral-50 font-semibold"
              >
                {$isWeb3Load ? (
                  <div className="mt-2">
                    <Skeleton height={21} width={100} />
                  </div>
                ) : (
                  <p className={`${!$visible && "blur select-none"}`}>
                    {$visible ? monthlyYield : "000$"}
                  </p>
                )}
              </div>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                AVG. APR
              </h2>
              <div
                data-testid="portfolioAPR"
                className="text-[18px] text-neutral-50 font-semibold"
              >
                {$isWeb3Load ? (
                  <div className="mt-2">
                    <Skeleton height={21} width={100} />
                  </div>
                ) : (
                  <p className={`${!$visible && "blur select-none"}`}>
                    {$visible ? avgApr : "000$"}
                  </p>
                )}
              </div>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px]  select-none leading-5 text-[#8D8E96]">
                AVG. APY
              </h2>
              <div
                data-testid="portfolioAPY"
                className="text-[18px] text-neutral-50 font-semibold"
              >
                {$isWeb3Load ? (
                  <div className="mt-2">
                    <Skeleton height={21} width={100} />
                  </div>
                ) : (
                  <p className={`${!$visible && "blur select-none"}`}>
                    {$visible ? avgApy : "0000"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="md:hidden flex items-start justify-between whitespace-nowrap w-full">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-start">
                <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                  DEPOSITED
                </h2>
                <div className="text-[18px] text-neutral-50 font-semibold">
                  {$isWeb3Load ? (
                    <div className="mt-1">
                      <Skeleton height={21} width={100} />
                    </div>
                  ) : (
                    <p className={`${!$visible && "blur select-none"}`}>
                      {$visible
                        ? `$${formatNumber(portfolio.deposited, "format")}`
                        : "0000"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                  MONTHLY YIELD
                </h2>
                <div className="text-[18px] text-neutral-50 font-semibold">
                  {$isWeb3Load ? (
                    <div className="mt-1">
                      <Skeleton height={21} width={100} />
                    </div>
                  ) : (
                    <p className={`${!$visible && "blur select-none"}`}>
                      {$visible ? monthlyYield : "0000"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[14px]  select-none leading-5 text-[#8D8E96]">
                  AVG. APY
                </h2>
                <div className="text-[18px] text-neutral-50 font-semibold">
                  {$isWeb3Load ? (
                    <div className="mt-1">
                      <Skeleton height={21} width={100} />
                    </div>
                  ) : (
                    <p className={`${!$visible && "blur select-none"}`}>
                      {$visible ? avgApy : "0000"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-start">
                <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                  DAILY YIELD
                </h2>
                <div className="text-[18px] text-neutral-50 font-semibold w-[100px]">
                  {$isWeb3Load ? (
                    <div className="mt-1">
                      <Skeleton height={21} width={100} />
                    </div>
                  ) : (
                    <p className={`${!$visible && "blur select-none"}`}>
                      {$visible ? dailyYield : "0000"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[14px]  select-none text-neutral-500 leading-5">
                  AVG. APR
                </h2>
                <div className="text-[18px] text-neutral-50 font-semibold w-[100px]">
                  {$isWeb3Load ? (
                    <div className="mt-1">
                      <Skeleton height={21} width={100} />
                    </div>
                  ) : (
                    <p className={`${!$visible && "blur select-none"}`}>
                      {$visible ? avgApr : "0000"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between flex-col md:hidden">
            <APRtimeSwitcher />
          </div>
        </div>
      </div>
      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
      {platformModal && <PlatformModal setModalState={setPlatformModal} />}
    </div>
  );
});

export { Portfolio };
