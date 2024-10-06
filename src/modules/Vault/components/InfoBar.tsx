import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import {
  APRtimeSwitcher,
  FeeAPRModal,
  HeadingText,
  RiskIndicator,
  TimeDifferenceIndicator,
} from "@ui";

import { aprFilter } from "@store";

import { formatFromBigInt, formatNumber } from "@utils";

import { CHAINS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ network, vault }) => {
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
    let apr = vault?.earningData?.apr[$aprFilter];
    let apy = vault?.earningData?.apy[$aprFilter];

    let monthlyAPR, monthlyEarn, dailyAPR, dailyEarn;

    monthlyAPR = Number(apr) / 12;
    monthlyEarn = ((userBalances.USDBalance * monthlyAPR) / 100).toFixed(2);
    monthlyAPR = monthlyAPR.toFixed(2);

    dailyAPR = Number(apr) / 365;
    dailyEarn = ((userBalances.USDBalance * dailyAPR) / 100).toFixed(2);
    dailyAPR = dailyAPR.toFixed(2);

    setEarnData({ apr, apy, monthlyAPR, monthlyEarn, dailyAPR, dailyEarn });
  }, [$aprFilter, userBalances]);

  useEffect(() => {
    if (vault?.balance && vault?.shareprice) {
      const vaultBalance = BigInt(vault?.balance);
      const shareBalance = Number(
        formatFromBigInt(vault?.balance, 18).toFixed(5)
      );

      const USDBalance = Number(
        (
          Number(vault.shareprice) * Number(formatUnits(vaultBalance, 18))
        ).toFixed(2)
      );

      setUserBalances({ shareBalance, USDBalance });
    }
  }, [vault]);
  const vaultChain = useMemo(
    () => CHAINS.find((item) => item.id === network),
    [network]
  );
  return (
    <div className="bg-accent-950 rounded-2xl font-manrope">
      <div className="bg-accent-1000 border-[2px] border-accent-950 rounded-t-2xl flex justify-between items-center h-[54px] px-6">
        <div
          data-testid="infoBarLogo"
          className="hidden lg:flex items-center gap-0.5"
        >
          <img
            src={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
            alt="logo"
            className="w-[28px] h-[28px] rounded-full mr-1.5"
          />

          <HeadingText text={vault.symbol} scale={2} />
        </div>
      </div>

      <div className="flex w-full gap-5 p-6">
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="flex flex-row lg:flex-col items-start gap-9 w-full">
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                Chain
              </p>
              <div className="text-[18px] font-semibold whitespace-nowrap flex items-center">
                <img
                  className="w-6 h-6 rounded-full hidden lg:flex mr-1"
                  src={vaultChain?.logoURI}
                  alt={vaultChain?.name}
                  title={vaultChain?.name}
                />
                {vaultChain?.name}
              </div>
            </div>

            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                Income APR
              </p>
              <p
                data-testid="infoBarAPR"
                className="text-[18px] font-semibold whitespace-nowrap"
              >
                {earnData.apr}%
              </p>
            </div>

            <div className="w-1/2 lg:w-auto ">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                TVL
              </p>
              <p
                data-testid="infoBarTVL"
                className="text-[18px] font-semibold whitespace-nowrap"
              >
                {formatNumber(vault.tvl, "abbreviate")}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                SHARE PRICE
              </p>
              <p
                data-testid="infoBarSP"
                className="text-[18px] font-semibold whitespace-nowrap"
              >
                ${Number(vault.shareprice).toFixed(5)}
              </p>
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-9">
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                Vault type
              </p>
              <p className="text-[18px] font-semibold whitespace-nowrap text-[#00bb99] bg-[#00110a]">
                {vault.type}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                VS HODL APR
              </p>
              <p className="text-[18px] font-semibold whitespace-nowrap">
                {earnData.apy}%
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                ALM TVL
              </p>
              <p className="text-[18px] font-semibold whitespace-nowrap">
                {formatNumber(Number(vault.pool.tvl), "abbreviate")}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                LAST HARD WORK
              </p>
              <TimeDifferenceIndicator unix={vault?.lastHardWork} />
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-9">
            <div className="w-1/2 lg:w-auto h-[42px]">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                Strategy
              </p>
              <div className="text-[18px] font-semibold whitespace-nowrap">
                <div className="flex gap-0.5 items-center ">
                  {!!vault?.strategyInfo?.protocols.length && (
                    <div
                      className="lg:flex items-start gap-0.5 hidden"
                      data-testid="infoBarStrategyesLogo"
                    >
                      {vault?.strategyInfo?.protocols.map((protocol, index) => (
                        <img
                          key={protocol?.name + index}
                          className="w-6 h-6 rounded-full"
                          src={protocol?.logoSrc}
                          alt={protocol?.name}
                          title={protocol?.name}
                        />
                      ))}
                    </div>
                  )}
                  {!!vault.yearnProtocols.length && (
                    <div
                      className="flex gap-0.5"
                      data-testid="infoBarProtocolsLogo"
                    >
                      {vault.yearnProtocols.map((protocol) => (
                        <img
                          key={protocol.link}
                          src={protocol.link}
                          alt={protocol.title}
                          title={protocol.title}
                          className="h-6 w-6 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/2 lg:w-auto h-[42px]">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                Period
              </p>
              <APRtimeSwitcher />
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
                POOL TVL
              </p>
              <p className="text-[18px] font-semibold whitespace-nowrap">
                {formatNumber(Number(vault.pool.tvl), "abbreviate")}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-3">
                Risk
              </p>
              <RiskIndicator riskSymbol={vault?.risk?.symbol} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-5 px-6 py-5 bg-accent-1000 border-[2px] border-accent-950 rounded-b-2xl">
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="w-1/2 lg:w-auto">
            <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
              DEPOSITED
            </p>
            <div className="text-[18px] font-semibold flex whitespace-nowrap">
              <p data-testid="infoBarDeposited" className="mr-1">
                {formatNumber(userBalances.shareBalance, "format")}
              </p>
              <p className="whitespace-nowrap md:hidden lg:block">
                / ${formatNumber(userBalances.USDBalance, "format")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="w-1/2 lg:w-auto">
            <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
              DAILY
            </p>
            <p
              data-testid="infoBarDailyAPR"
              className="text-[18px] font-semibold whitespace-nowrap"
            >
              {earnData.dailyAPR}% / {earnData.dailyEarn}$
            </p>
          </div>
        </div>

        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="w-1/2 lg:w-auto">
            <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
              MONTHLY
            </p>
            <p
              data-testid="infoBarMonthlyAPR"
              className="text-[18px] font-semibold whitespace-nowrap"
            >
              {earnData.monthlyAPR}% / {earnData.monthlyEarn}$
            </p>
          </div>
        </div>
      </div>

      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { InfoBar };
