import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { vaults, publicClient, balances } from "@store";
import { PlatformABI, platform, ERC20ABI } from "@web3";
import type { PlatformData, GitHubUser } from "@types";
import tokenlist from "../../stability.tokenlist.json";

function DAO() {
  const [_platformData, setPlatformData] = useState<PlatformData | undefined>(
    undefined
  );
  const [profitTokenPrice, setProfitTokenPrice] = useState("");
  const [profitTotalSupply, setProfitTotalSupply] = useState("");
  const [prTotalSupply, setPrTotalSupply] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [sdivTotalSupply, setSdivTotalSupply] = useState("");
  const [members, setMembers] = useState<GitHubUser[]>([]);

  const $publicClient = useStore(publicClient);
  const $vaults = useStore(vaults);
  const $balances = useStore(balances);

  useEffect(() => {
    fetchPlatformData();
    getTeamData();
  }, [$balances]);

  async function getTeamData() {
    try {
      const membersData = await fetch(
        "https://api.github.com/orgs/stabilitydao/public_members"
      );
      const dataJson = await membersData.json();
      setMembers(dataJson);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchPlatformData = async () => {
    if ($publicClient && $balances) {
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

        const profitTotalSupply = await $publicClient.readContract({
          address: "0x48469a0481254d5945E7E56c1Eb9861429c02f44",
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const _prTotalSupply = await $publicClient.readContract({
          address: "0xAA3e3709C79a133e56C17a7ded87802adF23083B",
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const _sdivTotalSupply = await $publicClient.readContract({
          address: "0x9844a1c30462B55cd383A2C06f90BB4171f9D4bB",
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const treasuryBalance = await $publicClient.readContract({
          address: "0x48469a0481254d5945E7E56c1Eb9861429c02f44",
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: ["0xC82676D6025bbA6Df3585d2450EF6D0eE9b8607E"],
        });

        const multisigBalance = await $publicClient.readContract({
          address: "0x48469a0481254d5945E7E56c1Eb9861429c02f44",
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [contractData[0][6]],
        });

        //profit Token
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

        //sdiv token
        setSdivTotalSupply(formatUnits(_sdivTotalSupply, 18));

        //pm
        setPrTotalSupply(formatUnits(_prTotalSupply, 18));

        //platformData
        const _totalTvl = formatUnits(totalTvl, 18);
        const percentageFees: string[] = platformFees.map((fee: bigint) =>
          fee !== 0n ? (fee / 1000n).toString() + " %" : "0 %"
        );

        //treasury
        const _treasuryBalance = Number(
          formatUnits(treasuryBalance, 18)
        ).toFixed(2);

        //team
        const _multisig = Number(formatUnits(multisigBalance, 18)).toFixed(2);

        const platformData: PlatformData = {
          platformVersion: platformVersion,
          platformGovernance: contractData[0][5],
          multisig: contractData[0][6],
          multisigBalance: _multisig,
          numberOfTotalVaults: $balances[3].length,
          totalTvl: _totalTvl,
          strategieNames: contractData[6],
          platformFee: percentageFees[0],
          vaultManagerFee: percentageFees[1],
          strategyLogicFee: percentageFees[2],
          ecosystemFee: percentageFees[3],
          treasuryBalance: _treasuryBalance,
        };
        setPlatformData(platformData);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  return (
    <main className="p-0 w-full m-0">
      <div className="grid">
        <div className="dao flex">
          <div className="grid mb-auto w-[500px]">
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

            <table className="my-5 grid p-0 w-full">
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

            <table className="grid my-5 p-0 w-full">
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
          <section className="grid p-0 m-0 w-full">
            <h1 className="text-xxl text-gradient mb-3 p-0 w-full">
              Tokenomics
            </h1>

            {(() => {
              const profitTokenData = tokenlist.tokens.find(
                token =>
                  token.address === "0x48469a0481254d5945E7E56c1Eb9861429c02f44"
              );
              return (
                profitTokenData && (
                  <div className="m-auto grid w-full p-0">
                    <div className="flex p-0 w-full">
                      <table className=" whitespace-nowrap">
                        <tbody className="p-0 ">
                          <tr>
                            <td>Name: </td>
                            <td>{profitTokenData.name} </td>
                          </tr>
                          <tr>
                            <td>Symbol: </td>
                            <td>{profitTokenData.symbol} </td>
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
                          <tr>
                            <td>Address: </td>
                            <td>{profitTokenData.address} </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="w-full p-0 m-auto align-middle">
                        <img
                          className="rounded-full p-0 ms-auto flex justify-center align-middle w-full"
                          src={profitTokenData.logoURI}
                          alt={profitTokenData.logoURI}
                        />
                      </div>
                    </div>
                    <div className="grid mt-5 ">
                      <div className="flex">
                        <a
                          className="rounded-sm text-start p-1 me-3 text-gray-500 bg-gray-800"
                          href="https://dexscreener.com/polygon/0xd3B1f11f0ff29Add929941095C696D464D6961FC?embed=1&amp;theme=dark&amp;trades=0&amp;info=0">
                          Chart
                        </a>
                        <a
                          className="rounded-sm text-start p-1 mx-3 text-gray-500 bg-gray-800"
                          href="https://app.1inch.io/#/137/simple/swap/ETH/PROFIT">
                          Swap by 1inch
                        </a>
                        <a
                          className="rounded-sm text-start p-0 ms-3 text-gray-500 bg-gray-800"
                          href="https://app.uniswap.org/swap?inputCurrency=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&outputCurrency=0x48469a0481254d5945E7E56c1Eb9861429c02f44">
                          Swap by Uniswap V3
                        </a>
                      </div>
                    </div>
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
                  <div className="m-auto justify-between flex w-full p-0 mt-12">
                    <table className="whitespace-nowrap">
                      <tbody className="p-0 ">
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
                    <div className="w-full p-0 m-auto align-middle">
                      <img
                        className="rounded-full w-40 p-0 ms-auto"
                        src={sdivTokenData.logoURI}
                        alt={sdivTokenData.logoURI}
                      />
                    </div>
                  </div>
                )
              );
            })()}

            <div className="m-auto justify-between flex w-full p-0 mt-16">
              <table>
                <tbody className="p-0 w-full gap-3">
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
                    <td>{prTotalSupply}</td>
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
                alt="Profit maker"
                src="https://stabilitydao.org/pm.png"
                className="rounded-full w-52 p-0 flex"
              />
            </div>
            <div className="flex mt-5">
              <a
                className="rounded-sm text-start p-1 me-3  text-gray-500 bg-gray-800"
                href="https://opensea.io/collection/profit-maker">
                Marketplace
              </a>
            </div>

            <h1 className="text-xxl text-gradient mb-3">Governance</h1>

            <section className="text-start p-3 bg-gray-900 rounded-md">
              <section>
                <table>
                  <thead>
                    <tr>
                      <td>
                        <h1 className="text-start">Treasury</h1>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Address:</td>
                      <td>
                        <a>0xC82676D6025bbA6Df3585d2450EF6D0eE9b8607E</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p>Total balance: {_platformData?.treasuryBalance}</p>
              </section>
            </section>
            <section className="text-start p-3 bg-gray-900 rounded-md mt-5">
              <section>
                <table>
                  <thead>
                    <tr>
                      <td>
                        <h1 className="text-start">Gov</h1>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Address:</td>
                      <td>
                        <a>{_platformData?.platformGovernance}</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex mt-5">
                  <a
                    className="rounded-sm text-start p-1 me-3 text-gray-500 bg-gray-800"
                    href="https://www.tally.xyz/governance/eip155:137:0x6214Ba4Ce85C0A6F6025b0d63be7d65214463226">
                    {" "}
                    Tally governance app
                  </a>
                </div>
              </section>
            </section>
            <h1 className="text-xxl text-gradient mb-3">Team</h1>

            <section className="text-start p-3 bg-gray-900 rounded-md">
              <section>
                <table>
                  <thead>
                    <tr>
                      <td>
                        <h1 className="text-start">Multisig</h1>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Address:</td>
                      <td>
                        <a>{_platformData?.multisig}</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p>Total balance: {_platformData?.treasuryBalance}</p>
              </section>
            </section>
            <div className="mt-5 flex flex-wrap p-0 m-0 justify-center">
              {members.map(member => {
                return (
                  <a
                    href={member.html_url}
                    key={member.id}
                    className="m-4 p-2 w-40 "
                    target="blank">
                    <img
                      className="rounded-full mb-4"
                      src={member.avatar_url}
                    />
                    <p className="font-bold">{member.login}</p>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <br />
    </main>
  );
}

export { DAO };
