import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { publicClient, balances, assetsPrices } from "@store";
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

        const contractBalance: any = await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "getBalance",
          args: ["0x2138eB956dca8a04670693039a2EBc3087c9a20d"],
        });
        if (contractBalance) {
          for (const address of contractBalance[0]) {
            const balance = await $publicClient.readContract({
              address: address as TAddress,
              abi: ERC20ABI,
              functionName: "balanceOf",
              args: [MULTISIG[0] as TAddress],
            });

            const decimals = getTokenData(address)?.decimals;

            if (decimals && balance >= 0n) {
              const tokenInfo: TMultiTokenData = {
                balance:
                  Math.trunc(Number(formatUnits(balance, decimals)) * 100) /
                  100,
                priceBalance: Number(
                  Math.trunc(
                    Number(formatUnits(balance, decimals)) *
                      Number(
                        formatUnits($assetsPrices[address].tokenPrice, decimals)
                      ) *
                      100
                  ) / 100
                ),
              };

              _balances[address] = tokenInfo;
            }
          }
          setMultisigBalance(_balances);
        }
      } catch (error) {
        console.error("Fetching multisig", error);
      }
    }
  };

  useEffect(() => {
    fetchTeamData();
    fetchMultiSig();
  }, []);

  return members ? (
    <div className="mt-5 bg-[#3d404b] border border-gray-600 rounded-md min-h-[701px]">
      <h1 className="text-xxl text-left text-[#8D8E96] ps-4 my-auto">Team</h1>

      <div className="p-2 border border-gray-600 rounded-md mt-2">
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm font-medium border border-gray-700">
          <table className="text-[#8D8E96]">
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
            {_multisigBalance &&
              $assetsPrices &&
              Object.entries(_multisigBalance).map(([address, tokenInfo]) => (
                <div
                  className="bg-button p-3 rounded-md w-[115px] m-auto overflow-hidden"
                  key={address}>
                  <div className="grid justify-center">
                    <img
                      className="w-[38px] rounded-full m-auto mb-2"
                      alt={getTokenData(address)?.symbol}
                      src={getTokenData(address)?.logoURI}
                    />
                    <p className="my-auto font-medium">
                      {getTokenData(address)?.symbol}
                    </p>
                  </div>
                  <p className="text-center font-medium">{tokenInfo.balance}</p>
                  <p className="text-center text-gray-400 font-thin">
                    ≈${tokenInfo.priceBalance}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex flex-wrap m-auto justify-evenly w-full gap-4 my-7 rounded-md md:w-4/5 md:gap-4  lg:gap-5">
          {members.map(member => (
            <a
              href={member.html_url}
              key={member.name}
              className="text-sm p-3 md:w-[150px] hover:bg-button rounded-md"
              target="_blank">
              <img
                className="rounded-full m-auto w-[80px]"
                src={member.avatar_url}
                alt={`Avatar de ${member.name}`}
              />
              <p className="font-semibold text-center mt-1 text-gray-200 w-[115px]  md:w-full">
                {member.name}
              </p>
              {member.location !== null ? (
                <p className="flex md:w-full sm:text text-xs mt-1 text-left font-thin text-gray-400 w-[115px]">
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
              <p className="font-thin  md:w-full text-xs line-clamp-3 mt-1 text-gray-300 w-[115px]">
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
