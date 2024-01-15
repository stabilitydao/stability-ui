import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { ShortAddress } from "./ShortAddress";
import { Loader } from "@components";
import { publicClient, assetsPrices } from "@store";
import { getTokenData } from "@utils";
import { ERC20ABI, platform, PlatformABI } from "@web3";
import { MULTISIG } from "@constants";
import { GRAPH_ENDPOINT } from "@constants";

import type {
  TAddress,
  TGitHubUser,
  TMultisigBalance,
  TMultiTokenData,
} from "@types";

const Team = () => {
  const $publicClient = useStore(publicClient);
  const $assetsPrices = useStore(assetsPrices);

  const teamDataCache = useRef(null);

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

      const membersAdditionalInfo = await Promise.all(
        response.data.map(async (member: any) => {
          try {
            const memberInfoResponse = await axios.get(
              `https://api.github.com/users/${member.login}`
            );
            return {
              bio: memberInfoResponse.data.bio,
              location: memberInfoResponse.data.location,
              name: memberInfoResponse.data.name,
              avatar_url: memberInfoResponse.data.avatar_url,
              html_url: memberInfoResponse.data.html_url,
              followers: memberInfoResponse.data.followers,
            };
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
    if ($publicClient) {
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
          const processedTokens: Record<string, boolean> = {};

          const balancePromises = contractAddresses.map(
            async (address: TAddress) => {
              if (!processedTokens[address]) {
                processedTokens[address] = true;

                const assetPrice = await fetchAssetPrices(address);

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

                if (decimals && _balance > 0 && assetPrice) {
                  const tokenInfo: TMultiTokenData = {
                    balance: _balance,
                    priceBalance:
                      Math.trunc(
                        Number(formatUnits(balance, decimals)) *
                          Number(formatUnits(assetPrice, 18)) *
                          100
                      ) / 100,
                  };
                  _balances[address] = tokenInfo;
                }
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

  const fetchAssetPrices = async (address: TAddress) => {
    try {
      const response = await axios.post(
        GRAPH_ENDPOINT,
        {
          query: `
            query MyQuery {
              assetHistoryEntities(
                where: { address: "${address}"}
                first: 1
                orderBy: timestamp
                orderDirection: desc
              ) {
                price
                address
              }
            }
          `,
          variables: {
            address: [address],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const assetHistoryEntities = response.data?.data?.assetHistoryEntities;

      if (assetHistoryEntities.length) {
        return assetHistoryEntities[0].price;
      }
    } catch (error) {
      console.error("Error fetching asset prices:", error);
      return "0";
    }
  };

  useEffect(() => {
    fetchMultiSig();
  }, [$assetsPrices]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  return members ? (
    <div className="mt-5 bg-[#3d404b] border border-gray-600 rounded-md min-h-[1030px]">
      <h1 className="me-auto flex text-[#9c9c9c] ps-4 my-auto h-[50px]">
        Team
      </h1>

      <div className="p-2 my-auto border border-gray-600 rounded-md mt-2">
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
                  key={address}
                >
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
              <div className="flex w-full justify-center m-auto">
                <Loader height={50} width={50} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center md:justify-between flex-wrap py-2 px-4">
        {members.map((member) => (
          <a
            href={member.html_url}
            key={member.name}
            target="_blank"
            title="Visit GitHub"
            className="flex flex-col items-center"
          >
            <img
              className="rounded-full h-[142px] border border-[#CCB3F3]"
              src={member.avatar_url}
              alt={`${member.name} avatar`}
              loading="lazy"
            />
            <div className="bg-[#13141F] flex items-center justify-center rounded-md border border-[#CCB3F3] h-[120px] w-[220px] mt-[-20px] relative z-10">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[16px] font-[500]">{member.name}</p>
                {member?.location && (
                  <p className="flex items-center gap-1 text-[14px]">
                    <svg
                      className="w-4 h-4"
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 12 16"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
                      ></path>
                    </svg>
                    {member.location}
                  </p>
                )}
                <p className="text-[14px] px-2 text-center">
                  {member.bio.slice(0, 50)}
                  {member.bio.length > 50 && "..."}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex p-3 shadow-lg rounded-md justify-center min-h-[1062px] m-auto mt-5 bg-[#3d404b] border-gray-600">
      <Loader height={100} width={100} />
    </div>
  );
};

export { Team };
