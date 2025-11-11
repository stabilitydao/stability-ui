import { useState } from "react";

import { ActionButton, Indicator, Skeleton } from "@ui";

import { isAddress } from "viem";

import {
  getGasLimit,
  getTransactionReceipt,
  getShortAddress,
  addAssetToWallet,
  getTokenData,
} from "@utils";

import { useStore } from "@nanostores/react";

import { useWalletClient } from "wagmi";

import { writeContract } from "@wagmi/core";

import { useUserData } from "../hooks";

import { connected, account, lastTx, publicClient } from "@store";

import { StabilityDAOABI, wagmiConfig } from "@web3";

import { STBL_DAO } from "../constants";

import type { TAddress } from "@types";

import type { Abi } from "viem";

const DelegateForm: React.FC = () => {
  const client = useWalletClient();

  const stblDaoData = getTokenData(STBL_DAO);

  const $connected = useStore(connected);
  const $account = useStore(account);
  const $publicClient = useStore(publicClient);

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

      if (receipt?.status === "success") {
        lastTx.set(receipt?.transactionHash);
        resetForm();
      }
    } catch (error) {
      setNeedConfirm(false);
      setButton("Delegate");
      console.log("Error:", error);
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="bg-[#101012] border border-[#23252A] p-4 md:p-6 rounded-lg flex justify-between flex-col min-w-full gap-6">
      <div className="flex flex-col gap-2 mb-2 md:mb-0">
        <span className="text-[24px] leading-8 font-semibold">Your power</span>
        <div className="flex items-end gap-2">
          {isUserDataLoading ? (
            <Skeleton width={140} height={48} />
          ) : (
            <Indicator
              title="Own power"
              value={`${userData.balance} STBL_DAO`}
            />
          )}

          {!!Number(userData.balance) && (
            <button
              onClick={() =>
                addAssetToWallet(
                  client,
                  STBL_DAO,
                  stblDaoData?.decimals ?? 18,
                  stblDaoData?.symbol ?? "",
                  stblDaoData?.logoURI
                )
              }
              className="text-[16px] bg-[#5E6AD2] font-semibold justify-center rounded-md"
            >
              <img
                src="/metamask.svg"
                alt="MetaMask"
                title="Add to MetaMask"
                className="p-2"
              />
            </button>
          )}
        </div>

        {isUserDataLoading ? (
          <Skeleton width={140} height={48} />
        ) : (
          <Indicator
            title="Delegated to"
            value={
              userData.delegatedTo === "Self"
                ? userData.delegatedTo
                : getShortAddress(userData.delegatedTo, 6, 4)
            }
          />
        )}

        {isUserDataLoading ? (
          <Skeleton width={140} height={48} />
        ) : (
          <Indicator
            title="Delegated to you"
            value={`${userData.delegatedToYou} STBL_DAO`}
          />
        )}
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
  );
};

export { DelegateForm };
