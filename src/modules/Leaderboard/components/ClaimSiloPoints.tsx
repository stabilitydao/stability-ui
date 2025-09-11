import { useState, useEffect } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { parseUnits } from "viem";

import { readContract, writeContract } from "@wagmi/core";

import { getTransactionReceipt } from "@utils";

import { account } from "@store";

import { wagmiConfig, IMerkleDistributor, merkleDistributor } from "@web3";

import type { TAddress } from "@types";

const SILO_CONTESTS_IDs = ["silo_season_1"];

interface UserRewards {
  address: TAddress;
  sonicRewards: string;
  proofs: string[];
  claimed: boolean;
}

const ClaimSiloPoints = (): JSX.Element => {
  const $account = useStore(account);

  const [userData, setUserData] = useState<UserRewards>({
    address: "0x0",
    sonicRewards: "0",
    proofs: [],
    claimed: true,
  });

  const getUserData = async () => {
    try {
      const req = await axios.get(
        `https://api.stability.farm/rewards/silo-merkl-tree/${$account}`
      );

      const res = req.data;

      if (res?.proof?.length) {
        const claimed = (await readContract(wagmiConfig, {
          address: merkleDistributor as TAddress,
          abi: IMerkleDistributor,
          functionName: "claimed",
          args: [$account as TAddress, SILO_CONTESTS_IDs],
        })) as boolean[];

        const data = {
          ...res.data,
          proofs: res.proof,
          claimed: claimed[0],
        };

        setUserData(data);
      }
    } catch (err) {
      console.error("Error occurred at getUserData:", err);
    }
  };

  const claim = async () => {
    if (!$account) {
      alert("Please connect your wallet!");
    }

    try {
      const claim = await writeContract(wagmiConfig, {
        address: merkleDistributor as TAddress,
        abi: IMerkleDistributor,
        functionName: "claim",
        args: [
          SILO_CONTESTS_IDs,
          [String(parseUnits(userData.sonicRewards, 18))],
          [userData.proofs],
          $account as TAddress,
        ],
      });

      const transaction = await getTransactionReceipt(claim);

      if (transaction?.status === "success") {
        setUserData({ ...userData, claimed: true });
      }
    } catch (err) {
      console.error("Error occurred at claim:", err);
    }
  };
  useEffect(() => {
    if ($account) {
      getUserData();
    }
  }, [$account]);

  return (
    <>
      {!userData.claimed && (
        <button
          className="text-[16px] leading-5 font-semibold py-4 px-6 bg-[#5E6AD2] rounded-lg self-start"
          onClick={claim}
        >
          Claim wS of Silo Points
        </button>
      )}
    </>
  );
};

export { ClaimSiloPoints };
