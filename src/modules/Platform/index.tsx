import { useStore } from "@nanostores/react";

import { Indicator } from "@ui";

import {
  StabilityBuilder,
  StabilityOperator,
  PlatformUpgrade,
} from "./components";

import { cn, formatNumber } from "@utils";

import { apiData, marketPrices } from "@store";

import {
  // AgentRole,
  type ApiMainReply,
  // seeds,
  // IAgent,
} from "@stabilitydao/stability";

// import { NodeState } from "@stabilitydao/stability/out/api.types";

const Platform = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  const $marketPrices = useStore(marketPrices);

  // const operatorAgents: IOperatorAgent = getAgents(
  //   "OPERATOR" as AgentRole
  // ) as IAgent[];

  // const builderAgents: IBuilderAgent = getAgents(
  //   "BUILDER" as AgentRole
  // ) as IAgent[];

  // const operatorAgent = operatorAgents[0];
  // const builderAgent = builderAgents[0];

  // const isAlert = $apiData?.network?.status == "Alert";
  // const isOk = $apiData?.network?.status == "OK";

  const stblPrice = $marketPrices?.STBL;

  const totalLendingMarkets = Object.values($apiData?.markets ?? {}).reduce(
    (acc, cur) => (acc += Object.values(cur).length),
    0
  );

  // const lastMonthBurnRate =
  //   builderAgent?.burnRate?.[builderAgent?.burnRate?.length - 1];

  return (
    <div className="flex flex-col max-w-[1200px] w-full gap-[24px] pb-[100px]">
      <PlatformUpgrade />

      <h2 className="text-[26px] font-bold">🏛️ DAO</h2>

      <div className="flex gap-[24px] flex-wrap lg:flex-nowrap mb-3">
        <div className="flex w-full lg:w-1/2 items-center p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between">
          <span className="flex items-center mr-[40px] mt-[7px]">
            <img
              src="/features/stbl.png"
              alt="STBL"
              className="w-[24px] h-[24px] mr-[4px]"
            />
            <span className="font-bold mt-[0px] text-[18px]">STBL</span>
          </span>
          <div className="flex justify-end">
            <Indicator
              title="🚀 Price"
              value={stblPrice ? stblPrice?.price : ""}
              subValue={
                stblPrice ? (
                  <span
                    className={cn(
                      "text-[16px]",
                      stblPrice?.priceChange >= 0
                        ? "text-[#48C05C]"
                        : "text-[#DE4343]"
                    )}
                  >
                    {stblPrice?.priceChange > 0 ? "+" : ""}
                    {stblPrice?.priceChange}%
                  </span>
                ) : (
                  ""
                )
              }
            />

            <Indicator
              title="FDV"
              value={
                stblPrice
                  ? formatNumber(+stblPrice?.price * 100000000, "abbreviate")
                  : ""
              }
              subValue={
                stblPrice ? (
                  <span
                    className={cn(
                      "text-[16px]",
                      stblPrice?.priceChange >= 0
                        ? "text-[#48C05C]"
                        : "text-[#DE4343]"
                    )}
                  >
                    {stblPrice?.priceChange > 0 ? "+" : ""}
                    {formatNumber(
                      (stblPrice?.priceChange * +stblPrice?.price * 100000000) /
                        100,
                      "abbreviate"
                    )}
                  </span>
                ) : (
                  ""
                )
              }
            />
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 items-center p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between">
          <span className="font-bold mt-[6px] text-[18px]">Staked</span>

          <div className="flex justify-end">
            <Indicator
              title="Total"
              value={
                $apiData?.total?.xSTBLStaked
                  ? `${formatNumber(+$apiData?.total?.xSTBLStaked, "abbreviateNotUsd")}`
                  : " "
              }
              subValue={
                $apiData?.total?.xSTBLStaked
                  ? formatNumber(
                      +$apiData?.total?.xSTBLStaked * +stblPrice?.price,
                      "abbreviate"
                    )
                  : " "
              }
            />
            <Indicator
              title="Pending APR"
              value={
                $apiData?.total?.xSTBLPendingRevenue
                  ? `${formatNumber($apiData?.total?.xSTBLPendingAPR, "formatAPR")}%`
                  : " "
              }
              subValue={
                $apiData?.total?.xSTBLPendingRevenue
                  ? formatNumber(
                      $apiData?.total?.xSTBLPendingRevenue * +stblPrice?.price,
                      "abbreviate"
                    )
                  : " "
              }
            />
          </div>
        </div>
      </div>

      <h2 className="text-[26px] font-bold">💰 Protocols</h2>

      <div className="flex gap-[24px] flex-wrap lg:flex-nowrap mb-5">
        <div className="flex w-full flex-wrap lg:w-1/2 items-center p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between">
          <div className="flex font-bold">🧑‍🌾 Yield aggregator</div>
          <div className="flex justify-end">
            <Indicator
              title="TVL"
              value={
                $apiData?.total?.tvl
                  ? formatNumber($apiData?.total?.tvl, "abbreviate")
                  : " "
              }
              subValue={
                $apiData?.total?.activeVaults
                  ? `${$apiData?.total?.activeVaults} vaults`
                  : " "
              }
            />
          </div>
        </div>
        <div className="flex w-full lg:w-1/2 items-center p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between">
          <div className="flex font-bold">🏦 Lending</div>
          <div className="flex justify-end">
            <Indicator
              title="TVL"
              value={
                $apiData?.total?.marketTvl
                  ? formatNumber($apiData?.total?.marketTvl, "abbreviate")
                  : " "
              }
              subValue={
                $apiData?.markets ? `${totalLendingMarkets} markets` : " "
              }
            />
          </div>
        </div>
      </div>
      {/* 
      <h2 className="text-[26px] font-bold">🤖 Agents</h2>

      <div className="flex gap-[24px] flex-wrap lg:flex-nowrap mb-5">
        <a
          title="Go to Operator's page"
          href="/operator"
          className="cursor-pointer flex w-full flex-wrap lg:w-1/2 gap-[10px] items-start p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between"
        >
          <div className="font-bold flex items-center">
            <img
              className="w-[32px] h-[32px] mr-[10px]"
              src={`https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/${operatorAgent?.image}`}
              alt={builderAgent?.name}
            />
            Stability Operator
          </div>
          <div className="flex w-full">
            <Indicator
              title="Status"
              value={
                <span className="font-bold text-[18px]">
                  <span
                    className="font-bold px-[10px]"
                    style={{
                      backgroundColor: isAlert
                        ? "#ff8d00"
                        : isOk
                          ? "#1f851f"
                          : "#444444",
                    }}
                  >
                    {$apiData?.network?.status}
                  </span>
                </span>
              }
              subValue={`${
                Object.keys($apiData?.network?.healthCheckReview?.alerts || [])
                  ?.length
              } alerts`}
            />

            <Indicator
              title="Machines"
              value={Object.keys($apiData?.network?.nodes || [])
                .filter((machingId) => {
                  const nodeState = $apiData?.network?.nodes[
                    machingId
                  ] as unknown as NodeState | undefined;
                  return !!(
                    nodeState?.lastSeen &&
                    new Date().getTime() / 1000 - nodeState?.lastSeen < 180
                  );
                })
                ?.length.toString()}
              subValue={`${seeds?.length} seeds`}
            />
          </div>
        </a>
        <a
          title="Go to Builder's page"
          href="/builder"
          className="cursor-pointer flex w-full flex-wrap lg:w-1/2 gap-[10px] items-start p-[20px] text-white bg-[#18191C] border border-[#232429] rounded-xl justify-between"
        >
          <div className="font-bold flex items-center">
            <img
              className="w-[32px] h-[32px] mr-[10px]"
              src={`https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/${builderAgent?.image}`}
              alt={builderAgent?.name}
            />
            Stability Builder
          </div>
          <div className="flex w-full">
            <Indicator
              title="🍞 Burn rate"
              value={formatNumber(lastMonthBurnRate?.usdAmount, "abbreviate")}
              subValue={lastMonthBurnRate?.period}
            />
            <Indicator
              title="Repositories"
              value={builderAgent?.repo?.length}
              subValue={`🚧 issues`}
            />
            <Indicator
              title="Pools"
              value={builderAgent?.pools?.length}
              subValue={"🚧 tasks"}
            />
            <Indicator
              title="Conveyors"
              value={builderAgent?.conveyors?.length}
              subValue={"🚧 tasks"}
            />
          </div>
        </a>
      </div> */}

      <h2 className="text-[26px] font-bold">📦 Library</h2>

      <div className="flex flex-wrap gap-[30px] mb-5">
        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/chains"
          title="View all blockchains"
        >
          Chains
        </a>

        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/integrations"
          title="View all organizations and protocols"
        >
          Integrations
        </a>

        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/assets"
          title="View all assets"
        >
          Assets
        </a>

        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/strategies"
          title="View all strategies"
        >
          Strategies
        </a>
      </div>

      <div className="px-6 hidden">
        <div className="flex p-[16px] gap-[8px] bg-accent-950 rounded-[10px] w-full">
          <svg
            className="mt-[2px]"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V13M12 17H12.01M21.7299 18L13.7299 3.99998C13.5555 3.69218 13.3025 3.43617 12.9969 3.25805C12.6912 3.07993 12.3437 2.98608 11.9899 2.98608C11.6361 2.98608 11.2887 3.07993 10.983 3.25805C10.6773 3.43617 10.4244 3.69218 10.2499 3.99998L2.24993 18C2.07361 18.3053 1.98116 18.6519 1.98194 19.0045C1.98272 19.3571 2.07671 19.7032 2.25438 20.0078C2.43204 20.3124 2.68708 20.5646 2.99362 20.7388C3.30017 20.9131 3.64734 21.0032 3.99993 21H19.9999C20.3508 20.9996 20.6955 20.9069 20.9992 20.7313C21.303 20.5556 21.5551 20.3031 21.7304 19.9991C21.9057 19.6951 21.998 19.3504 21.9979 18.9995C21.9978 18.6486 21.9054 18.3039 21.7299 18Z"
              stroke="#FB8B13"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-[16px] font-semibold leading-6">
            This is an early Alpha version of the Stability platform, a minimum
            viable product.
            <br />
            Only the critical scope of vault contracts has been audited.
            <br />
            Beta version coming in 2025.
          </div>
        </div>
      </div>

      <h2 className="text-[26px] font-bold">🛠️ Service tools</h2>

      <div className="flex flex-wrap gap-[30px] mb-5">
        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/swapper"
          title="Go to Swapper"
        >
          Swapper
        </a>

        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/factory/farms"
          title="Go to Farms"
        >
          Farms
        </a>
        <a
          className="font-bold px-4 h-10 text-center rounded-lg flex items-center justify-center bg-[#232429] border border-[#2C2E33]"
          href="/metavaults-management"
          title="Go to MetaVaults Management"
        >
          MetaVaults Management
        </a>
      </div>
    </div>
  );
};

export { Platform, StabilityBuilder, StabilityOperator };
