import { useState, useEffect, memo } from "react";

import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { useStore } from "@nanostores/react";

import { HeadingText, RiskIndicator } from "@ui";

import { connected, platformsData, apiData } from "@store";

import { FactoryABI, wagmiConfig } from "@web3";

import type { TAddress, TPlatformData, TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

const Strategy: React.FC<IProps> = memo(({ network, vault }) => {
  const $connected = useStore(connected);
  const $platformsData: TPlatformData = useStore(platformsData);
  const $apiData = useStore(apiData);

  const vaultTypes = $apiData.platforms[network].versions.vaultType;
  const strategyTypes = $apiData.platforms[network].versions.strategy;

  const [needVaultUpgrade, setNeedVaultUpgrade] = useState<boolean>(false);
  const [needStrategyUpgrade, setNeedStrategyUpgrade] =
    useState<boolean>(false);

  const upgradeVault = async () => {
    try {
      const upgradeVaultProxy = await writeContract(wagmiConfig, {
        address: $platformsData?.[network]?.factory,
        abi: FactoryABI,
        functionName: "upgradeVaultProxy",
        args: [vault?.address as TAddress],
      });

      const transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: 5,
        hash: upgradeVaultProxy,
      });

      if (transaction.status === "success") {
        setNeedVaultUpgrade(false);
      }
    } catch (err) {
      console.error("UPGRADE VAULT PROXY ERROR:", err);
    }
  };
  const upgradeStrategy = async () => {
    try {
      const upgradeStrategyProxy = await writeContract(wagmiConfig, {
        address: $platformsData?.[network]?.factory,
        abi: FactoryABI,
        functionName: "upgradeStrategyProxy",
        args: [vault.strategyAddress as TAddress],
      });

      const transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: 5,
        hash: upgradeStrategyProxy,
      });
      if (transaction.status === "success") {
        setNeedStrategyUpgrade(false);
      }
    } catch (err) {
      console.error("UPGRADE STRATEGY PROXY ERROR:", err);
    }
  };

  useEffect(() => {
    if (!$connected || !vault || !vaultTypes || !strategyTypes) return;

    const vaultTypesKey = vault?.type;
    const strategyTypesKey = vault.strategy;

    if (vaultTypes[vaultTypesKey] !== vault.version) {
      setNeedVaultUpgrade(true);
    }

    if (strategyTypes[strategyTypesKey] !== vault.strategyVersion) {
      setNeedStrategyUpgrade(true);
    }
  }, [vault, vaultTypes, strategyTypes]);
  return (
    <div>
      <HeadingText text="Strategy" scale={2} styles="text-left" />
      <div className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-start flex-col gap-3">
          <div className="flex">
            <span
              style={{
                backgroundColor: vault.strategyInfo.bgColor,
                color: vault.strategyInfo.color,
              }}
              className="px-2 rounded-l-[10px] font-bold text-[#ffffff] text-[15px] flex h-8 items-center justify-center w-[70px]"
              title={vault.strategyInfo.id}
            >
              {vault.strategyInfo.shortId}
            </span>
            <span className="px-2 rounded-r-[10px] bg-[#41465a] flex h-8 items-center min-w-[160px]">
              <span className="flex min-w-[42px] justify-center">
                {vault.strategyInfo.protocols.map((protocol, index) => (
                  <img
                    className={`h-7 w-7 rounded-full ${
                      vault.strategyInfo.protocols.length > 1 &&
                      index &&
                      "ml-[-4px]"
                    }`}
                    key={index}
                    src={protocol.logoSrc}
                    alt={protocol.name}
                    title={protocol.name}
                  />
                ))}
              </span>
              <span className="flex">
                {vault?.strategyInfo?.baseStrategies.includes("Farming") && (
                  <img
                    title="Farming"
                    alt="Farming"
                    className="w-6 h-6 ml-1"
                    src="/features/Farming.svg"
                  />
                )}
              </span>
              {vault.yearnProtocols.length ? (
                <div className="flex">
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
              ) : vault.strategySpecific ? (
                <span className="font-bold rounded-[4px] text-[#b6bdd7] inline uppercase text-[10px] px-[6px]">
                  {vault.strategySpecific}
                </span>
              ) : (
                ""
              )}
            </span>
          </div>

          <div
            style={{
              backgroundColor: vault.strategyInfo.bgColor,
              color: vault.strategyInfo.color,
            }}
            className="px-3 rounded-[8px] flex items-center text-[18px] lg:text-[20px] md:py-1 lg:py-0"
          >
            {vault.yearnProtocols.length ? (
              <div className="flex py-2 gap-2">
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
            ) : (
              <p>
                {vault.strategyInfo.id}
                {vault.strategySpecific ? " " + vault.strategySpecific : ""}
              </p>
            )}
          </div>
        </div>

        {vault.strategyDescription && (
          <div className="mt-2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              DESCRIPTION
            </p>
            <p className="text-[16px] mt-1">{vault.strategyDescription}</p>
          </div>
        )}
        <div className="mt-2">
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            impermanent loss
          </p>
          <div>
            <p
              style={{ color: vault?.strategyInfo?.il?.color }}
              className="text-[20px] font-bold"
            >
              {vault?.strategyInfo?.il?.title}
            </p>
            <p className="text-[14px]">{vault?.strategyInfo?.il?.desc != 'None' && vault?.strategyInfo?.il?.desc}</p>
          </div>
        </div>
        {!!vault?.risk && vault?.risk?.symbol !== "UNKNOWN" && (
          <div className="mt-2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              RISK
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <RiskIndicator riskSymbol={vault?.risk?.symbol} />

              <div className="flex items-center gap-5 flex-wrap">
                {vault?.risk?.factors.map((factor) => (
                  <div
                    key={factor}
                    className="text-[14px] border border-[#b75457] text-[#f2aeae] bg-[#3f1f24] rounded-md"
                  >
                    <p className="px-2 py-1">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {vault?.strategyVersion && (
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              STRATEGY VERSION
            </p>
            <p className="text-[16px] mt-1">{vault?.strategyVersion} </p>
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {needVaultUpgrade && (
            <button
              onClick={upgradeVault}
              className="bg-[#1c1c23] py-1 px-2 rounded-md"
            >
              Upgrade Vault
            </button>
          )}
          {needStrategyUpgrade && (
            <button
              onClick={upgradeStrategy}
              className="w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-[10px] px-4 rounded-2xl"
            >
              Upgrade to {strategyTypes[vault.strategy]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export { Strategy };
