import { useState, useEffect, memo } from "react";
import { formatUnits } from "viem";

import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { useStore } from "@nanostores/react";

import { connected, platformData, vaultTypes, strategyTypes } from "@store";

import { FactoryABI, wagmiConfig } from "@web3";

import type { TAddress, TPlatformData, TVault } from "@types";

interface IProps {
  vault: TVault;
}

const Strategy: React.FC<IProps> = memo(({ vault }) => {
  const $connected = useStore(connected);
  const $platformData: TPlatformData | any = useStore(platformData);
  const $vaultTypes = useStore(vaultTypes);
  const $strategyTypes = useStore(strategyTypes);

  const [needVaultUpgrade, setNeedVaultUpgrade] = useState<boolean>(false);
  const [needStrategyUpgrade, setNeedStrategyUpgrade] =
    useState<boolean>(false);

  const upgradeVault = async () => {
    try {
      const upgradeVaultProxy = await writeContract(wagmiConfig, {
        address: $platformData.factory,
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
        address: $platformData.factory,
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
    if (!$connected || !vault || !$vaultTypes || !$strategyTypes) return;
    // @ts-ignore
    if ($vaultTypes[vault?.type] !== vault.version) {
      setNeedVaultUpgrade(true);
    }
    // @ts-ignore
    if ($strategyTypes[vault.strategy] !== vault.strategyVersion) {
      setNeedStrategyUpgrade(true);
    }
  }, [vault, $vaultTypes, $strategyTypes]);

  return (
    <div className="rounded-md mt-5 bg-button">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
        <h2 className=" text-[24px] text-start ml-4">Strategy</h2>
        <div className="hidden lg:flex items-center gap-5 mr-3 ">
          <button className="rounded-md bg-button flex justify-center items-center min-w-[140px]">
            <a
              className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
              href={`https://polygonscan.com/address/${vault.strategyAddress}`}
              target="_blank"
            >
              Strategy contract
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-external-link ms-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                <path d="M11 13l9 -9"></path>
                <path d="M15 4h5v5"></path>
              </svg>
            </a>
          </button>
          <button className="rounded-md bg-button flex justify-center items-center  w-[140px]">
            <a
              className="flex items-center text-[15px] py-2 px-1"
              href={`https://polygonscan.com/token/${vault.address}`}
              target="_blank"
            >
              Vault contract
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-external-link ms-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                <path d="M11 13l9 -9"></path>
                <path d="M15 4h5v5"></path>
              </svg>
            </a>
          </button>
          <button className="rounded-md bg-button justify-center items-center w-[140px] hidden">
            <a
              className="flex items-center text-[15px] py-2 px-1"
              href={vault.strategyInfo.sourceCode}
              target="_blank"
            >
              Github
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-external-link ms-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                <path d="M11 13l9 -9"></path>
                <path d="M15 4h5v5"></path>
              </svg>
            </a>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-start flex-col gap-3">
          <div
            style={{
              backgroundColor: vault.strategyInfo.bgColor,
              color: vault.strategyInfo.color,
            }}
            className="px-3 rounded-[8px] flex items-center text-[18px] lg:text-[20px] md:py-1 lg:py-0"
          >
            <p>
              {vault.strategyInfo.name}
              {vault.strategySpecific ? " " + vault.strategySpecific : ""}
            </p>
          </div>
          <div className="flex">
            <span
              style={{
                backgroundColor: vault.strategyInfo.bgColor,
                color: vault.strategyInfo.color,
              }}
              className="px-2 rounded-l-[10px] font-bold text-[#ffffff] text-[15px] flex h-8 items-center justify-center w-[70px]"
              title={vault.strategyInfo.name}
            >
              {vault.strategyInfo.shortName}
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
                {vault.strategyInfo.features.map((feature, i) => (
                  <img
                    key={i}
                    title={feature.name}
                    alt={feature.name}
                    className="w-6 h-6 ml-1"
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      feature.svg
                    )}`}
                  />
                ))}
              </span>
              {vault.strategySpecific && (
                <span className="font-bold rounded-[4px] text-[#b6bdd7] inline uppercase text-[10px] px-[6px]">
                  {vault.strategySpecific}
                </span>
              )}
            </span>
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
            Total APR / APY
          </p>
          <p>
            {vault.apr}% / {vault.apy}%
          </p>
        </div>
        {!!vault.assetsWithApr?.length && (
          <div>
            {vault.assetsAprs.map((apr: string, index: number) => {
              return (
                <div className="mt-2" key={index}>
                  <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
                    {vault.assetsWithApr[index]} APR
                  </p>
                  <p>{apr}%</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-2">
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            {/* APR 24h / Strategy APR latest */}
            strategy apr
          </p>
          <p>{Number(formatUnits(BigInt(vault.strategyApr), 3)).toFixed(2)}%</p>
        </div>

        <div className="mt-2">
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            Impermanent Loss
          </p>
          <div>
            <p
              style={{ color: vault?.strategyInfo?.il?.color }}
              className="text-[20px] font-bold"
            >
              {vault?.strategyInfo?.il?.title}
            </p>
            <p className="text-[14px]">{vault?.strategyInfo?.il?.desc}</p>
          </div>
        </div>
        {vault?.rebalances?.daily ? (
          <div className="mt-2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              Rebalances 24H / 7D
            </p>
            <p>
              {vault?.rebalances?.daily} / {vault?.rebalances?.weekly}
            </p>
          </div>
        ) : null}

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
              className="bg-[#1c1c23] py-1 px-2 rounded-md"
            >
              Upgrade Strategy
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export { Strategy };
