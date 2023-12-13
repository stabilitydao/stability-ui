import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { DividendMinterABI } from "@web3";
import { account, publicClient, platformData } from "@store";
import { formatUnits } from "viem";
import { getStrategyInfo, getTokenData } from "@utils";

function Pool() {
  const [poolData, setPoolData] = useState("");
  const $account = useStore(account);
  const $publicClient = useStore(publicClient);

  const fetchPoolData = async () => {
    if ($publicClient && $account) {
      try {
        const stakedAmmount = (await $publicClient.readContract({
          address:
            "0x29353bB4c9010c6112a77d702Ac890e70CD73d53" as `0x${string}`,
          abi: DividendMinterABI,
          functionName: "userInfo",
          args: [$account],
        })) as bigint[];

        const totalProfitStaked = formatUnits(stakedAmmount[0], 18);
        setPoolData(totalProfitStaked);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  };

  useEffect(() => {
    fetchPoolData();
  }, []);

  return <>{poolData}</>;
}

export default Pool;
