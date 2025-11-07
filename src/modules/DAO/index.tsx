import { useState } from "react";

import { useStore } from "@nanostores/react";

import { ActionButton, Indicator } from "@ui";

import { isAddress } from "viem";

import { writeContract } from "@wagmi/core";

import {
  getGasLimit,
  getTransactionReceipt,
  getShortAddress,
  formatNumber,
} from "@utils";

import { useVestingData, useProposals, useUserData } from "./hooks";

import { connected, account, publicClient, lastTx } from "@store";

import { StabilityDAOABI, wagmiConfig } from "@web3";

import { STBL_DAO } from "./constants";

import type { TAddress } from "@types";

import type { Abi } from "viem";

const DAO = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $publicClient = useStore(publicClient);

  const { data: proposals, isLoading: isProposalsLoading } = useProposals();
  const { data: claimable, isLoading: isClaimableLoading } =
    useVestingData("146");
  const { data: userData, isLoading: isUserDataLoading } = useUserData("146");

  const [value, setValue] = useState<string>("");

  const [button, setButton] = useState<string>("enterAddress");
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);
  const [needConfirm, setNeedConfirm] = useState<boolean>(false);

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
        STBL_DAO as TAddress,
        StabilityDAOABI as Abi,
        "setPowerDelegation",
        params,
        $account as TAddress
      );

      const tx = await writeContract(wagmiConfig, {
        address: STBL_DAO as TAddress,
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

  return (
    <div className="flex flex-col gap-6 w-full pb-[100px]">
      <div>
        <h2 className="page-title__font text-start mb-2 md:mb-5">DAO</h2>
        <h3 className="text-[#97979a] page-description__font">
          Stability Decentralized Autonomous Organization.
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col min-w-full gap-6">
          <div className="flex flex-col gap-2 mb-2 md:mb-0">
            <span className="text-[24px] leading-8 font-semibold">
              Your power
            </span>
            <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
              Own power: {userData.balance} STBL_DAO
            </span>
            <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
              Delegated to:{" "}
              {userData.delegatedTo === "Self"
                ? userData.delegatedTo
                : getShortAddress(userData.delegatedTo, 6, 4)}
            </span>
            <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
              Delegated to you: {userData.delegatedToYou} STBL_DAO
            </span>
          </div>
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
      <div className="flex flex-col gap-6">
        <h2 className="text-center text-[26px] font-bold">Governance</h2>
        <div className="flex flex-col gap-3">
          <a
            className="bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold max-w-[130px]"
            href="https://snapshot.box/#/s:stabilitydao.eth"
            target="_blank"
          >
            <p className="px-6 py-4">Snapshot</p>
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-center text-[26px] font-bold">
          Allocators (Coolimg soon)
        </h2>
        <span className="text-[#97979a] text-[14px] leading-5">
          Inter-chain power distribution for MetaVaults allocations voting.
          Under construction.
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-center text-[26px] font-bold">Foundation</h2>
        <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between min-w-full gap-3">
          <Indicator title="Total" value="30M STBL" />

          <Indicator
            title="Claimable"
            value={`${formatNumber(claimable, "format")} STBL`}
          />

          <Indicator title="Invested" value="0 STBL" />
        </div>
      </div>
    </div>
  );
};

export { DAO };
