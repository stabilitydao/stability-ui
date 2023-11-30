import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { vaults, publicClient, balances, platformData } from "@store";
import { PlatformABI, platform, ERC20ABI, VaultABI } from "@web3";
import type { PlatformData, TTokenData } from "@types";
import { getTokenData } from "@utils";
import tokenlist from "../../stability.tokenlist.json";

function DAO() {
  const [_platformData, setPlatformData] = useState<PlatformData | undefined>(
    undefined
  );
  const [profitTokenPrice, setProfitTokenPrice] = useState("");
  const [profitTotalSupply, setProfitTotalSupply] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [sdivTotalSupply, setSdivTotalSupply] = useState("");
  // const [_tokenomics, setTokenomics] = useState<TTokenData | undefined[]>([]);
  const $publicClient = useStore(publicClient);
  const $vaults = useStore(vaults);
  const $balances = useStore(balances);
  useEffect(() => {
    fetchPlatformData();
  }, [$balances]);

  const fetchPlatformData = async () => {
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

        const contractData: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getData",
        });

        const profitTotalSupply: bigint = await $publicClient.readContract({
          address: "0x48469a0481254d5945E7E56c1Eb9861429c02f44",
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const _sdivTotalSupply: bigint = await $publicClient.readContract({
          address: "0x9844a1c30462B55cd383A2C06f90BB4171f9D4bB",
          abi: ERC20ABI,
          functionName: "totalSupply",
        });
        console.log($vaults);

        //Profit Token
        const totalTvl: bigint = $vaults[5].reduce(
          (total: bigint, numero: bigint) => total + numero,
          BigInt(0)
        );

        const _profitTokenPrice =
          "$ " + formatUnits(totalTvl / profitTotalSupply, 18);
        const _profitTotalSupply = formatUnits(profitTotalSupply, 18);

        setProfitTokenPrice(_profitTokenPrice);
        setProfitTotalSupply(_profitTotalSupply);
        setMarketCap(formatUnits(totalTvl, 18));

        //SDIV Token

        setSdivTotalSupply(formatUnits(_sdivTotalSupply, 18));
        //platformData
        const _totalTvl = formatUnits(totalTvl, 18);
        const strategieNames: string = contractData[6];

        const percentageFees = platformFees.map(fee =>
          fee !== 0n ? (fee / 1000n).toString() + " %" : "0 %"
        );

        const platformData: PlatformData = {
          platformVersion: platformVersion,
          numberOfTotalVaults: $balances[3].length,
          totalTvl: _totalTvl,
          strategieNames: strategieNames,
          platformFee: percentageFees[0],
          vaultManagerFee: percentageFees[1],
          strategyLogicFee: percentageFees[2],
          ecosystemFee: percentageFees[3],
        };
        setPlatformData(platformData);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  return (
    <main className="p-0 w-full m-auto">
      <div className="dao pt-2 flex">
        <div className="grid mb-auto w-full">
          <h1 className="text-xxl text-gradient mb-3 ">Platform</h1>
          <article className="m-0 p-0">
            <article className="mb-2">
              <h2>Version: </h2>
              <h2>{_platformData?.platformVersion}</h2>
            </article>
            <article className="mb-2">
              <h2>Total Vaults:</h2>
              <h2>{_platformData?.numberOfTotalVaults}</h2>
            </article>
            <article>
              <h2>Total TVL:</h2>
              <h2>$ {_platformData?.totalTvl}</h2>
            </article>
          </article>

          <table className="m-auto my-5 grid p-0 w-full">
            <thead>
              <tr>
                <th>Platform fees:</th>
              </tr>
            </thead>
            <tbody className="grid">
              <tr className="items-center">
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

          <table className="grid m-auto my-5 p-0 w-full">
            <thead>
              <tr>
                <th>Strategies:</th>
              </tr>
            </thead>
            <tbody className="grid">
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
        </div>
        <br />
        <section className="p-5 border-gray-600 w-full">
          <h1 className="text-xxl text-gradient mb-3 p-0">Tokenomics</h1>

          {(() => {
            const profitTokenData = tokenlist.tokens.find(
              token =>
                token.address === "0x48469a0481254d5945E7E56c1Eb9861429c02f44"
            );
            return (
              profitTokenData && (
                <div className="m-auto justify-center grid w-full p-0">
                  <div className="flex justify-between p-0 w-full">
                    <table>
                      <tbody className="p-0 w-full">
                        <tr>
                          <td>Name: </td>
                          <td>{profitTokenData.name} </td>
                        </tr>
                        <tr>
                          <td>Symbol: </td>
                          <td>{profitTokenData.symbol} </td>
                        </tr>
                        <tr>
                          <td>Address: </td>
                          <td>{profitTokenData.address} </td>
                        </tr>
                        <tr>
                          <td>Price: </td>
                          <td>{profitTokenPrice} </td>
                        </tr>
                        <tr>
                          <td>Total supply: </td>
                          <td>{profitTotalSupply} </td>
                        </tr>
                        <tr>
                          <td>Market Cap: </td>
                          <td>{marketCap} </td>
                        </tr>
                      </tbody>
                    </table>
                    <img
                      className="rounded-full w-52 p-0 m-0"
                      src={profitTokenData.logoURI}
                      alt={profitTokenData.logoURI}
                    />
                  </div>
                  <iframe
                    className="w-[800px] h-[500px] m-auto mt-5"
                    src="https://dexscreener.com/polygon/0xd3B1f11f0ff29Add929941095C696D464D6961FC?embed=1&amp;theme=dark&amp;trades=0&amp;info=0"></iframe>
                </div>
              )
            );
          })()}
          {(() => {
            const sdivTokenData = tokenlist.tokens.find(
              token =>
                token.address === "0x9844a1c30462B55cd383A2C06f90BB4171f9D4bB"
            );
            return (
              sdivTokenData && (
                <div className="m-auto justify-between flex w-full p-0 mt-5">
                  <table>
                    <tbody className="p-0 w-full">
                      <tr>
                        <td>Name: </td>
                        <td>{sdivTokenData.name} </td>
                      </tr>
                      <tr>
                        <td>Symbol: </td>
                        <td>{sdivTokenData.symbol} </td>
                      </tr>
                      <tr>
                        <td>Address: </td>
                        <td>{sdivTokenData.address} </td>
                      </tr>
                      <tr>
                        <td>Total supply: </td>
                        <td>{sdivTotalSupply} </td>
                      </tr>
                    </tbody>
                  </table>
                  <img
                    className="rounded-full w-52 p-0  flex"
                    src={sdivTokenData.logoURI}
                    alt={sdivTokenData.logoURI}
                  />
                </div>
              )
            );
          })()}

          <div className="m-auto justify-between flex w-full p-0 mt-16">
            <table>
              <tbody className="p-0 w-full">
                <tr>
                  <td>Name: </td>
                  <td>Profit Maker </td>
                </tr>
                <tr>
                  <td>Symbol: </td>
                  <td>PM </td>
                </tr>
                <tr>
                  <td>Address: </td>
                  <td>0xAA3e3709C79a133e56C17a7ded87802adF23083B </td>
                </tr>
                <tr>
                  <td>Total supply: </td>
                  <td>
                    <span className="font-bold text-red-600">
                      {" "}
                      ADD TOTAL SUPPLY
                    </span>{" "}
                  </td>
                </tr>
                <tr>
                  <td>To mint: </td>
                  <td>
                    {" "}
                    <span className="font-bold text-red-600 ">
                      {" "}
                      ADD TO MINT
                    </span>{" "}
                  </td>
                </tr>
              </tbody>
            </table>
            <img
              alt="ADD IMG"
              className="rounded-full w-52 p-0 flex"
            />
          </div>
        </section>
      </div>
      <br />
      <h1 className="text-xxl text-gradient mb-3">Governance</h1>
      <div></div>
      <br />
      <h1 className="text-xxl text-gradient mb-3">Team</h1>
      <div></div>
      <br />
    </main>
  );
}

export { DAO };
