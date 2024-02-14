import { memo, useState, useEffect } from "react";

import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { FeeAPRModal } from "./FeeAPRModal";

import { connected, visible, platformVersion, hideFeeApr } from "@store";

import { formatNumber, formatFromBigInt, calculateAPY } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vaults: TVault[];
}

const Portfolio: React.FC<IProps> = memo(({ vaults }) => {
  const $connected = useStore(connected);
  const $visible = useStore(visible);
  const $platformVersion = useStore(platformVersion);
  const $hideFeeAPR = useStore(hideFeeApr);

  const [hideFee, setHideFee] = useState($hideFeeAPR);
  const [feeAPRModal, setFeeAPRModal] = useState(false);

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
        return (
          accumulator + (v.tvl ? formatFromBigInt(v.tvl, 18, "withFloor") : 0)
        );
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
        let vaultBalance = Number(formatUnits(BigInt(v.balance), 18));
        let vaultSharePrice = Number(formatUnits(BigInt(v.shareprice), 18));

        const apr = hideFee ? Number(v.aprWithoutFees) : Number(v.apr);
        const balance = vaultBalance * vaultSharePrice;
        deposited += balance;
        monthly += ((apr / 100) * balance) / 12;
      }

      if (v.tvl) {
        tvl += formatFromBigInt(v.tvl, 18, "withFloor");
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
    localStorage.setItem("hideFeeAPR", JSON.stringify(hideFee));
    hideFeeApr.set(hideFee);
    if (vaults) {
      initPortfolio();
    }
  }, [hideFee, vaults]);

  return (
    <div className="my-2 rounded-sm">
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[1.5rem] font-medium">Portfolio</h3>
            <div className="cursor-pointer">
              {!$visible && (
                <svg
                  onClick={() => visible.set(true)}
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.1284 10.9464C19.7566 9.30323 20.75 7.75 20.75 7.75C20.75 7.75 16.2728 0.75 10.75 0.75C9.92433 0.75 9.12203 0.906455 8.35456 1.17258M3.81066 0.75L18.3063 15.2457M0.75 7.75C0.75 7.75 2.68788 4.72014 5.58647 2.64713L15.8426 12.9033C14.351 13.9562 12.6098 14.75 10.75 14.75C5.22715 14.75 0.75 7.75 0.75 7.75ZM10.75 11.75C8.54086 11.75 6.75 9.95909 6.75 7.74995C6.75 6.7355 7.12764 5.80926 7.75 5.10413L13.6104 10.5461C12.8841 11.2889 11.8709 11.75 10.75 11.75Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {$visible && (
                <svg
                  onClick={() => visible.set(false)}
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 8C21 8 16.5228 15 11 15C5.47715 15 1 8 1 8C1 8 5.47715 1 11 1C16.5228 1 21 8 21 8Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setHideFee((prev) => !prev)}
              className="bg-[#262830] rounded-md mt-1"
            >
              <div className="flex items-center justify-center gap-2 px-2 py-1">
                {hideFee ? (
                  <div className="w-[10px] h-[10px] rounded-full blur-[2px] bg-[#FFB800]"></div>
                ) : (
                  <div className="w-[10px] h-[10px] rounded-full blur-[2px] bg-[#443C28]"></div>
                )}
                <p className="text-[12px]">Hide swap fee APR</p>
                <div className="tooltip">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="ml-1 cursor-pointer opacity-40 hover:opacity-100 transition delay-[40ms] tooltip"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeeAPRModal(true);
                    }}
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="white" />
                    <path
                      d="M7.34516 9.37249V9.3266C7.35011 8.83967 7.39958 8.45216 7.49359 8.16408C7.58759 7.876 7.72117 7.64273 7.89433 7.46427C8.06749 7.28581 8.27528 7.12138 8.5177 6.97096C8.66365 6.87918 8.79476 6.77083 8.91103 6.64591C9.02729 6.51844 9.11882 6.37185 9.18561 6.20614C9.25487 6.04043 9.2895 5.85688 9.2895 5.65547C9.2895 5.40563 9.23261 5.18893 9.11882 5.00538C9.00503 4.82182 8.85289 4.68033 8.66242 4.5809C8.47194 4.48148 8.26044 4.43176 8.02791 4.43176C7.82506 4.43176 7.62964 4.4751 7.44164 4.56178C7.25364 4.64846 7.09655 4.78485 6.9704 4.97096C6.84424 5.15707 6.77126 5.40053 6.75147 5.70136H5.81641C5.8362 5.26797 5.94504 4.89703 6.14294 4.58855C6.34331 4.28007 6.60676 4.04426 6.93329 3.88109C7.26229 3.71793 7.62717 3.63635 8.02791 3.63635C8.46328 3.63635 8.84176 3.72558 9.16335 3.90404C9.4874 4.0825 9.73725 4.32724 9.91288 4.63826C10.091 4.94929 10.18 5.30366 10.18 5.70136C10.18 5.9818 10.138 6.23546 10.0539 6.46236C9.97225 6.68925 9.85351 6.89193 9.69767 7.07039C9.5443 7.24884 9.35877 7.40691 9.14108 7.54457C8.92339 7.68479 8.749 7.83266 8.61789 7.98817C8.48678 8.14113 8.39155 8.32341 8.33218 8.53501C8.27281 8.74661 8.24065 9.01048 8.2357 9.3266V9.37249H7.34516ZM7.82012 11.6364C7.63706 11.6364 7.47998 11.5688 7.34887 11.4337C7.21777 11.2986 7.15221 11.1367 7.15221 10.948C7.15221 10.7594 7.21777 10.5975 7.34887 10.4624C7.47998 10.3272 7.63706 10.2597 7.82012 10.2597C8.00317 10.2597 8.16025 10.3272 8.29136 10.4624C8.42247 10.5975 8.48802 10.7594 8.48802 10.948C8.48802 11.0729 8.4571 11.1877 8.39526 11.2922C8.33589 11.3967 8.25549 11.4808 8.15407 11.5446C8.05512 11.6058 7.9438 11.6364 7.82012 11.6364Z"
                      fill="white"
                    />
                  </svg>
                  <div className="visible__tooltip toLeft">
                    <div className="flex items-start flex-col">
                      <p className="text-[14px] flex flex-col gap-1 w-full">
                        During times of high volatility, the majority of pool
                        swap fees may be used to cover Impermanent Losses (IL)
                        once ALMs rebalance positions. Excluding swap fees
                        income from profitability calculations can sometimes
                        show more realistic APRs.
                      </p>
                    </div>
                    <i></i>
                  </div>
                </div>
              </div>
            </button>

            <p className="text-end text-[1rem] lg:block hidden font-bold w-[250px]">
              Stability Platform {$platformVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap lg:flex-nowrap gap-3 mt-[6px]">
          <div className="flex items-center justify-center md:justify-start gap-5 flex-wrap whitespace-nowrap w-full">
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] select-none text-[#848E9C] leading-5">
                DEPOSITED
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible
                  ? `$${formatNumber(portfolio.deposited, "format")}`
                  : "****"}
              </p>
            </div>
            <div className="w-[120px] md:w-[180px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] select-none text-[#848E9C] leading-5">
                DAILY YIELD
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? dailyYield : "****"}
              </p>
            </div>
            <div className="max-w-[130px] w-full md:max-w-[150px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] select-none text-[#848E9C] leading-5">
                MONTHLY YIELD
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? monthlyYield : "****"}
              </p>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] select-none text-[#848E9C] leading-5">
                AVG. APR
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? avgApr : "****"}
              </p>
            </div>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start">
              <h2 className="text-[14px] md:text-[1rem] select-none leading-5 text-[#8D8E96]">
                AVG. APY
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">
                {$visible ? avgApy : "****"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[1rem] text-end font-bold lg:hidden block">
              Stability Platform {$platformVersion}
            </p>
            <div className="max-w-[120px] w-full md:w-[120px] flex flex-col items-start lg:items-end">
              <h2 className="text-[14px] md:text-[1rem] select-none leading-5 text-[#8D8E96]">
                TVL
              </h2>
              <p className="text-[1rem] md:text-[1.125rem]">{portfolio.tvl}</p>
            </div>
          </div>
        </div>
      </div>
      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { Portfolio };
