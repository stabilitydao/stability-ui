import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { APRtimeSwitcher, FeeAPRModal } from "@ui";

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
    <div className="bg-button rounded-md">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px] px-4">
        <div
          data-testid="infoBarLogo"
          className="hidden lg:flex items-center gap-[17px]"
        >
          <img
            src={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
            alt="logo"
            className="w-7 h-7 rounded-full"
          />
          <div className="flex gap-3">
            <img
              className="w-7 h-7 rounded-full hidden lg:flex"
              src={vaultChain?.logoURI}
              alt={vaultChain?.name}
              title={vaultChain?.name}
            />
            {!!vault?.strategyInfo?.protocols.length && (
              <div
                className="lg:flex items-start gap-3 hidden"
                data-testid="infoBarStrategyesLogo"
              >
                {vault?.strategyInfo?.protocols.map((protocol, index) => (
                  <img
                    key={protocol?.name + index}
                    className="w-7 h-7 rounded-full"
                    src={protocol?.logoSrc}
                    alt={protocol?.name}
                    title={protocol?.name}
                  />
                ))}
              </div>
            )}
            {!!vault.yearnProtocols.length && (
              <div className="flex gap-3" data-testid="infoBarProtocolsLogo">
                {vault.yearnProtocols.map((protocol) => (
                  <img
                    key={protocol.link}
                    src={protocol.link}
                    alt={protocol.title}
                    title={protocol.title}
                    className="h-7 w-7 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <APRtimeSwitcher />
      </div>
      <div className="flex w-full gap-5 p-4">
        <div className="flex items-center flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="flex flex-row lg:flex-col items-start gap-5 w-full">
            <div className="w-1/2 lg:w-auto ">
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                TVL
              </p>
              <p
                data-testid="infoBarTVL"
                className="text-[16px] whitespace-nowrap"
              >
                {formatNumber(vault.tvl, "abbreviate")}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                DEPOSITED
              </p>
              <div className="text-[16px] flex whitespace-nowrap">
                <p data-testid="infoBarDeposited" className="mr-1">
                  {formatNumber(userBalances.shareBalance, "format")}
                </p>
                <p className="whitespace-nowrap md:hidden lg:block">
                  / ${formatNumber(userBalances.USDBalance, "format")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-5">
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] md:text-[12px] min-[950px]:text-[14px] leading-3 text-[#8D8E96]">
                SHARE PRICE
              </p>
              <p
                data-testid="infoBarSP"
                className="text-[16px] whitespace-nowrap"
              >
                ${Number(vault.shareprice).toFixed(5)}
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                DAILY
              </p>
              <p
                data-testid="infoBarDailyAPR"
                className="text-[16px] whitespace-nowrap"
              >
                {earnData.dailyAPR}% / {earnData.dailyEarn}$
              </p>
            </div>
          </div>
          <div className="flex flex-row lg:flex-col items-start w-full gap-5">
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                APR / APY
              </p>
              <p
                data-testid="infoBarAPR"
                className="text-[16px] whitespace-nowrap"
              >
                {earnData.apr}% / {earnData.apy}%
              </p>
            </div>
            <div className="w-1/2 lg:w-auto">
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                MONTHLY
              </p>
              <p
                data-testid="infoBarMonthlyAPR"
                className="text-[16px] whitespace-nowrap"
              >
                {earnData.monthlyAPR}% / {earnData.monthlyEarn}$
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
