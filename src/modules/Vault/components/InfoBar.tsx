import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import {
  APRtimeSwitcher,
  FeeAPRModal,
  HeadingText,
  RiskIndicator,
  TimeDifferenceIndicator,
  VaultType,
  FieldValue,
} from "@ui";

import { aprFilter } from "@store";

import { formatFromBigInt, formatNumber } from "@utils";

import { CHAINS } from "@constants";

import type { TAPRPeriod, TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ network, vault }) => {
  const $aprFilter: TAPRPeriod = useStore(aprFilter);

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
    let apr = vault.earningData.apr[$aprFilter];
    let apy = vault.earningData.apy[$aprFilter];

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
      <div className="bg-accent-900 border-[2px] border-accent-950 rounded-t-2xl flex justify-between items-center h-[56px] px-6">
        <div
          data-testid="infoBarLogo"
          className="hidden lg:flex justify-between items-center gap-0.5 w-full"
        >
          <div className="flex items-center">
            <img
              src={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
              alt="logo"
              className="w-[28px] h-[28px] rounded-full mr-1.5"
            />
            <HeadingText text={vault.symbol} scale={2} />
          </div>

          <div className="flex items-center">
            <img
              className="w-6 h-6 rounded-full hidden lg:flex mr-1"
              src={vaultChain?.logoURI}
              alt={vaultChain?.name}
              title={vaultChain?.name}
            />
            {vaultChain?.name}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-5 p-6 md:pb-0">
        <div className="flex items-start justify-between flex-col flex-nowrap w-full md:gap-[10px]">
          <div className="flex justify-between flex-col md:flex-row items-start gap-2 md:gap-3 w-full">
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Vault type"
                value={<VaultType type={vault.type} greater={true} />}
              />
            </div>

            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Assets"
                value={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {vault.assets.map((asset) => (
                        <img
                          key={asset.address}
                          src={asset.logo}
                          alt={asset.symbol}
                          title={asset.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      ))}
                    </div>
                    {/*<p className="text-[16px] font-semibold">
                      {vault.assets[0].symbol}{" "}
                      {vault.assets.length > 1 && `+ ${vault.assets[1].symbol}`}
                    </p>*/}
                  </div>
                }
              />
            </div>
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Strategy"
                value={
                  <div className="flex gap-0.5 items-end h-[29px]">
                    {!!vault?.strategyInfo?.protocols.length && (
                      <div
                        className="flex items-start gap-0.5"
                        data-testid="infoBarStrategyesLogo"
                      >
                        {vault?.strategyInfo?.protocols.map(
                          (protocol, index) => (
                            <img
                              key={protocol?.name + index}
                              className="w-6 h-6 rounded-full"
                              src={protocol?.logoSrc}
                              alt={protocol?.name}
                              title={protocol?.name}
                            />
                          )
                        )}
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
                }
              />
            </div>
          </div>
          <div className="flex justify-between flex-col md:flex-row items-start md:gap-3 w-full ">
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Income APR"
                value={<p data-testid="infoBarAPR">{earnData.apr}%</p>}
              />
            </div>
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="VS HODL APR"
                value={vault.lifetimeVsHoldAPR + "%"}
              />
            </div>
            <div className="w-full md:w-1/3 ">
              <FieldValue name="Period" value={<APRtimeSwitcher />} />
            </div>
          </div>
          <div className="flex justify-between flex-col md:flex-row items-start md:gap-3 w-full ">
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="TVL"
                value={
                  <p data-testid="infoBarTVL">
                    {formatNumber(vault.tvl, "abbreviate")}
                  </p>
                }
              />
            </div>
            <div className="w-full md:w-1/3 ">
              {vault?.alm?.tvl ? (
                <FieldValue
                  name="ALM TVL"
                  value={formatNumber(Number(vault?.alm?.tvl), "abbreviate")}
                />
              ) : (
                <div className="h-[46px]"></div>
              )}
            </div>

            <div className="w-full md:w-1/3 ">
              {vault?.pool?.tvl ? (
                <FieldValue
                  name="POOL TVL"
                  value={formatNumber(Number(vault.pool.tvl), "abbreviate")}
                />
              ) : (
                <div className="w-1/2 lg:w-auto h-[46px]"></div>
              )}
            </div>
          </div>
          <div className="flex justify-between flex-col md:flex-row items-start md:gap-3 w-full ">
            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="SHARE PRICE"
                value={
                  <p data-testid="infoBarSP">
                    ${Number(vault.shareprice).toFixed(5)}
                  </p>
                }
              />
            </div>

            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Last HardWork"
                value={<TimeDifferenceIndicator unix={vault?.lastHardWork} />}
              />
            </div>

            <div className="w-full md:w-1/3 ">
              <FieldValue
                name="Risk"
                value={
                  <div className="flex h-[28px] items-center">
                    <RiskIndicator riskSymbol={vault?.risk?.symbol} />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row px-6 pb-6 md:pb-2 pt-6 bg-accent-900 rounded-b-2xl gap-0 md:gap-3">
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <FieldValue
            name="DEPOSITED"
            value={
              <div className="flex h-[28px] items-center">
                <div className="text-[18px] font-semibold flex whitespace-nowrap">
                  <p data-testid="infoBarDeposited" className="mr-1">
                    {formatNumber(userBalances.shareBalance, "format")}
                  </p>
                  <p className="whitespace-nowrap md:hidden lg:block">
                    / ${formatNumber(userBalances.USDBalance, "format")}
                  </p>
                </div>
              </div>
            }
          />
        </div>
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <FieldValue name="DAILY" value={`${earnData.dailyEarn}$`} />
        </div>

        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <FieldValue name="MONTHLY" value={`${earnData.monthlyEarn}$`} />
        </div>
      </div>

      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { InfoBar };
