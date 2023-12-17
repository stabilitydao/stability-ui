import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { publicClient, platformData, balances, assetsPrices } from "@store";
import { formatUnits } from "viem";
import { getTokenData } from "@utils";
import type { TGitHubUser, TMultisigBalance, TMultiTokenData } from "@types";
import { ERC20ABI } from "@web3";
import { MULTISIG } from "@constants";
import axios from "axios";
import ShortAddress from "./ShortAddress";

function Team() {
  const $balances = useStore(balances);
  const $publicClient = useStore(publicClient);
  const [members, setMembers] = useState<TGitHubUser[]>();
  const [_multisigBalance, setMultisigBalance] = useState<TMultisigBalance>();
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

  const fetchTeamData = async () => {
    if ($publicClient && $assetsPrices) {
      //multisig asset balance
      const _balances: TMultisigBalance = {};

      for (const address of $balances[0]) {
        const balance = await $publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [MULTISIG[0] as `0x${string}`],
        });
        const decimals = getTokenData(address)?.decimals;

        if (decimals && balance > 0n) {
          const tokenInfo: TMultiTokenData = {
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
    }
  };

  useEffect(() => {
    getTeamData();
    fetchTeamData();
  }, []);

  return (
    <div className="my-5 bg-[#3d404b] border border-gray-600 rounded-md">
      <h1 className="text-xxl text-left text-[#8D8E96] ps-4 my-auto">Team</h1>

      <div className="p-3 border border-gray-600 rounded-md mt-2">
        <div className="p-3 bg-[#2c2f38] rounded-md text-sm border border-gray-700">
          <table className="text-[#8D8E96]">
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
                <td>
                  <ShortAddress address={MULTISIG[0]} />
                </td>
              </tr>
              <tr>
                <td>Balance:</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap justify-evenly w-full gap-3 my-5">
            {_multisigBalance &&
              $assetsPrices &&
              Object.entries(_multisigBalance).map(([address, tokenInfo]) => (
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
                  <p className="text-center font-medium">{tokenInfo.balance}</p>
                  <p className="text-center text-gray-400 font-thin">
                    ≈${tokenInfo.priceBalance}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 m-auto my-3 p-2 align-top w-full lg:w-3/4 rounded-md">
          {members ? (
            members.map(member => (
              <a
                href={member.html_url}
                key={member.name}
                className="text-sm p-2 max-w-[150px] h-[200px] m-auto hover:bg-button rounded-md"
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
                      strokeWidth="0"
                      viewBox="0 0 12 16"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                    </svg>{" "}
                    {member.location}
                  </p>
                ) : (
                  ""
                )}
                <p className="font-light text-xs line-clamp-3 mt-1">
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
  );
}

export default Team;
