import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { vaults, publicClient, balances } from "@store";
import { PlatformABI, platform } from "@web3";
import type { PlatformData } from "@types";

function DAO() {
  const [_platformData, setPlatformData] = useState<PlatformData | undefined>(
    undefined
  );
  const $publicClient = useStore(publicClient);
  const $vaults = useStore(vaults);
  const $balances = useStore(balances);

  useEffect(() => {
    fetchData();
  }, [$balances]);

  const fetchData = async () => {
    if ($publicClient && $balances) {
      try {
        const platformVersion: string = (await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "platformVersion",
        })) as string;

        const platformFees: bigint[] = (await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getFees",
        })) as bigint[];

        const sumShareBalances = $vaults[5].reduce(
          (total: bigint, numero: bigint) => total + numero,
          BigInt(0)
        );

        const platformData: PlatformData = {
          platformVersion: platformVersion,
          numberOfTotalVaults: $balances[3].length,
          totalTvl: formatUnits(sumShareBalances, 18),
          strategieNames: $vaults[2],
          platformFee: formatUnits(platformFees[0], 18),
          vaultManagerFee: formatUnits(platformFees[1], 18),
          strategyLogicFee: formatUnits(platformFees[2], 18),
          ecosystemFee: formatUnits(platformFees[3], 18),
        };
        setPlatformData(platformData);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  return (
    <div className="dao pt-2">
      <h1 className="text-xxl text-gradient mb-3">Platform</h1>

      <article className="m-auto border w-96">
        <h2>Version: {_platformData?.platformVersion}</h2>
        <h2>Total Vaults: {_platformData?.numberOfTotalVaults}</h2>
        <h2>Total TVL: {_platformData?.totalTvl}</h2>
      </article>

      <table className="w-96 m-auto border my-5 h-[239px] p-0">
        <thead>
          <tr>
            <th>Strategies:</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(_platformData?.strategieNames) &&
            _platformData?.strategieNames.map(
              (strategyName: string, index: number) => (
                <tr key={index}>
                  <td>{strategyName}</td>
                </tr>
              )
            )}
        </tbody>
      </table>

      <table className="w-96 m-auto border my-5">
        <thead>
          <tr>
            <th>Platform fees:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Platform fee:</td>
            <td>{_platformData?.platformFee}</td>
          </tr>
          <tr>
            <td>Vault manager fee:</td>
            <td>{_platformData?.vaultManagerFee}</td>
          </tr>
          <tr>
            <td>Strategy logic fee:</td>
            <td>{_platformData?.strategyLogicFee}</td>
          </tr>
          <tr>
            <td>Ecosystem fee:</td>
            <td>{_platformData?.ecosystemFee}</td>
          </tr>
        </tbody>
      </table>

      <br />
      <h1 className="text-xxl text-gradient mb-3">Tokenomics</h1>
      <div></div>
      <br />

      <h1 className="text-xxl text-gradient mb-3">Governance</h1>
      <div></div>
      <br />

      <h1 className="text-xxl text-gradient mb-3">Team</h1>
      <div></div>
      <br />
    </div>
  );
}

export { DAO };
