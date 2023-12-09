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
    try {
      const platformVersion = await $publicClient.readContract({
        address: platform,
        abi: PlatformABI,
        functionName: "platformVersion",
      });

      const platformFees = await $publicClient.readContract({
        address: platform,
        abi: PlatformABI,
        functionName: "getFees",
      });
      console.log(platformFees);

      const contractData = await $publicClient.readContract({
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });

      const profitTotalSupply = await $publicClient.readContract({
        address: PROFIT[0],
        abi: ERC20ABI,
        functionName: "totalSupply",
      });

      const pmTotalSupply = await $publicClient.readContract({
        address: PM[0],
        abi: IERC721Enumerable,
        functionName: "totalSupply",
      });

      const sdivTotalSupply = await $publicClient.readContract({
        address: SDIV[0],
        abi: ERC20ABI,
        functionName: "totalSupply",
      });

      const treasuryBalance = await $publicClient.readContract({
        address: PROFIT[0],
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [TREASURY[0]],
      });

      const network = await $publicClient.readContract({
        address: platform,
        abi: PlatformABI,
        functionName: "getPlatformSettings",
      });

      const farmsLength = await $publicClient.readContract({
        address: contractData[0][0],
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
                Number(formatUnits($assetsPrices[address].tokenPrice, decimals))
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
      const _totalTvl = Number(formatUnits(totalTvl, 18))
        .toFixed(2)
        .toLocaleString("es-ES");

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
      const _treasuryBalance = Number(formatUnits(treasuryBalance, 18)).toFixed(
        2
      );

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
  };

  useEffect(() => {
    getTeamData();
    fetchDaoData();
  }, [$balances]);

  return daoData ? (
    <main>
      <div className="w-full flex px-5 justify-between h-[70px] bg-button shadow-lg rounded-md ">
        <h1 className="text-xxl text-[#8D8E96] my-auto">Platform</h1>
        <p className="text-sm text-[#8D8E96] my-auto pt-3">
          v{daoData?.platformVersion}
        </p>
      </div>
      <div className="w-full p-4 m-auto bg-button shadow-lg rounded-md mt-2">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 shadow-lg text-sm">
          <div className="grid h-full p-3 m-auto rounded-md bg-[#1c1c23] shadow-sm w-full">
            <div className="m-auto">
              <h2 className="text-2xl">{daoData?.network.networkName}</h2>
              <h2 className="text-sm">Network</h2>
            </div>

            <div className="mt-5 mb-2">
              <h2 className="text-3xl font-semibold">$ {daoData?.totalTvl}</h2>
              <h2>TVL</h2>
            </div>

            <div className="flex w-full m-auto align-middle border border-t-1 border-x-0 border-b-0 border-gray-800">
              <div className="m-auto">
                <h2 className="text-2xl font-semibold">
                  {daoData?.numberOfTotalVaults}
                </h2>
                <h2>Vaults</h2>
              </div>
              <div className="m-auto">
                <h2 className="text-2xl font-semibold">
                  {daoData?.farmsLength}
                </h2>
                <h2>Farms</h2>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#3d404b] rounded-md shadow-sm">
            <table className="w-full h-full text-[#8D8E96]">
              <thead>
                <tr>
                  <th className="text-left text-2xl pb-2">Fees:</th>
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
                        className="rounded-md m-0 py-2 px-1"
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
                  <h2 className="font-bold">Vault Types</h2>
                  {daoData?.typesOfVaults &&
                    daoData.typesOfVaults.map((vaultType, index) => {
                      return <h2 key={index}>{vaultType}</h2>;
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="m-auto flex mt-5 bg-[#3d404b] border border-gray-600 rounded-md">
          <div className="m-auto flex flex-wrap gap-3 w-full p-3">
            <h1 className="text-xxl text-left text-[#8D8E96] mb-3 w-full">
              Tokenomics
            </h1>

            <div className="bg-[#2c2f38] rounded-md p-3 sm:w-auto md:w-2/3 lg:w-1/3">
              <div className="flex">
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

              <div className="flex mt-3">
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex bg-button me-2"
                  href="https://dexscreener.com/polygon/0xd3B1f11f0ff29Add929941095C696D464D6961FC?embed=1&amp;theme=dark&amp;trades=0&amp;info=0"
                  title="Live chart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    fill="#fff"
                    fill-rule="evenodd"
                    viewBox="0 0 252 300"
                    focusable="false"
                    className="chakra-icon custom-1ipksj0 w-[22px]">
                    <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.498 3.076-2.342 6.434-3.518 9.747-3.518s6.671 1.176 9.748 3.518c8.576 6.538 14.934 16.951 13.821 40.498a5.95 5.95 0 003.84 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 23.502 14.342 3.228 2.622 5.886 5.155 8.814 8.071 7.897.273 19.438-8.5 24.796-16.709-9.221 30.23-51.299 65.929-80.43 79.589-.012-.005-.02-.012-.029-.018-5.228-3.992-11.108-5.988-16.989-5.988s-11.76 1.996-16.988 5.988c-.009.005-.017.014-.029.018-29.132-13.66-71.209-49.359-80.43-79.589 5.357 8.209 16.898 16.982 24.795 16.709 2.929-2.915 5.587-5.449 8.814-8.071C69.31 16.94 77.204 12.083 85.664 8.406 97.882 3.103 111.959.377 126 0m-25.818 106.866c-9.176-4.576-20.854-11.312-32.544-20.541-2.465 5.119-2.735 9.586-1.466 13.193.901 2.542 2.597 4.753 4.826 6.512 2.416 1.901 5.432 3.285 8.766 4.033 6.326 1.425 13.711.593 20.418-3.197"></path>
                    <path d="M197.167 75.016c6.436-6.495 12.107-13.684 16.667-20.099l2.316 4.359c7.456 14.917 11.33 29.774 11.33 46.494l-.016 26.532.14 13.754c.54 33.766 7.846 67.929 24.396 99.193l-34.627-27.922-24.501 39.759-25.74-24.231L126 299.604l-41.132-66.748-25.739 24.231-24.501-39.759L0 245.25c16.55-31.264 23.856-65.427 24.397-99.193l.14-13.754-.016-26.532c0-16.721 3.873-31.578 11.331-46.494l2.315-4.359c4.56 6.415 10.23 13.603 16.667 20.099l-2.01 4.175c-3.905 8.109-5.198 17.176-2.156 25.799 1.961 5.554 5.54 10.317 10.154 13.953 4.48 3.531 9.782 5.911 15.333 7.161 3.616.814 7.3 1.149 10.96 1.035-.854 4.841-1.227 9.862-1.251 14.978L53.2 160.984l25.206 14.129a41.926 41.926 0 015.734 3.869c20.781 18.658 33.275 73.855 41.861 100.816 8.587-26.961 21.08-82.158 41.862-100.816a41.865 41.865 0 015.734-3.869l25.206-14.129-32.665-18.866c-.024-5.116-.397-10.137-1.251-14.978 3.66.114 7.344-.221 10.96-1.035 5.551-1.25 10.854-3.63 15.333-7.161 4.613-3.636 8.193-8.399 10.153-13.953 3.043-8.623 1.749-17.689-2.155-25.799l-2.01-4.175z"></path>
                  </svg>
                </a>
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex bg-button me-2"
                  href="https://app.1inch.io/#/137/simple/swap/ETH/PROFIT">
                  Swap by 1inch
                </a>
                <a
                  className="rounded-sm text-start p-2 text-sm my-auto flex bg-button "
                  href="https://app.uniswap.org/swap?inputCurrency=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&outputCurrency=0x48469a0481254d5945E7E56c1Eb9861429c02f44"
                  title="Swap by uniswap">
                  <svg
                    fill="white"
                    className="Icons__UniLogo-sc-dy67gv-0 iEwsPo w-[22px]"
                    viewBox="0 0 14 15"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.152 1.551c-.188-.029-.196-.032-.107-.045.17-.026.57.009.846.074.644.152 1.23.542 1.856 1.235l.166.184.238-.038c1.002-.16 2.02-.033 2.873.358.235.108.605.322.65.377.016.018.043.13.06.251.064.418.033.737-.096.976-.07.13-.074.171-.027.283a.274.274 0 0 0 .246.154c.212 0 .44-.34.545-.814l.042-.189.083.094c.457.514.815 1.214.876 1.712l.016.13-.076-.118a1.462 1.462 0 0 0-.435-.453c-.306-.201-.63-.27-1.486-.315-.774-.04-1.212-.106-1.646-.247-.739-.24-1.111-.558-1.989-1.702-.39-.509-.63-.79-.87-1.016-.545-.515-1.08-.785-1.765-.89Z"></path>
                    <path d="M10.85 2.686c.019-.34.065-.565.159-.77a.825.825 0 0 1 .077-.148c.005 0-.011.06-.036.133-.068.2-.08.472-.032.789.06.402.093.46.52.894.201.204.434.46.519.571l.154.2-.154-.143c-.188-.175-.62-.517-.716-.566-.064-.032-.074-.032-.113.007-.037.036-.044.09-.05.346-.007.399-.062.655-.194.91-.071.14-.082.11-.018-.047.048-.116.053-.168.053-.554 0-.775-.094-.962-.637-1.28a5.971 5.971 0 0 0-.504-.26 1.912 1.912 0 0 1-.246-.12c.015-.015.545.139.758.22.318.122.37.137.409.123.025-.01.038-.085.05-.305ZM4.517 4.013c-.381-.522-.618-1.323-.566-1.922l.015-.185.087.015c.164.03.445.134.577.214.361.218.518.505.677 1.243.047.216.108.46.136.544.045.133.217.444.356.646.1.146.034.215-.188.195-.339-.03-.798-.345-1.094-.75ZM10.386 7.9c-1.784-.713-2.412-1.333-2.412-2.378 0-.154.005-.28.012-.28.006 0 .075.05.153.113.362.288.767.411 1.889.574.66.096 1.03.173 1.373.286 1.09.359 1.763 1.087 1.924 2.08.046.288.02.828-.057 1.113-.06.225-.242.63-.29.646-.014.005-.027-.046-.03-.116-.018-.372-.208-.735-.526-1.007-.362-.309-.848-.555-2.036-1.03ZM9.134 8.197a3.133 3.133 0 0 0-.086-.375l-.046-.135.085.095c.117.13.21.297.288.52.06.17.066.22.066.496 0 .271-.008.328-.064.48a1.518 1.518 0 0 1-.376.596c-.326.33-.745.512-1.35.588-.105.013-.411.035-.68.049-.679.035-1.126.108-1.527.248a.324.324 0 0 1-.115.027c-.016-.016.258-.178.483-.286.318-.153.635-.236 1.345-.353.35-.058.713-.129.805-.157.868-.264 1.315-.947 1.172-1.793Z"></path>
                    <path d="M9.952 9.641c-.237-.506-.292-.995-.162-1.451.014-.05.036-.089.05-.089.013 0 .07.03.124.067.11.073.328.196.912.512.728.395 1.144.7 1.426 1.05.247.305.4.654.474 1.078.042.24.017.82-.045 1.062-.196.764-.65 1.364-1.3 1.714-.095.051-.18.093-.19.093-.009 0 .026-.087.077-.194.219-.454.244-.895.079-1.386-.102-.301-.308-.668-.724-1.289-.484-.72-.602-.913-.721-1.167ZM3.25 12.374c.663-.556 1.486-.95 2.237-1.072a3.51 3.51 0 0 1 1.161.045c.48.122.91.396 1.133.721.218.319.312.596.41 1.214.038.243.08.488.092.543.073.32.216.576.392.704.28.204.764.217 1.239.033a.618.618 0 0 1 .155-.048c.017.017-.222.176-.39.26a1.334 1.334 0 0 1-.648.156c-.435 0-.796-.22-1.098-.668a5.3 5.3 0 0 1-.296-.588c-.318-.721-.475-.94-.844-1.181-.322-.21-.737-.247-1.049-.095-.41.2-.524.72-.23 1.05a.911.911 0 0 0 .512.266.545.545 0 0 0 .619-.544c0-.217-.084-.34-.295-.436-.289-.129-.598.022-.597.291 0 .115.051.187.167.24.074.033.076.035.015.023-.264-.055-.326-.372-.114-.582.256-.252.784-.141.965.204.076.145.085.433.019.607-.15.39-.582.595-1.022.483-.3-.076-.421-.158-.782-.527-.627-.642-.87-.767-1.774-.907l-.174-.027.197-.165Z"></path>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M.308.884C2.402 3.41 3.845 4.452 4.005 4.672c.132.182.082.346-.144.474a1.381 1.381 0 0 1-.515.143c-.147 0-.198-.056-.198-.056-.085-.08-.133-.066-.57-.837A132.96 132.96 0 0 0 1.45 2.67c-.032-.03-.031-.03 1.067 1.923.177.407.035.556.035.614 0 .118-.033.18-.179.343-.244.27-.353.574-.432 1.203-.088.705-.336 1.203-1.024 2.056-.402.499-.468.59-.57.792-.128.253-.163.395-.177.714-.015.339.014.557.118.88.09.284.186.47.429.844.21.323.33.563.33.657 0 .074.014.074.34.001.776-.174 1.407-.48 1.762-.857.22-.233.271-.361.273-.68.001-.208-.006-.252-.063-.372-.092-.195-.26-.358-.63-.61-.486-.33-.694-.595-.75-.96-.048-.3.007-.511.275-1.07.278-.58.347-.827.394-1.41.03-.377.071-.526.18-.646.114-.124.216-.166.498-.204.459-.063.75-.18.99-.4a.853.853 0 0 0 .31-.652l.01-.21-.117-.134C4.098 4.004.026.5 0 .5-.005.5.133.673.308.884Zm.976 9.815a.37.37 0 0 0-.115-.489c-.15-.1-.385-.052-.385.077 0 .04.022.069.072.094.084.043.09.091.024.19-.067.099-.061.186.015.246.123.095.297.043.389-.118ZM4.925 5.999c-.215.065-.424.292-.49.53-.039.145-.016.4.043.478.096.127.188.16.439.159.49-.003.916-.212.966-.474.04-.214-.147-.51-.405-.641a.965.965 0 0 0-.553-.052Zm.574.445c.075-.107.042-.222-.087-.3-.244-.149-.615-.026-.615.204 0 .115.193.24.37.24.118 0 .28-.07.332-.144Z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-[#2c2f38] rounded-md p-3 mt-3 w-full sm:w-full md:w-1/3 lg:w-1/3">
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

            <div className="m-auto  bg-[#2c2f38] rounded-md p-3 mt-3 sm:w-full md:w-1/3 lg:w-1/3">
              <div className="flex rounded-md mt-5 w-full justify-between">
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

        <div className="w-7/8  m-auto  mt-5 bg-[#3d404b] border border-gray-600 rounded-md  lg:w-1/3">
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

            <div className="p-3 w-7/8 bg-[#2c2f38] rounded-md mt-5 text-sm">
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

        <div className="m-auto mb-5 w-7/8 mt-5 bg-[#3d404b] border border-gray-600 rounded-md">
          <div className="p-3">
            <h1 className="text-xxl text-[#8D8E96] mb-3 text-left">Team</h1>
            <div className="p-3 bg-[#13151A] rounded-md text-sm">
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
              <div className="flex flex-wrap justify-evenly w-full gap-3 mt-5 mb-5">
                {_multisigBalance &&
                  $assetsPrices &&
                  Object.entries(_multisigBalance).map(
                    ([address, tokenInfo]) => (
                      <div
                        className="bg-button p-3 rounded-md w-[110px] m-auto"
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 m-auto mt-5 p-2 justify-center align-top w-full ">
            {members ? (
              members.map(member => (
                <a
                  href={member.html_url}
                  key={member.name}
                  className="text-sm p-2 w-[160px] h-[200px] m-auto hover:bg-button rounded-md"
                  target="_blank">
                  <img
                    className="rounded-full m-auto w-[75px]"
                    src={member.avatar_url}
                    alt={`Avatar de ${member.name}`}
                  />
                  <p className="font-bold text-center mt-1">{member.name}</p>
                  {member.location !== null ? (
                    <p className="text-xs mt-1 flex text-left">
                      <svg
                        className="me-1 my-auto"
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
                  <p className="font-light text-sm line-clamp-3 mt-1">
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
  ) : (
    <h1>Loading DAO..</h1>
  );
}

export { DAO };
