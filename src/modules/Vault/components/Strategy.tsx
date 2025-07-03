import { memo } from "react";
// import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
// import { useStore } from "@nanostores/react";

import { HeadingText, RiskIndicator, StrategyBadge } from "@ui";
//platformsData,
// import { connected, apiData } from "@store";

//import { FactoryABI, wagmiConfig } from "@web3";

// import { STABILITY_AAVE_POOLS, STABILITY_STRATEGY_LABELS } from "@constants";

import type { TVault } from "@types";
//TAddress, TPlatformData,
interface IProps {
  network: string;
  vault: TVault;
}

const Strategy: React.FC<IProps> = memo(({ network, vault }) => {
  console.log(network);
  // const $connected = useStore(connected);
  // const $platformsData: TPlatformData = useStore(platformsData);
  // const $apiData = useStore(apiData);

  // const vaultTypes = $apiData.platforms[network].versions.vaultType;
  // const strategyTypes = $apiData.platforms[network].versions.strategy;

  // const [needVaultUpgrade, setNeedVaultUpgrade] = useState<boolean>(false);
  // const [needStrategyUpgrade, setNeedStrategyUpgrade] =
  //   useState<boolean>(false);

  // const upgradeVault = async () => {
  //   try {
  //     const upgradeVaultProxy = await writeContract(wagmiConfig, {
  //       address: $platformsData?.[network]?.factory,
  //       abi: FactoryABI,
  //       functionName: "upgradeVaultProxy",
  //       args: [vault?.address as TAddress],
  //     });

  //     const transaction = await waitForTransactionReceipt(wagmiConfig, {
  //       confirmations: 5,
  //       hash: upgradeVaultProxy,
  //     });

  //     if (transaction.status === "success") {
  //       setNeedVaultUpgrade(false);
  //     }
  //   } catch (err) {
  //     console.error("UPGRADE VAULT PROXY ERROR:", err);
  //   }
  // };
  // const upgradeStrategy = async () => {
  //   try {
  //     const upgradeStrategyProxy = await writeContract(wagmiConfig, {
  //       address: $platformsData?.[network]?.factory,
  //       abi: FactoryABI,
  //       functionName: "upgradeStrategyProxy",
  //       args: [vault.strategyAddress as TAddress],
  //     });

  //     const transaction = await waitForTransactionReceipt(wagmiConfig, {
  //       confirmations: 5,
  //       hash: upgradeStrategyProxy,
  //     });
  //     if (transaction.status === "success") {
  //       setNeedStrategyUpgrade(false);
  //     }
  //   } catch (err) {
  //     console.error("UPGRADE STRATEGY PROXY ERROR:", err);
  //   }
  // };

  // useEffect(() => {
  //   if (!$connected || !vault || !vaultTypes || !strategyTypes) return;

  //   const vaultTypesKey = vault?.type;
  //   const strategyTypesKey = vault.strategy;

  //   if (vaultTypes[vaultTypesKey] !== vault.version) {
  //     setNeedVaultUpgrade(true);
  //   }

  //   if (strategyTypes[strategyTypesKey] !== vault.strategyVersion) {
  //     setNeedStrategyUpgrade(true);
  //   }
  // }, [vault, vaultTypes, strategyTypes]);

  // const matchedAddress = STABILITY_AAVE_POOLS.find((addr) =>
  //   vault.strategySpecific.includes(addr)
  // );

  // const isStabilityLogo = !!matchedAddress;

  // const strategySpecific = matchedAddress
  //   ? STABILITY_STRATEGY_LABELS[matchedAddress]
  //   : vault.strategySpecific.includes("0xb38d..97b8")
  //     ? "MEV Capital"
  //     : vault.strategySpecific.includes("0xeeb1..cb6c")
  //       ? "Re7 Labs"
  //       : vault.strategySpecific;

  return (
    <div>
      <HeadingText text="Strategy" scale={2} styles="text-left mb-3 md:mb-4" />
      <div className="flex flex-col items-start gap-3 md:gap-4 p-4 md:p-6 bg-[#101012] rounded-lg border border-[#23252A]">
        <div className="flex items-center justify-between w-full">
          <StrategyBadge
            info={vault.strategyInfo}
            specific={vault.strategySpecific}
          />

          <div
            style={{
              backgroundColor: vault.strategyInfo.bgColor + "66",
              border: `1px solid ${vault.strategyInfo.bgColor}`,
            }}
            className="px-2 py-1 rounded-lg flex items-center text-[12px] leading-4 font-medium"
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
          <div className="flex flex-col gap-1">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Description
            </p>
            <p className="text-[16px] leading-5 font-medium">
              {vault.strategyDescription}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <p className="font-medium leading-5 text-[#97979A] text-[14px]">
            Impermanent loss
          </p>
          <div className="flex flex-col gap-1">
            <p
              style={{ color: vault?.strategyInfo?.il?.color }}
              className="text-[20px] font-bold"
            >
              {vault?.strategyInfo?.il?.title}
            </p>
            <p className="text-[16px] leading-5 font-medium">
              {vault?.strategyInfo?.il?.desc != "None" &&
                vault?.strategyInfo?.il?.desc}
            </p>
          </div>
        </div>
        {!!vault?.risk && vault?.risk?.symbol !== "UNKNOWN" && (
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              RISK
            </p>
            <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-1">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Strategy Version
            </p>
            <p className="text-[20px] leading-6 font-semibold">
              {vault?.strategyVersion}{" "}
            </p>
          </div>
        )}

        {/* <div className="flex items-center gap-3 flex-wrap">
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
        </div> */}
      </div>
    </div>
  );
});

export { Strategy };
