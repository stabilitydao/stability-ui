import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { isMobile } from "react-device-detect";

import { formatUnits } from "viem";

import {
  APRtimeSwitcher,
  FeeAPRModal,
  HeadingText,
  RiskIndicator,
  TimeDifferenceIndicator,
  VaultType,
  FieldValue,
  // BalanceVisibilityToggler,
} from "@ui";

import { aprFilter, visible } from "@store";

import {
  formatFromBigInt,
  formatNumber,
  getSpecificSymbol,
  getTokenData,
} from "@utils";

import { CHAINS, STABILITY_AAVE_POOLS } from "@constants";

import { seeds, tokenlist } from "@stabilitydao/stability";

import type { TAPRPeriod, TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

const InfoBar: React.FC<IProps> = memo(({ network, vault }) => {
  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $visible = useStore(visible);

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
    if (vault?.shareprice) {
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

  const risk = useMemo(() => {
    if (vault.strategyInfo.shortId === "SiL") {
      return "medium";
    } else if (vault?.risk?.isRektStrategy) {
      return vault?.risk?.symbol;
    }
    return vault.strategyInfo.il?.title as string;
  }, [vault]);

  const isStabilityLogo = useMemo(
    () =>
      STABILITY_AAVE_POOLS.some((addr) =>
        vault?.strategySpecific?.includes(addr)
      ),
    [vault]
  );

  const borrowAsset = useMemo(() => {
    if (!vault?.leverageLending) return undefined;

    const specificSymbol = getSpecificSymbol(vault.strategySpecific);

    const tokenMeta = tokenlist.tokens.find(
      (t) => t.symbol === specificSymbol || specificSymbol.includes(t.symbol)
    );

    const tokenData = tokenMeta ? getTokenData(tokenMeta.address) : undefined;

    const borrowAsset = tokenData
      ? {
          address: tokenData.address,
          logo: tokenData.logoURI,
          symbol: tokenData.symbol,
          name: tokenData.name,
        }
      : undefined;

    return borrowAsset;
  }, [vault, tokenlist]);

  return (
    <div className="w-full rounded-lg bg-[#101012] border border-[#23252A]">
      <div
        data-testid="infoBarHeader"
        className="w-full bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-[rgba(0,0,0,0)] rounded-t-lg flex justify-between items-center p-4 md:px-6 md:py-[10px] border-b border-[#23252A] text-[20px] leading-6 font-semibold"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src={`${seeds[0]}/vault/${vault.network}/${vault.address}/logo.svg`}
            alt="logo"
            className="w-6 h-6 md:w-10 md:h-10 rounded-full"
          />
          <HeadingText text={vault.symbol} scale={2} />
        </div>

        <a
          href={`/chains/${vaultChain?.id}`}
          className="flex items-center cursor-pointer gap-3"
        >
          <img
            className="w-6 h-6 md:w-10 md:h-10 rounded-full"
            src={vaultChain?.logoURI}
            alt={vaultChain?.name}
            title={vaultChain?.name}
          />
          <span className="hidden md:flex">{vaultChain?.name}</span>
        </a>
      </div>

      <div className="flex gap-5 p-4 md:p-6 md:pb-0">
        <div className="flex items-start justify-between flex-col flex-nowrap w-full gap-[10px]">
          <div className="flex justify-between items-start gap-2 md:gap-3 w-full">
            <div className="w-1/3">
              <FieldValue
                name="Vault type"
                value={<VaultType type={vault.vaultType} greater={!isMobile} />}
                testId="infoBarVaultType"
              />
            </div>

            <div className="w-1/3 ">
              <FieldValue
                name="Assets"
                value={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {vault?.assets.map((asset, index) => (
                        <img
                          key={asset?.address + index}
                          src={asset?.logo}
                          alt={asset?.symbol}
                          title={asset?.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      ))}
                      {!!borrowAsset && (
                        <div className="flex items-center">
                          <span>-</span>
                          <img
                            key={borrowAsset?.address}
                            src={borrowAsset?.logo}
                            alt={borrowAsset?.symbol}
                            title={borrowAsset?.symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    {/*<p className="text-[16px] font-semibold">
                      {vault.assets[0].symbol}{" "}
                      {vault.assets.length > 1 && `+ ${vault.assets[1].symbol}`}
                    </p>*/}
                  </div>
                }
                testId="infoBarAssetsLogo"
              />
            </div>
            <div className="w-1/3">
              <FieldValue
                name="Strategy"
                value={
                  <div className="flex gap-0.5 items-end">
                    {!!vault?.strategyInfo?.protocols.length && (
                      <div
                        className="flex items-start gap-0.5"
                        data-testid="infoBarStrategyesLogo"
                      >
                        {isStabilityLogo ? (
                          <img
                            className="w-6 h-6 rounded-full"
                            src="/logo.svg"
                            alt="Stability"
                            title="Stability"
                          />
                        ) : (
                          vault?.strategyInfo?.protocols.map(
                            (protocol, index) => (
                              <img
                                key={protocol?.name + index}
                                className="w-6 h-6 rounded-full"
                                src={protocol?.logoSrc}
                                alt={protocol?.name}
                                title={protocol?.name}
                              />
                            )
                          )
                        )}
                      </div>
                    )}
                    {/* {!!vault.yearnProtocols.length && (
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
                    )} */}
                  </div>
                }
              />
            </div>
          </div>
          <div className="flex justify-between items-start gap-2 md:gap-3 w-full">
            <div className="w-1/3">
              <FieldValue
                name="Income APR"
                value={<p data-testid="infoBarAPR">{earnData.apr}%</p>}
              />
            </div>
            <div className="w-1/3">
              <FieldValue
                name="VS HODL APR"
                value={"-"}
                //vault.vsHoldAPR + "%"
                testId="infoBarVSHodlAPR"
              />
            </div>
            <div className="w-1/3">
              <FieldValue name="Period" value={<APRtimeSwitcher />} />
            </div>
          </div>
          <div className="flex justify-between items-start gap-2 md:gap-3 w-full">
            <div className="w-1/3">
              <FieldValue
                name="TVL"
                value={
                  <p data-testid="infoBarTVL">
                    {formatNumber(vault.tvl, "abbreviate")}
                  </p>
                }
              />
            </div>
            {vault?.alm?.tvl ? (
              <div className="w-1/3">
                <FieldValue
                  name="ALM TVL"
                  value={formatNumber(Number(vault?.alm?.tvl), "abbreviate")}
                  testId="infoBarAlmTVL"
                />
              </div>
            ) : (
              <div className="hidden md:flex h-[46px]"></div>
            )}

            {vault?.pool?.tvl ? (
              <div className="w-1/3">
                <FieldValue
                  name="POOL TVL"
                  value={formatNumber(Number(vault.pool.tvl), "abbreviate")}
                  testId="infoBarPoolTVL"
                />
              </div>
            ) : (
              <div className="flex h-[46px]"></div>
            )}
          </div>
          <div className="flex justify-between items-start gap-2 md:gap-3 w-full">
            <div className="w-1/3">
              <FieldValue
                name="Share price"
                value={
                  <p data-testid="infoBarSP">
                    ${Number(vault.shareprice).toFixed(5)}
                  </p>
                }
              />
            </div>

            <div className="w-1/3">
              <FieldValue
                name="Last Hard Work"
                value={<TimeDifferenceIndicator unix={vault?.lastHardWork} />}
                testId="infoBarHardWork"
              />
            </div>
            <div className="w-1/3">
              <FieldValue
                name="Risk"
                value={
                  <div className="flex h-[28px] items-center">
                    <RiskIndicator riskSymbol={risk} />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex p-4 md:px-6 md:pt-3 md:pb-0 bg-[#1B1D21] rounded-b-lg border-t border-[#23252A]">
        <div className="flex items-start flex-col lg:flex-row justify-between w-full gap-5 lg:gap-0">
          <div className="flex items-start flex-col gap-1">
            <div className="flex items-center gap-1 text-[14px] leading-5 text-[#97979A]">
              <span>Deposited</span>
              {/* <BalanceVisibilityToggler /> */}
            </div>
            <div className="flex items-center text-[20px] leading-6 font-semibold whitespace-nowrap">
              <div className="flex items-center">
                <div
                  className={`${!$visible && "blur select-none"} text-[18px] font-semibold flex whitespace-nowrap`}
                >
                  <p data-testid="infoBarDeposited" className="mr-1">
                    {formatNumber(userBalances.shareBalance, "format")}
                  </p>
                  <p className="whitespace-nowrap md:hidden lg:block">
                    / ${formatNumber(userBalances.USDBalance, "format")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FieldValue
          name="Daily"
          value={
            <p className={`${!$visible && "blur select-none"}`}>
              {earnData.dailyEarn}$
            </p>
          }
        />

        <FieldValue
          name="Monthly"
          value={
            <p className={`${!$visible && "blur select-none"}`}>
              {earnData.monthlyEarn}$
            </p>
          }
        />
      </div>

      {feeAPRModal && <FeeAPRModal setModalState={setFeeAPRModal} />}
    </div>
  );
});

export { InfoBar };
