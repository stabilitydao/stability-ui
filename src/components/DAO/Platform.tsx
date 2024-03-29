import { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { ShortAddress } from "./ShortAddress";

import { publicClient, network } from "@store";
import { Loader } from "@components";
import { GRAPH_ENDPOINT } from "@constants";
import { PlatformABI, FactoryABI, platform } from "@web3";
import { getStrategyInfo } from "@utils";

import type { TAddress, TDAOData, TPendingPlatformUpgrade } from "@types";

const Platform = () => {
  const $publicClient = useStore(publicClient);
  const $network = useStore(network);

  const [daoData, setDaoData] = useState<TDAOData>();
  const [platformUpdates, setPlatformUpdates] =
    useState<TPendingPlatformUpgrade>();
  const [tvl, setTvl] = useState<any>();
  const [totalNumberOfVaults, setTotalNumberOfVaults] = useState<any>();

  const fetchGraph = async () => {
    try {
      const response = await axios.post(
        GRAPH_ENDPOINT,
        {
          query: `
            query MyQuery {
              vaultEntities {
                tvl
              }
            }
          `,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const tvlVaultEntities = response.data.data.vaultEntities;

      const totalTvl = tvlVaultEntities.reduce(
        (total: bigint, item: { tvl: bigint }) => {
          return total + BigInt(item.tvl);
        },
        BigInt(0)
      );

      const _tvl = Math.trunc(Number(formatUnits(totalTvl, 18)) * 100) / 100;

      setTvl(_tvl);
      setTotalNumberOfVaults(tvlVaultEntities.length);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  const getFarmColor = (farmName: string) => {
    const initials = farmName
      .split(" ")
      .map((initials: string) => {
        return initials.charAt(0);
      })
      .join("");

    if (initials === "GQF") {
      return getStrategyInfo(initials + "S");
    }
    return getStrategyInfo(initials);
  };

  const fetchDaoData = async () => {
    if ($publicClient && tvl) {
      try {
        const platformVersion: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "platformVersion",
        });

        const platformFees: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getFees",
        });

        const contractData: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getData",
        });

        const farmsLength = await $publicClient.readContract({
          address: "0xa14EaAE76890595B3C7ea308dAEBB93863480EAD" as TAddress,
          abi: FactoryABI,
          functionName: "farmsLength",
        });

        //fees
        const percentageFees: string[] = platformFees.map((fee: bigint) =>
          (fee / 1000n).toString()
        );

        const _daoData = {
          platformVersion: platformVersion,
          platformGovernance: contractData[0][5],
          multisigAddress: contractData[0][6],
          strategieNames: contractData[6],
          platformFee: percentageFees[0],
          vaultManagerFee: percentageFees[1],
          typesOfVaults: contractData[3],
          strategyLogicFee: percentageFees[2],
          ecosystemFee: percentageFees[3],
          farmsLength: Number(farmsLength),
        };

        setDaoData(_daoData);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  const fetchPlatformUpdates = async () => {
    try {
      const pendingPlatformUpgrade: any = await $publicClient?.readContract({
        address: platform,
        abi: PlatformABI,
        functionName: "pendingPlatformUpgrade",
      });
      setPlatformUpdates(pendingPlatformUpgrade);
    } catch (error) {
      console.error("Error fetching platform updates:", error);
    }
  };

  useEffect(() => {
    fetchDaoData();
    fetchPlatformUpdates();
  }, [tvl]);

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <>
      <div className="w-full flex px-2 justify-between h-[70px] bg-button shadow-lg rounded-md">
        <h1 className="text-xxl me-auto flex text-[#9c9c9c] ps-2 my-auto h-[50px]">
          Platform
        </h1>
        <p className="text-sm text-[#9c9c9c] my-auto pt-3 pr-2">
          {daoData && `v${daoData?.platformVersion}`}
        </p>
      </div>

      {daoData ? (
        <div className="w-full p-2 bg-button shadow-lg rounded-md mt-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-transparent">
            <div className="grid gap-3 h-full p-3 m-auto rounded-md bg-[#1c1c23] shadow-sm w-full">
              <div className="my-auto">
                <h2 className="text-4xl">{$network ? $network : "Polygon"}</h2>
                <h2 className="text-lg">Network</h2>
              </div>

              <div className="my-auto rounded-md border-gray-800 font-semibold">
                <h2 className="text-4xl">
                  {"$ "} {tvl}
                </h2>
                <h2 className="text-lg">TVL</h2>
              </div>

              <div className="flex w-full border border-t-1 border-x-0 border-b-0 border-gray-800 shadow-sm">
                <div className="m-auto">
                  <h2 className="text-3xl font-semibold">
                    {totalNumberOfVaults}
                  </h2>
                  <h2>Vaults</h2>
                </div>
                <div className="m-auto">
                  <h2 className="text-3xl font-semibold">
                    {daoData?.farmsLength}
                  </h2>
                  <h2>Farms</h2>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#343741] rounded-md shadow-sm">
              <table className="w-full h-full text-gray-400 font-medium">
                <thead>
                  <tr>
                    <th className="text-left text-2xl font-medium pb-2">
                      Fees:
                    </th>
                  </tr>
                </thead>
                <tbody className="text-md">
                  <tr>
                    <td>Platform fee:</td>
                    <td className="text-right">
                      {daoData?.platformFee}
                      {" %"}
                    </td>
                  </tr>
                  <tr>
                    <td>Vault manager fee:</td>
                    <td className="text-right">
                      {daoData?.vaultManagerFee}
                      {" %"}
                    </td>
                  </tr>
                  <tr>
                    <td>Strategy logic fee:</td>
                    <td className="text-right">
                      {daoData?.strategyLogicFee}
                      {" %"}
                    </td>
                  </tr>
                  <tr>
                    <td>Ecosystem fee:</td>
                    <td className="text-right">
                      {daoData?.ecosystemFee}
                      {" %"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-md bg-[#2c2f38] shadow-md border border-gray-700 bg-opacity-75">
              <div className="w-full h-full grid m-auto">
                <h2 className="text-2xl pb-2 font-medium text-left text-[#9c9c9c] mb-1">
                  Strategies:
                </h2>
                {daoData?.strategieNames.map(
                  (strategyName: string, index: number) => (
                    <div key={index} className="mb-2 font-medium">
                      <h3
                        className="rounded-md m-0 py-2 px-3"
                        style={{
                          color: getFarmColor(strategyName)?.color,
                          backgroundColor: getFarmColor(strategyName)?.bgColor,
                        }}
                      >
                        {strategyName}
                      </h3>
                    </div>
                  )
                )}
                <div className="p-3 flex bg-[#13151A] shadow-md rounded-md text-[#9c9c9c]">
                  <div className="m-auto">
                    <h2 className="font-bold text-lg">Vault Types</h2>
                    {Array.isArray(daoData.typesOfVaults) &&
                      daoData.typesOfVaults?.map(
                        (vaultType: string, index: number) => (
                          <h2 className="font-medium" key={index}>
                            {vaultType}
                          </h2>
                        )
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {platformUpdates?.newVersion && (
            <div className="p-3 hover:ring-1 ring-purple-400 ring-opacity-50 mt-3 rounded-md bg-[#2c2f38] shadow-md border border-gray-700 bg-opacity-75">
              <h2 className="w-full font-thin text-lg text-left text-gray-400   py-1">
                <em className="text-xl font-medium">New version:</em>{" "}
                {platformUpdates?.newVersion}
              </h2>

              <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 h-full m-auto gap-3">
                <div className="p-3 grid bg-[#13151A] shadow-md rounded-md text-[#9c9c9c]">
                  <p>Proxies:</p>
                  {platformUpdates?.proxies.map(
                    (proxy: string, index: number) => (
                      <div className="flex justify-center" key={index}>
                        <ShortAddress address={proxy as TAddress} />
                      </div>
                    )
                  )}
                </div>

                <div className="p-3 grid bg-[#13151A] shadow-md rounded-md text-[#9c9c9c]">
                  <p>New implementations:</p>
                  {platformUpdates?.newImplementations.map(
                    (implementation: string, index: number) => (
                      <div className="flex justify-center" key={index}>
                        <ShortAddress address={implementation as TAddress} />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex justify-center bg-button  p-3 shadow-lg rounded-md mt-2 ${
            platformUpdates?.newVersion
              ? "md:h-[477px]"
              : "sm:h-[583px] md:h-[330px] h-[747px]"
          }`}
        >
          <Loader height={100} width={100} />
        </div>
      )}
    </>
  );
};
export { Platform };
