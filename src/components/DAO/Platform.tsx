import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { publicClient, network } from "@store";
import { PlatformABI, FactoryABI, platform, IVaultManagerABI } from "@web3";
import type { TAddress, TDAOData } from "@types";
import { getStrategyInfo } from "@utils";
import ShortAddress from "./ShortAddress";
import { Loader } from "../Loader/index";

function Platform({ vaultEntities, platformEntities }: any) {
  const [daoData, setDaoData] = useState<TDAOData>();
  const $publicClient = useStore(publicClient);
  const $network = useStore(network);

  const getFarmColor = (farmName: string) => {
    let color;
    const farm = farmName.split(" ");
    const initials = farm.map((initials: string) => {
      return initials.charAt(0);
    });
    const result = initials.join("");
    if (result === "GQF") {
      color = getStrategyInfo(result + "S");
    } else {
      color = getStrategyInfo(result);
    }
    return color;
  };
  console.log(platformEntities);

  console.log(vaultEntities);

  const fetchDaoData = async () => {
    if ($publicClient && vaultEntities && platformEntities) {
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
        console.log(contractData);

        const farmsLength = await $publicClient.readContract({
          address: "0xa14EaAE76890595B3C7ea308dAEBB93863480EAD" as TAddress,
          abi: FactoryABI,
          functionName: "farmsLength",
        });

        const pendingPlatformUpgrade: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "pendingPlatformUpgrade",
        });

        //tvl
        const totalTvl = vaultEntities?.reduce(
          (total: bigint, item: { tvl: bigint }) => {
            return total + BigInt(item.tvl);
          },
          BigInt(0)
        );

        //fees
        const percentageFees: string[] = platformFees.map((fee: bigint) =>
          (fee / 1000n).toString()
        );
        console.log(contractData);
        console.log(vaultEntities);

        const _daoData = {
          platformVersion: platformVersion,
          pendingPlatformUpgrade: pendingPlatformUpgrade,
          platformGovernance: contractData[0][5],
          multisigAddress: contractData[0][6],
          numberOfTotalVaults: vaultEntities.length,
          totalTvl: Math.trunc(Number(formatUnits(totalTvl, 18)) * 100) / 100,
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

  useEffect(() => {
    fetchDaoData();
  }, [vaultEntities]);

  return (
    <>
      <div className="w-full flex px-5 justify-between h-[70px] bg-button shadow-lg rounded-md">
        <h1 className="text-xxl text-[#8D8E96] my-auto">Platform</h1>
        <p className="text-sm text-[#8D8E96] my-auto pt-3">
          v{daoData?.platformVersion}
        </p>
      </div>

      {daoData ? (
        <div className="w-full p-2 bg-button shadow-lg rounded-md mt-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-transparent">
            <div className="grid gap-3 h-full p-3 m-auto rounded-md bg-[#1c1c23] shadow-sm w-full">
              <div className="my-auto">
                <h2 className="text-4xl">{$network}</h2>
                <h2 className="text-lg">Network</h2>
              </div>

              <div className="my-auto rounded-md border-gray-800 font-semibold">
                <h2 className="text-4xl">
                  {"$ "} {daoData?.totalTvl}
                </h2>
                <h2 className="text-lg">TVL</h2>
              </div>

              <div className="flex w-full border border-t-1 border-x-0 border-b-0 border-gray-800 shadow-sm">
                <div className="m-auto">
                  <h2 className="text-3xl font-semibold">
                    {daoData?.numberOfTotalVaults}
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

            <div className="p-3 bg-[#3d404b] rounded-md shadow-sm">
              <table className="w-full h-full text-[#8D8E96] font-medium">
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
                <h2 className="text-2xl pb-2 font-medium text-left text-[#8D8E96]">
                  Strategies:
                </h2>
                {daoData?.strategieNames.map(
                  (strategyName: string, index: number) => (
                    <div
                      key={index}
                      className="py-3 font-medium">
                      <h3
                        className="rounded-md m-0 py-2 ps-2 px-1"
                        style={{
                          color: getFarmColor(strategyName)?.color,
                          backgroundColor: getFarmColor(strategyName)?.bgColor,
                        }}>
                        {strategyName}
                      </h3>
                    </div>
                  )
                )}
                <div className="p-3 flex bg-[#13151A] shadow-md rounded-md text-[#8D8E96]">
                  <div className="m-auto">
                    <h2 className="font-bold text-lg">Vault Types</h2>
                    {Array.isArray(daoData?.typesOfVaults) &&
                      daoData.typesOfVaults.map(
                        (vaultType: string, index: number) => (
                          <h2
                            className="font-medium"
                            key={index}>
                            {vaultType}
                          </h2>
                        )
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {daoData?.pendingPlatformUpgrade &&
            daoData?.pendingPlatformUpgrade.newVersion !== "" && (
              <div className="p-3 mt-3 rounded-md bg-[#2c2f38] shadow-md border border-gray-700 bg-opacity-75">
                <h2 className="w-full font-thin text-lg text-left text-[#8D8E96] py-1">
                  <em className="text-xl font-medium">New version:</em>{" "}
                  {daoData.pendingPlatformUpgrade.newVersion}
                </h2>

                <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 h-full m-auto gap-3">
                  <div className="p-3 grid bg-[#13151A] shadow-md rounded-md text-[#8D8E96]">
                    <p>Proxies:</p>
                    {daoData?.pendingPlatformUpgrade.proxies.map(
                      (proxy: string, index: number) => (
                        <div key={index}>
                          <p className="text-xs grid">
                            <ShortAddress address={proxy} />
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="p-3 grid bg-[#13151A] shadow-md rounded-md text-[#8D8E96]">
                    <p>New implementations:</p>
                    {daoData?.pendingPlatformUpgrade.newImplementations.map(
                      (implementation: string, index: number) => (
                        <div key={index}>
                          <p className="text-xs grid">
                            <ShortAddress address={implementation} />
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="flex justify-center md:h-[314px] h-[732px] p-3 bg-button shadow-lg rounded-md mt-2">
          <Loader
            customHeight={100}
            customWidth={100}
          />
        </div>
      )}
    </>
  );
}
export default Platform;
