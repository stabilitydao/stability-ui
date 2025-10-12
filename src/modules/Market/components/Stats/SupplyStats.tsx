// import { useState, useEffect } from "react";

// import { formatUnits } from "viem";

// import { useStore } from "@nanostores/react";

import { getTokenData } from "@utils";

// import { account, connected, currentChainID, lastTx } from "@store";

// import { web3clients, AavePoolABI } from "@web3";

import type { TMarketReserve, TAddress, TMarket } from "@types";

type TProps = {
  network: string;
  market: TMarket;
  asset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
};

const SupplyStats: React.FC<TProps> = ({ network, market, asset, assets }) => {
  const assetData = getTokenData(asset?.address as TAddress);

  //   const client = web3clients[network as keyof typeof web3clients];
  console.log(network, market, assets);
  //   const [stats, setStats] = useState({});

  //   const $connected = useStore(connected);
  //   const $account = useStore(account);
  //   const $currentChainID = useStore(currentChainID);
  //   const $lastTx = useStore(lastTx);

  //   const initData = async () => {
  //     if ($connected && $account) {
  //       try {
  //         const userData = (await client.readContract({
  //           address: market.pool,
  //           abi: AavePoolABI,
  //           functionName: "getUserAccountData",
  //           args: [$account as TAddress],
  //         })) as bigint;

  //         //      userAccountData: {
  //         //   totalCollateralBase: userAccountData?.[0],
  //         //   totalDebtBase: userAccountData?.[1],
  //         //   availableBorrowsBase: userAccountData?.[2],
  //         //   currentLiquidationThreshold: userAccountData?.[3],
  //         //   ltv: userAccountData?.[4],
  //         //   healthFactor: userAccountData?.[5],
  //         // },
  //         console.log(userData);
  //         console.log(formatUnits(userData[5], 18));
  //       } catch (error) {
  //         console.error("Get stats error:", error);
  //       }
  //     }
  //   };

  //   useEffect(() => {
  //     initData();
  //   }, [$account, $connected, $lastTx, $currentChainID]);

  return (
    <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col gap-2 md:gap-6 w-full lg:w-2/3 font-medium">
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Deposited
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">0</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>100 {assetData?.symbol}</span>
          </div>
          <span className="text-[#7C7E81] text-[14px] leading-5">$32.84</span>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Supply APR
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>4.7%</span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 md:gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">LTV</span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">0</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>100 {assetData?.symbol}</span>
          </div>
          <span className="text-[#7C7E81] text-[14px] leading-5">$32.84</span>
        </div>
        <div className="flex flex-col items-start w-full md:w-1/2">
          <span className="text-[#7C7E81] text-[16px] leading-6">
            Health Factor
          </span>
          <div className="flex items-center gap-2 text-[24px] leading-8">
            <span className="text-[#7C7E81]">4.2%</span>
            <img
              src="/icons/arrow-right.png"
              alt="arrow right"
              className="w-4 h-4"
            />
            <span>4.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SupplyStats };
