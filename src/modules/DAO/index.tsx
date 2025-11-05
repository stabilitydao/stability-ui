import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import axios from "axios";

import { ActionButton } from "@ui";

import { formatUnits, isAddress } from "viem";

import { writeContract } from "@wagmi/core";

import { getTokenData, getGasLimit, getTransactionReceipt } from "@utils";

import { connected, account, publicClient, lastTx } from "@store";

import { StabilityDAOABI, wagmiConfig, VestingABI } from "@web3";

import { assets } from "@stabilitydao/stability";

import type { TAddress } from "@types";

import type { Abi } from "viem";

const SNAPSHOT_API = "https://hub.snapshot.org/graphql";

const VESTING_FOUNDATION = "0x8C42C261A3104cEEFBb388CFd6C1f0E7c9F22062";

const DAO = (): JSX.Element => {
  const [userData, setUserData] = useState({
    balance: "0",
    delegatedTo: "0x0000000000000000000000000000000000000000",
    delegatedToYou: "0",
  });

  const [claimable, setClaimable] = useState("0");

  const [value, setValue] = useState<string>("");

  const [button, setButton] = useState<string>("enterAddress");
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);
  const [needConfirm, setNeedConfirm] = useState<boolean>(false);

  const STBL_DAO = assets?.find((asset) => asset?.symbol === "STBL_DAO");

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $publicClient = useStore(publicClient);

  const resetForm = () => {
    setValue("");
    setButton("enterAddress");
    setTransactionInProgress(false);
    setNeedConfirm(false);
  };

  const handleInputChange = (rawValue: string) => {
    if (!$connected) return;
    const cleanedValue = rawValue.replace(/[^0-9a-fA-Fx]/g, "");

    let nextButton = "enterAddress";

    if (isAddress(cleanedValue)) {
      nextButton = "Delegate";
    }

    setValue(cleanedValue);
    setButton(nextButton);
  };

  const delegate = async () => {
    setTransactionInProgress(true);

    if (!$account || !value) return;

    try {
      setNeedConfirm(true);

      const params = [value];

      const gasLimit = await getGasLimit(
        $publicClient,
        STBL_DAO?.addresses?.["146"] as TAddress,
        StabilityDAOABI as Abi,
        "setPowerDelegation",
        params,
        $account as TAddress
      );

      const tx = await writeContract(wagmiConfig, {
        address: STBL_DAO?.addresses?.["146"] as TAddress,
        abi: StabilityDAOABI,
        functionName: "setPowerDelegation",
        args: [value as TAddress],
        gas: gasLimit,
      });

      setNeedConfirm(false);

      const receipt = await getTransactionReceipt(tx);

      let txTokens = {};

      // if (activeAsset?.assetData?.address) {
      //   txTokens = {
      //     [activeAsset?.assetData?.address]: {
      //       amount,
      //       symbol: activeAsset?.assetData?.symbol,
      //       logo: activeAsset?.assetData?.logoURI,
      //     },
      //   };
      // }

      // setLocalStoreHash({
      //   chainId: market?.network?.id as string,
      //   timestamp: new Date().getTime(),
      //   hash: tx,
      //   status: receipt?.status || "reverted",
      //   type: "supply",
      //   vault: market.pool,
      //   tokens: txTokens,
      // });

      if (receipt?.status === "success") {
        lastTx.set(receipt?.transactionHash);
        resetForm();
      }
    } catch (error) {
      setNeedConfirm(false);
      setButton("Delegate");
      // errorHandler(error as Error);
    }

    setTransactionInProgress(false);
  };

  const getVestingData = async () => {
    try {
      const releasable = (await $publicClient?.readContract({
        address: VESTING_FOUNDATION,
        abi: VestingABI,
        functionName: "releasable",
      })) as bigint;

      const formattedReleasable = Number(formatUnits(releasable, 18)).toFixed(
        2
      );

      setClaimable(formattedReleasable);
    } catch (error) {
      console.log(error);
    }
  };

  const getProposals = async () => {
    const spaceId = "stabilitydao.eth";

    const query = `
    query Proposals {
      proposals(
        first: 20,
        skip: 0,
        where: { space_in: ["${spaceId}"] }
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }
  `;

    try {
      const { data } = await axios.post(SNAPSHOT_API, {
        query,
      });
      console.log(data?.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserData = async () => {
    if (!$account) return;

    const address = STBL_DAO?.addresses?.["146"] as TAddress;
    const decimals = getTokenData(address)?.decimals;

    const _balance = (await $publicClient?.readContract({
      address,
      abi: StabilityDAOABI,
      functionName: "balanceOf",
      args: [$account as TAddress],
    })) as bigint;

    const _votes = (await $publicClient?.readContract({
      address,
      abi: StabilityDAOABI,
      functionName: "getVotes",
      args: [$account as TAddress],
    })) as bigint;

    const delegates = (await $publicClient?.readContract({
      address,
      abi: StabilityDAOABI,
      functionName: "delegates",
      args: [$account as TAddress],
    })) as bigint;

    const formattedBalance = Number(
      formatUnits(_balance, decimals ?? 18)
    ).toFixed(2);

    const formattedVotes = Number(formatUnits(_votes, decimals ?? 18)).toFixed(
      2
    );

    const delegatedToYou = String(
      Number(formattedVotes) - Number(formattedBalance)
    );

    setUserData({
      balance: formattedBalance,
      delegatedTo: delegates[0],
      delegatedToYou,
    });
  };

  useEffect(() => {
    getVestingData();
    getProposals();
    getUserData();
  }, [$account, $connected]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <h2 className="page-title__font text-start mb-2 md:mb-5">DAO</h2>
        <h3 className="text-[#97979a] page-description__font">
          Stability Decentralized Autonomous Organization.
        </h3>
      </div>
      <div className="flex flex-col gap-5">
        <span className="text-center">Your power</span>
        <div className="flex flex-col gap-3">
          <span>Own power: {userData.balance} STBL_DAO</span>
          <span>Delegated to: {userData.delegatedTo}</span>
          <span>Delegated to you: {userData.delegatedToYou} STBL_DAO</span>

          <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col min-w-full">
            {/* <div className="flex flex-col gap-2 mb-2 md:mb-0">
        <span className="text-[24px] leading-8 font-semibold">
          Instant Exit
        </span>
        <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
          Instantly exit to STBL, incurring a 50% penalty. This process cannot
          be reverted, all forfeited STBL is streamed back to stakers.
        </span>
      </div> */}
            <div className="flex flex-col justify-between gap-4">
              <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={value}
                    onChange={(e) => handleInputChange(e?.target?.value)}
                    className="bg-transparent text-2xl font-medium outline-none w-full"
                    disabled={!$connected}
                  />
                </div>
              </label>

              <ActionButton
                type={button}
                transactionInProgress={transactionInProgress}
                needConfirm={needConfirm}
                actionFunction={delegate}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <span className="text-center">Governance</span>
        <div className="flex flex-col gap-3">
          <a
            className="bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold max-w-[130px]"
            href="https://snapshot.box/#/s:stabilitydao.eth"
            target="_blank"
          >
            <p className="px-6 py-4">Spanpshot</p>
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-center">Allocators (Coolimg soon)</span>
        <span>
          Inter-chain power distribution for MetaVaults allocations voting.
          Under construction.
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-center">Foundation</span>
        <div className="flex flex-col gap-3">
          <span>Total: 30M STBL</span>
          <span>Claimable: {claimable} STBL</span>
          <span>Invested: 0 STBL</span>
        </div>
      </div>
    </div>
  );
};

export { DAO };
