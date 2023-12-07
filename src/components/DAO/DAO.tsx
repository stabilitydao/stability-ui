import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { vaults, publicClient, balances, assetsPrices } from "@store";
import {
  PlatformABI,
  FactoryABI,
  platform,
  ERC20ABI,
  IERC721Enumerable,
} from "@web3";
import type {
  TDAOData,
  TGitHubUser,
  TProfitTokenData,
  TmultisigBalance,
  TmultiTokenData,
} from "@types";
import { SDIV, PROFIT, PM, TREASURY } from "@constants";
import { getStrategyInfo, getTokenData } from "@utils";
import axios from "axios";

function DAO() {
  const [daoData, setDaoData] = useState<TDAOData>();
  const [profitTokenData, setProfitTokenData] = useState<TProfitTokenData>();
  const [members, setMembers] = useState<TGitHubUser[]>();
  const [_multisigBalance, setMultisigBalance] = useState<TmultisigBalance>();
  const [tokensTotalSupply, setTokensTotalSupply] = useState({
    pm: "",
    sdiv: "",
  });
  const $publicClient = useStore(publicClient);
  const $vaults = useStore(vaults);
  const $balances = useStore(balances);
  const $assetsPrices = useStore(assetsPrices);

  const getTeamData = async () => {
    try {
      const response = await axios.get(
        "https://api.github.com/orgs/stabilitydao/public_members"
      );

      const members = response.data;
      const membersAdditionalInfo: TGitHubUser[] = await Promise.all(
        members.map(async (member: any) => {
          try {
            const memberInfoResponse = await axios.get(
              `https://api.github.com/users/${member.login}`
            );
            const updatedMember: TGitHubUser = {
              bio: memberInfoResponse.data.bio,
              location: memberInfoResponse.data.location,
              name: memberInfoResponse.data.name,
              avatar_url: memberInfoResponse.data.avatar_url,
              html_url: memberInfoResponse.data.html_url,
              followers: memberInfoResponse.data.followers,
            };
            return updatedMember;
          } catch (error) {
            console.error(
              `Error fetching member info for ${member.login}`,
              error
            );
            return member;
          }
        })
      );

      const sortedMembers = membersAdditionalInfo.sort(
        (a, b) => b.followers - a.followers
      );

      setMembers(sortedMembers);
    } catch (error) {
      console.error("Fetching getTeamData", error);
    }
  };

  //get strategie bg-col/color
  function getFarmColor(farmName: string) {
    let color;
    const farm = farmName.split(" ");
    const initials = farm.map(function (initials: string) {
      return initials.charAt(0);
    });
    const resultado = initials.join("");
    if (resultado === "GQF") {
      color = getStrategyInfo(resultado + "S");
    } else {
      color = getStrategyInfo(resultado);
    }
    return color;
  }

  const fetchDaoData = async () => {
    if ($publicClient && $balances && $assetsPrices) {
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
        console.log(platformFees);

        const contractData: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getData",
        });

        const profitTotalSupply = await $publicClient.readContract({
          address: PROFIT[0] as `0x${string}`,
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const pmTotalSupply = await $publicClient.readContract({
          address: PM[0] as `0x${string}`,
          abi: IERC721Enumerable,
          functionName: "totalSupply",
        });

        const sdivTotalSupply = await $publicClient.readContract({
          address: SDIV[0] as `0x${string}`,
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const treasuryBalance = await $publicClient.readContract({
          address: PROFIT[0] as `0x${string}`,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [TREASURY[0] as `0x${string}`],
        });

        const network = await $publicClient.readContract({
          address: platform as `0x${string}`,
          abi: PlatformABI,
          functionName: "getPlatformSettings",
        });

        const farmsLength = await $publicClient.readContract({
          address: contractData[0][0] as `0x${string}`,
          abi: FactoryABI,
          functionName: "farmsLength",
        });

        //vault types
        const vaultType = contractData[3];

        //multisig asset balance
        const _balances: TmultisigBalance = {};

        for (const address of $balances[0]) {
          const balance = await $publicClient.readContract({
            address: address as `0x${string}`,
            abi: ERC20ABI,
            functionName: "balanceOf",
            args: [contractData[0][6]],
          });
          const decimals = getTokenData(address)?.decimals;

          if (decimals && balance > 0n) {
            const tokenInfo: TmultiTokenData = {
              balance: Number(formatUnits(balance, decimals)).toFixed(2),
              priceBalance: Number(
                (
                  Number(formatUnits(balance, decimals)) *
                  Number(
                    formatUnits($assetsPrices[address].tokenPrice, decimals)
                  )
                ).toFixed(2)
              ),
            };

            _balances[address] = tokenInfo;
          }
        }
        setMultisigBalance(_balances);

        //tvl
        const totalTvl: bigint = $vaults[6].reduce(
          (total: bigint, number: bigint) => total + number,
          BigInt(0)
        );
        const _totalTvl = Number(formatUnits(totalTvl, 18)).toFixed(2);

        //profit Token
        const _profitTokenPrice = Number(
          formatUnits($assetsPrices[PROFIT[0]].tokenPrice, 18)
        ).toFixed(2);

        const _profitTotalSupply = Number(
          formatUnits(profitTotalSupply, 18)
        ).toLocaleString("es-ES");

        const _profitMarketCap = (
          Number(_profitTokenPrice) * Number(formatUnits(profitTotalSupply, 18))
        ).toLocaleString("es-ES");

        const profitToken: TProfitTokenData = {
          price: _profitTokenPrice,
          totalSupply: _profitTotalSupply,
          marketCap: _profitMarketCap,
        };
        setProfitTokenData(profitToken);

        //sdiv && pm total supply
        const _pmTotalSupply = Number(pmTotalSupply).toLocaleString("es-ES");

        const _sdivTotalSupply = Number(
          formatUnits(sdivTotalSupply, 18)
        ).toLocaleString("es-ES");

        const _tokensTotalSupply = {
          pm: _pmTotalSupply,
          sdiv: _sdivTotalSupply,
        };

        setTokensTotalSupply(_tokensTotalSupply);

        //fees
        const percentageFees: string[] = platformFees.map((fee: bigint) =>
          (fee / 1000n).toString()
        );

        //treasury
        const _treasuryBalance = Number(
          formatUnits(treasuryBalance, 18)
        ).toFixed(2);

        const daoData: TDAOData = {
          platformVersion: platformVersion,
          platformGovernance: contractData[0][5],
          multisigAddress: contractData[0][6],
          numberOfTotalVaults: $balances[3].length,
          totalTvl: _totalTvl,
          strategieNames: contractData[6],
          platformFee: percentageFees[0],
          vaultManagerFee: percentageFees[1],
          typesOfVaults: contractData[3],
          strategyLogicFee: percentageFees[2],
          ecosystemFee: percentageFees[3],
          treasuryBalance: _treasuryBalance,
          network: network,
          farmsLength: Number(farmsLength),
        };

        setDaoData(daoData);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  useEffect(() => {
    getTeamData();
    fetchDaoData();
  }, [$balances]);

  return (
    <main className="w-full p-o">
      <div className="m-auto pb-3 p-7 bg-button border border-gray-950 shadow-md rounded-md w-full">
        <div className="flex">
          <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">Platform</h1>

          <p className="align-middle flex ms-auto my-auto text-sm pe-2 text-[#8D8E96]">
            v{daoData?.platformVersion}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm m-auto">
          <div className="p-3 rounded-md border border-gray-950  bg-[#1c1c23]  shadow-md w-full">
            <div className="mb-3">
              <h2 className="font-bold">Network</h2>
              <h2>{daoData?.network.networkName}</h2>
            </div>
            <div className="mb-3">
              <h2 className="font-bold">Total Vaults</h2>
              <h2>{daoData?.numberOfTotalVaults}</h2>
            </div>
            <div>
              <h2 className="font-bold">Total TVL</h2>
              <h2>$ {daoData?.totalTvl}</h2>
            </div>
          </div>

          <div className="p-3 bg-[#3d404b] rounded-md">
            <table className="w-full h-full text-[#8D8E96]">
              <thead>
                <tr>
                  <th className="text-left text-xl">Fees:</th>
                </tr>
              </thead>
              <tbody>
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
              <h2 className="text-xl font-medium text-left text-[#8D8E96]">
                Strategies:
              </h2>
              {Array.isArray(daoData?.strategieNames) &&
                daoData?.strategieNames.map(
                  (strategyName: string, index: number) => (
                    <div
                      key={index}
                      className="gap-3 py-3">
                      <h3
                        className="rounded-md m-o py-2 px-1"
                        style={{
                          color: getFarmColor(strategyName)?.color,
                          backgroundColor: getFarmColor(strategyName)?.bgColor,
                        }}>
                        {strategyName}
                      </h3>
                    </div>
                  )
                )}
            </div>
          </div>

          <div className="p-3 flex bg-[#3d404b] shadow-md rounded-md">
            <div>
              <h2 className="font-bold">Vault Types</h2>
              {daoData?.typesOfVaults &&
                daoData.typesOfVaults.map((vaultType, index) => {
                  return <h2 key={index}>{vaultType}</h2>;
                })}
            </div>
          </div>
          <div className="p-3 rounded-md bg-[#2c2f38] shadow-md  bg-opacity-75">
            <div className="w-full h-full grid m-auto">
              <h2 className="text-xl font-medium text-left text-[#8D8E96]">
                Total farms
              </h2>
              {daoData?.farmsLength}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#262830] pt-1 mt-5 mb-5 rounded-md">
        <div className="m-auto w-5/6 mt-5 bg-[#3d404b] border border-gray-600 rounded-md">
          <div className="m-auto p-3 w-full">
            <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">
              Tokenomics
            </h1>

            <div className="bg-[#2c2f38] rounded-md p-3 mt-5 w-full">
              <div className="flex bg-[#2c2f38] m-auto mt-5 w-full">
                <table className="text-sm text-[#8D8E96]">
                  <tbody>
                    <tr>
                      <td className="min-w-[85px]">Name: </td>
                      <td>{getTokenData(PROFIT[0])?.name} </td>
                    </tr>
                    <tr>
                      <td>Symbol: </td>
                      <td>{getTokenData(PROFIT[0])?.symbol} </td>
                    </tr>

                    <tr>
                      <td>Price: </td>
                      <td>
                        {"$ "}
                        {profitTokenData?.price}{" "}
                      </td>
                    </tr>
                    <tr>
                      <td>Total supply: </td>
                      <td>{profitTokenData?.totalSupply} </td>
                    </tr>
                    <tr>
                      <td>Market Cap: </td>
                      <td>
                        {"$ "}
                        {profitTokenData?.marketCap}{" "}
                      </td>
                    </tr>
                    <tr>
                      <td>Address: </td>
                      <td>{getTokenData(PROFIT[0])?.address} </td>
                    </tr>
                    <tr>
                      <td>Wallet: </td>
                      <td>
                        <span className="text-red-600">ADD WALLET</span>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td className="mb-auto align-top">Staked: </td>
                      <td className=" gap-3">
                        <p className="text-red-600 my-auto ">ADD STAKED</p>{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="w-52 ms-auto">
                  <img
                    className="rounded-full ms-auto "
                    src={getTokenData(PROFIT[0])?.logoURI}
                    alt={getTokenData(PROFIT[0])?.logoURI}
                  />
                </div>
              </div>

              <div className="flex mt-3 text-sm">
                <button className="bg-button me-3 rounded-sm p-2 text-red-600">
                  Stake
                </button>
                <button className="bg-button rounded-sm p-2 text-red-600">
                  Unstake
                </button>
              </div>

              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex text-[#8D8E96] bg-button "
                  href="https://dexscreener.com/polygon/0xd3B1f11f0ff29Add929941095C696D464D6961FC?embed=1&amp;theme=dark&amp;trades=0&amp;info=0">
                  Chart
                </a>
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex bg-button "
                  href="https://app.1inch.io/#/137/simple/swap/ETH/PROFIT">
                  Swap by 1inch
                </a>
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex bg-button "
                  href="https://app.uniswap.org/swap?inputCurrency=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&outputCurrency=0x48469a0481254d5945E7E56c1Eb9861429c02f44">
                  Swap by Uniswap V3
                </a>
              </div>
            </div>

            <div className="bg-[#2c2f38] rounded-md p-3 mt-5 w-full">
              <div className="flex mt-5 m-auto w-full">
                <table className="text-sm h-52">
                  <tbody>
                    <tr>
                      <td className="min-w-[85px]">Name: </td>
                      <td>{getTokenData(SDIV[0])?.name} </td>
                    </tr>
                    <tr>
                      <td>Symbol: </td>
                      <td>{getTokenData(SDIV[0])?.symbol} </td>
                    </tr>
                    <tr>
                      <td>Address: </td>
                      <td>{getTokenData(SDIV[0])?.address} </td>
                    </tr>
                    <tr>
                      <td>Total supply: </td>
                      <td>{tokensTotalSupply.sdiv} </td>
                    </tr>
                    <tr>
                      <td>Wallet: </td>
                      <td className=" my-auto">
                        <span className="text-red-600">ADD WALLET</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Earned: </td>
                      <td>
                        <span className="text-red-600 me-3 my-auto">
                          ADD EARNED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="w-52 ms-auto">
                  <img
                    className="rounded-full ms-auto"
                    src={getTokenData(SDIV[0])?.logoURI}
                    alt={getTokenData(SDIV[0])?.logoURI}
                  />
                </div>
              </div>

              <div className="flex mt-3 text-sm">
                {" "}
                <button className="bg-button rounded-sm p-2 text-red-600">
                  Claim
                </button>
              </div>
            </div>

            <div className="m-auto  bg-[#2c2f38] rounded-md p-3 mt-5">
              <div className="flex bg-[#2c2f38] rounded-md mt-5 w-full justify-between">
                <table className="text-sm">
                  <tbody>
                    <tr>
                      <td className="min-w-[85px]">Name: </td>
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
                      <td>{tokensTotalSupply.pm}</td>
                    </tr>
                    <tr>
                      <td>To mint: </td>
                      <td>
                        <span className="text-red-600 "> ADD TO MINT</span>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td>Mint:</td>
                      <td>
                        <span className="text-red-600 ">ADD MINT</span>{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="w-52 ms-auto ">
                  <img
                    alt="Profit maker"
                    src="https://stabilitydao.org/pm.png"
                    className="rounded-full ms-auto"
                  />
                </div>
              </div>

              <div className="flex pt-3">
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex text-[#8D8E96] bg-button "
                  href="https://opensea.io/collection/profit-maker">
                  Marketplace
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-4/5 md:w-2/3 m-auto  mt-5 bg-[#3d404b] border border-gray-600 rounded-md">
          <div className="p-3">
            <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">
              Governance
            </h1>
            <div className="p-3 bg-[#2c2f38] rounded-md text-sm">
              <table>
                <thead>
                  <tr>
                    <td>
                      <h2 className="text-start text-2xl py-4">Treasury</h2>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="min-w-[85px]">Address:</td>
                    <td>{TREASURY[0]}</td>
                  </tr>
                  <tr>
                    <td>Total balance: </td>
                    <td>{daoData?.treasuryBalance}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#2c2f38] rounded-md mt-5 text-sm">
              <table>
                <thead>
                  <tr>
                    <td>
                      <h2 className="text-start text-2xl py-4">Governance</h2>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="min-w-[85px]">Address:</td>
                    {/* <td>{daoData?.platformGovernance}</td> */}
                  </tr>
                </tbody>
              </table>
              <div className="flex mt-5">
                <a
                  className="rounded-sm text-start p-2 me-3 text-[#8D8E96] bg-button"
                  href="https://www.tally.xyz/governance/eip155:137:0x6214Ba4Ce85C0A6F6025b0d63be7d65214463226">
                  {" "}
                  Tally governance app
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="m-auto mb-5 w-5/6 mt-5 bg-[#3d404b] border border-gray-600 rounded-md">
          <div className="p-3">
            <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">Team</h1>
            <div className="p-3 bg-[#2c2f38] rounded-md text-sm">
              <table>
                <thead>
                  <tr>
                    <td>
                      <h2 className="text-start text-2xl py-4">Multisig</h2>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Address:</td>
                    <td>{daoData?.multisigAddress}</td>
                  </tr>
                  <tr>
                    <td>Balance:</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-wrap justify-evenly w-full gap-4 mt-5 mb-5">
                {_multisigBalance &&
                  $assetsPrices &&
                  Object.entries(_multisigBalance).map(
                    ([address, tokenInfo]) => (
                      <div
                        className="bg-button p-3 rounded-md w-[120px] m-auto"
                        key={address}>
                        <div className="grid justify-center">
                          <img
                            className="w-[28px] rounded-full m-auto mb-2"
                            src={getTokenData(address)?.logoURI}
                          />
                          <p className="my-auto font-medium">
                            {getTokenData(address)?.symbol}
                          </p>
                        </div>
                        <p className="text-center font-medium">
                          {tokenInfo.balance}
                        </p>
                        <p className="text-center text-gray-400 font-thin">
                          ≈${tokenInfo.priceBalance}
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>

          <div className="mt-5 mb-5 flex flex-wrap justify-center align-top w-full m-auto">
            {members ? (
              members.map(member => (
                <a
                  href={member.html_url}
                  key={member.name}
                  className="text-sm p-2 w-[150px] h-[230px] mb-auto hover:bg-button rounded-md"
                  target="_blank">
                  <img
                    className="rounded-full m-auto w-[100px]"
                    src={member.avatar_url}
                    alt={`Avatar de ${member.name}`}
                  />
                  <p className="font-medium text-lg text-center mt-1">
                    {member.name}
                  </p>
                  {member.location !== "" ? (
                    <p className="text-sm mt-1 flex text-left">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        stroke-width="0"
                        viewBox="0 0 12 16"
                        class="mt-1"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                      </svg>{" "}
                      {member.location}
                    </p>
                  ) : (
                    ""
                  )}
                  <p className="font-light text-sm line-clamp-3">
                    {member.bio}
                  </p>
                </a>
              ))
            ) : (
              <p>Loading team..</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export { DAO };
