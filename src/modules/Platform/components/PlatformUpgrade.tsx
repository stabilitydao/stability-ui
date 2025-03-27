import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { deployments } from "@stabilitydao/stability";

import { getShortAddress } from "@utils";

import { ExplorerLink } from "@ui";

import { platformVersions, publicClient } from "@store";

import { CHAINS } from "@constants";

import { PlatformABI } from "@web3";

import type { TPendingPlatformUpgrade, TUpgradesTable, TAddress } from "@types";

const PlatformUpgrade = (): JSX.Element => {
  const $currentChainID = "146";
  // const $currentChainID = useStore(currentChainID);
  const $platformVersions = useStore(platformVersions);

  const $publicClient = useStore(publicClient);

  const [lockTime, setLockTime] = useState({ start: "", end: "" });
  const [upgradesTable, setUpgradesTable] = useState<TUpgradesTable[]>([]);

  const [platformUpdates, setPlatformUpdates] =
    useState<TPendingPlatformUpgrade>();

  const fetchPlatformUpdates = async () => {
    try {
      const pendingPlatformUpgrade: any = await $publicClient?.readContract({
        address: deployments[$currentChainID]?.core.platform,
        abi: PlatformABI,
        functionName: "pendingPlatformUpgrade",
      });

      let upgrated = [];
      if (pendingPlatformUpgrade?.proxies.length) {
        const promises = pendingPlatformUpgrade.proxies.map(
          async (proxy: TAddress, index: number) => {
            const moduleContracts = Object.keys(
              deployments[$currentChainID].core
            );

            const upgratedData = await Promise.all(
              moduleContracts.map(async (moduleContract: string) => {
                //Can't use CoreContracts type
                //@ts-ignore
                const address =
                  deployments[$currentChainID].core[moduleContract];

                if (proxy.toLowerCase() === address.toLowerCase()) {
                  const oldImplementation = await $publicClient?.readContract({
                    address: address,
                    abi: [
                      {
                        inputs: [],
                        name: "implementation",
                        outputs: [
                          {
                            internalType: "address",
                            name: "",
                            type: "address",
                          },
                        ],
                        stateMutability: "view",
                        type: "function",
                      },
                    ],
                    functionName: "implementation",
                  });
                  const oldImplementationVersion =
                    await $publicClient?.readContract({
                      address: oldImplementation,
                      abi: PlatformABI,
                      functionName: "VERSION",
                    });
                  const newImplementationVersion =
                    await $publicClient?.readContract({
                      address: pendingPlatformUpgrade.newImplementations[index],
                      abi: PlatformABI,
                      functionName: "VERSION",
                    });
                  return {
                    contract: moduleContract,
                    oldVersion: oldImplementationVersion,
                    newVersion: newImplementationVersion,
                    proxy: proxy,
                    oldImplementation: oldImplementation,
                    newImplementation:
                      pendingPlatformUpgrade.newImplementations[index],
                  };
                }
              })
            );

            return upgratedData.filter((data) => data !== undefined);
          }
        );
        upgrated = (await Promise.all(promises)).flat();
      }

      /////***** TIME CHECK  *****/////
      const lockTime: any = await $publicClient?.readContract({
        address: deployments[$currentChainID].core.platform,
        abi: PlatformABI,
        functionName: "TIME_LOCK",
      });
      const platformUpgradeTimelock: any = await $publicClient?.readContract({
        address: deployments[$currentChainID].core.platform,
        abi: PlatformABI,
        functionName: "platformUpgradeTimelock",
      });

      if (lockTime && platformUpgradeTimelock) {
        setLockTime({
          start: `${new Date(Number(platformUpgradeTimelock - lockTime) * 1000).toLocaleDateString()} ${new Date(Number(platformUpgradeTimelock - lockTime) * 1000).toLocaleTimeString()}`,
          end: `${new Date(Number(platformUpgradeTimelock) * 1000).toLocaleDateString()} ${new Date(Number(platformUpgradeTimelock) * 1000).toLocaleTimeString()}`,
        });
      }
      /////***** SET DATA  *****/////
      setUpgradesTable(upgrated);
      setPlatformUpdates(pendingPlatformUpgrade);
    } catch (error) {
      console.error("Error fetching platform updates:", error);
    }
  };

  useEffect(() => {
    fetchPlatformUpdates();
  }, [deployments, $publicClient, $platformVersions]);

  const explorer = CHAINS.find((chain) => chain.id === "146")?.explorer;

  return (
    <>
      {!!platformUpdates?.newVersion &&
      platformUpdates?.newVersion != $platformVersions[$currentChainID] &&
      !!upgradesTable?.length ? (
        <div className="p-3 bg-accent-950 rounded-[10px] mx-6">
          <h3 className="mb-2 text-[18px] font-medium">
            Time-locked platform upgrade in progress
          </h3>
          <div className="flex gap-3 text-[14px]">
            <span className="w-[100px]">Version:</span>
            <span>
              {$platformVersions[$currentChainID]} -{">"}{" "}
              {platformUpdates.newVersion}
            </span>
          </div>
          <div className="flex gap-3 text-[14px]">
            <span className="w-[100px]">Timelock:</span>
            <span>
              {lockTime.start} -{">"} {lockTime.end}
            </span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="table table-auto w-full rounded-lg">
              <thead className="">
                <tr className="text-[12px] text-neutral-600 uppercase whitespace-nowrap">
                  <th className="text-left">Contract</th>
                  <th className="text-left">Version</th>
                  <th className="text-left">Proxy</th>
                  <th className="text-left">Old Implementation</th>
                  <th className="text-left">New Implementation</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {!!upgradesTable.length &&
                  upgradesTable.map((upgrade) => (
                    <tr key={upgrade.contract} className="">
                      <td className="text-left min-w-[100px] capitalize">
                        <p>{upgrade.contract}</p>
                      </td>
                      <td className="text-left min-w-[100px]">
                        {upgrade.oldVersion} {"->"} {upgrade.newVersion}
                      </td>
                      {upgrade?.proxy && (
                        <td className="text-left min-w-[150px]">
                          <span className="flex items-center">
                            {getShortAddress(upgrade.proxy, 6, 4)}
                            <ExplorerLink
                              explorer={explorer || ""}
                              address={upgrade.proxy}
                            />
                          </span>
                        </td>
                      )}
                      {upgrade.oldImplementation && (
                        <td className="text-left min-w-[150px]">
                          <span className="flex items-center">
                            {getShortAddress(upgrade.oldImplementation, 6, 4)}
                            <ExplorerLink
                              explorer={explorer || ""}
                              address={upgrade.oldImplementation}
                            />
                          </span>
                        </td>
                      )}
                      {upgrade?.newImplementation && (
                        <td className="text-left min-w-[150px]">
                          <span className="flex items-center">
                            {getShortAddress(upgrade.newImplementation, 6, 4)}
                            <ExplorerLink
                              explorer={explorer || ""}
                              address={upgrade.newImplementation}
                            />
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
};

export { PlatformUpgrade };
