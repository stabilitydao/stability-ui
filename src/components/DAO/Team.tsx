import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { publicClient, assetsPrices } from "@store";
import { formatUnits } from "viem";
import { getTokenData } from "@utils";
import type {
  TAddress,
  TGitHubUser,
  TMultisigBalance,
  TMultiTokenData,
} from "@types";
import { ERC20ABI, platform, PlatformABI } from "@web3";
import { MULTISIG } from "@constants";
import axios from "axios";
import ShortAddress from "./ShortAddress";
import { Loader } from "../Loader/index";

function Team() {
  const $publicClient = useStore(publicClient);
  const $assetsPrices = useStore(assetsPrices);
  const [members, setMembers] = useState<TGitHubUser[]>();
  const [_multisigBalance, setMultisigBalance] = useState<TMultisigBalance>();
  const teamDataCache = useRef(null);

  const fetchTeamData = async () => {
    try {
      const cachedData = localStorage.getItem("teamDataCache");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);

        const expirationTime = 12 * 60 * 60 * 1000;
        if (new Date().getTime() - parsedData.timestamp < expirationTime) {
          setMembers(parsedData.data);
          return;
        }
      }

      const response = await axios.get(
        "https://api.github.com/orgs/stabilitydao/public_members"
      );

      const members = response.data;
      const membersAdditionalInfo = await Promise.all(
        members.map(async (member: any) => {
          try {
            const memberInfoResponse = await axios.get(
              `https://api.github.com/users/${member.login}`
            );
            const updatedMember = {
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

      const cacheData = {
        data: sortedMembers,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("teamDataCache", JSON.stringify(cacheData));

      setMembers(sortedMembers);
    } catch (error) {
      console.error("Fetching team data", error);
    }
  };

  const fetchMultiSig = async () => {
    if ($publicClient && $assetsPrices) {
      try {
        const _balances: TMultisigBalance = {};
        const contractBalanceResponse: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getBalance",
          args: ["0x2138eB956dca8a04670693039a2EBc3087c9a20d"],
        });

        if (contractBalanceResponse) {
          const contractAddresses = contractBalanceResponse[0];
          const balancePromises = contractAddresses.map(
            async (address: TAddress) => {
              const balance = (await $publicClient.readContract({
                address: address as TAddress,
                abi: ERC20ABI,
                functionName: "balanceOf",
                args: [MULTISIG[0] as TAddress],
              })) as bigint;

              const decimals = getTokenData(address.toLowerCase())?.decimals;
              const _balance =
                Math.trunc(
                  Number(formatUnits(balance, Number(decimals))) * 100
                ) / 100;

              if (decimals && _balance > 0) {
                const tokenInfo: TMultiTokenData = {
                  balance: _balance,
                  priceBalance:
                    Math.trunc(
                      Number(formatUnits(balance, decimals)) *
                        Number(
                          formatUnits(
                            $assetsPrices[address.toLowerCase()]?.tokenPrice,
                            18
                          )
                        ) *
                        100
                    ) / 100,
                };
                _balances[address] = tokenInfo;
              }
            }
          );

          await Promise.all(balancePromises);

          setMultisigBalance(_balances);
        }
      } catch (error) {
        console.error("Fetching multisig", error);
      }
    }
  };

  useEffect(() => {
    fetchMultiSig();
  }, [$assetsPrices]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  return members ? (
    <div className="mt-5 bg-[#3d404b] border border-gray-600 rounded-md min-h-[701px]">
      <h1 className="text-xxl text-left text-[#9c9c9c] ps-4 my-auto">Team</h1>

      <div className="p-2 border border-gray-600 rounded-md mt-2">
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm font-medium border border-gray-700 min-h-[262px]">
          <table className="text-[#9c9c9c]">
            <thead>
              <tr>
                <td>
                  <h2 className="text-start text-2xl min-w-[90px]">Multisig</h2>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Address:</td>
                <td>
                  <ShortAddress address={MULTISIG[0]} />
                </td>
              </tr>
              <tr>
                <td>Balance:</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap justify-evenly w-full gap-2 mt-4 mb-2 ">
            {_multisigBalance ? (
              Object.entries(_multisigBalance).map(([address, tokenInfo]) => (
                <div
                  className="bg-button p-3 rounded-md w-[115px] m-auto overflow-hidden h-[130px]"
                  key={address}>
                  <div className="grid justify-center">
                    <img
                      className="w-[38px] h-[38px] rounded-full m-auto mb-2"
                      alt={getTokenData(address)?.symbol}
                      src={getTokenData(address)?.logoURI}
                      loading="lazy"
                    />
                    <p className="m-auto font-medium">
                      {getTokenData(address)?.symbol}
                    </p>
                  </div>
                  <p className="text-center font-medium m-auto">
                    {tokenInfo.balance}
                  </p>
                  <p className="text-center text-gray-400 font-thin m-auto">
                    ≈${tokenInfo.priceBalance}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex w-full justify-center m-auto ">
                <Loader
                  customHeight={50}
                  customWidth={50}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-2">
        <div className="flex flex-wrap m-auto gap-y-4 my-7 rounded-md md:w-4/5 md:gap-4 px-3 lg:gap-5">
          {members.map(member => (
            <a
              href={member.html_url}
              key={member.name}
              className="text-sm p-3 w-[160px] hover:bg-button rounded-md mx-auto"
              target="_blank">
              <img
                className="rounded-full m-auto w-[80px] h-[80px]"
                src={member.avatar_url}
                alt={`Avatar de ${member.name}`}
                loading="lazy"
              />
              <p className="font-semibold text-center mt-1 text-gray-200  md:w-full ">
                {member.name}
              </p>
              {member.location !== null ? (
                <p className="flex md:w-full sm:text text-xs mt-1 text-left font-thin text-gray-300">
                  <svg
                    className="pe-1 my-auto"
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 12 16"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                  </svg>
                  {member.location}
                </p>
              ) : (
                ""
              )}
              <p className="font-thin  md:w-full text-pretty text-xs line-clamp-3 mt-1 text-gray-100">
                {member.bio}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex p-3 shadow-lg rounded-md justify-center min-h-[1062px] m-auto mt-5 bg-[#3d404b] border-gray-600">
      <Loader
        customHeight={100}
        customWidth={100}
      />
    </div>
  );
}

export default Team;
