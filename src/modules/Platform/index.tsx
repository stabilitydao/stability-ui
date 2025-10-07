import {useEffect, useState} from "react";

import {useStore} from "@nanostores/react";

import {PlatformUpgrade} from "./components/PlatformUpgrade";

import {
  AgentId,
  type ApiMainReply,
  assets,
  ChainStatus,
  chainStatusInfo,
  getAgent,
  getChainsTotals,
  getStrategiesTotals,
  integrations,
  seeds,
} from "@stabilitydao/stability";

import {formatNumber} from "@utils";

import {CountersBlockCompact, Skeleton} from "@ui";

import {apiData, currentChainID, platformVersions} from "@store";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

import packageJson from "../../../package.json";
import {NodeState} from "@stabilitydao/stability/out/api.types";
import {IBuilderAgent} from "@stabilitydao/stability/out/agents";

const Platform = (): JSX.Element => {
  const $currentChainID = useStore(currentChainID);
  const $platformVersions = useStore(platformVersions);
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  const chainsTotals = getChainsTotals();
  const strategiesTotals = getStrategiesTotals();

  const [platformData, setPlatformData] = useState([
    {
      name: "AUM",
      content: "",
    },
    {
      name: "Users earned",
      content: "",
    },
    { name: "Vaults", content: "" },
  ]);

  let protocolsTotal = 0;
  for (const defiOrgCode of Object.keys(integrations)) {
    protocolsTotal += Object.keys(integrations[defiOrgCode].protocols).length;
  }

  const strategiesInfo = [
    { name: "Live", value: strategiesTotals.LIVE.toString(), color: "#4FAE2D" },
    {
      name: "Awaiting deployment",
      value: strategiesTotals.DEPLOYMENT.toString(),
      color: "#612FFB",
    },
    {
      name: "Development",
      value: strategiesTotals.DEVELOPMENT.toString(),
      color: "#2D67FB",
    },
    {
      name: "Awaiting developer",
      value: strategiesTotals.AWAITING.toString(),
      color: "#E1E114",
    },
    {
      name: "Blocked",
      value: strategiesTotals.BLOCKED.toString(),
      color: "#E01A1A",
    },
    {
      name: "Proposal",
      value: strategiesTotals.PROPOSAL.toString(),
      color: "#FB8B13",
    },
  ];

  const chainsInfo = Object.keys(chainStatusInfo).map((status) => ({
    color: chainStatusInfo[status as ChainStatus].color,
    name: chainStatusInfo[status as ChainStatus].title,
    value: chainsTotals[status as ChainStatus].toString(),
  }));

  const integrationInfo = [
    {
      name: "Organizations",
      value: Object.keys(integrations).length.toString(),
      color: "#612FFB",
    },
    { name: "Protocols", value: protocolsTotal.toString(), color: "#05B5E1" },
  ];

  const assetsInfo = [
    { name: "Assets", value: assets.length.toString(), color: "#E1E114" },
    {
      name: "Tokenlist items",
      value: tokenlist.tokens.length.toString(),
      color: "#2D67FB",
    },
  ];

  const networksInfo = [
    {
      name: "Nodes online",
      value: Object.keys($apiData?.network.nodes || [])
        .filter((machingId) => {
          const nodeState = $apiData?.network.nodes[machingId] as unknown as
            | NodeState
            | undefined;
          return !!(
            nodeState?.lastSeen &&
            new Date().getTime() / 1000 - nodeState.lastSeen < 180
          );
        })
        .length.toString(),
      color: "#2D67FB",
    },
    { name: "Seed nodes", value: seeds.length.toString(), color: "#4FAE2D" },
  ];

  const factoryInfo = [
    {
      name: "Available for building",
      value: $apiData?.total.vaultForBuilding.toString() || "-",
      color: "#2D67FB",
    },
    {
      name: "Farms",
      value: $apiData?.total.farms.toString() || "-",
      color: "#4FAE2D",
    },
  ];

  //todo: get value from backend
  const swapperInfo = [
    {
      name: "Pools",
      value: "50",
      color: "#2D67FB",
    },
    {
      name: "Blue Chip Pools",
      value: "4",
      color: "#4FAE2D",
    },
  ];

  useEffect(() => {
    if (
      $apiData?.total?.tvl &&
      $apiData?.total.usersEarned &&
      $apiData?.total.activeVaults
    ) {
      setPlatformData([
        {
          name: "AUM",
          content: `\$${formatNumber($apiData?.total.tvl || 0, "withSpaces")}`,
        },
        {
          name: "Users earned",
          content: `\$${formatNumber($apiData?.total.usersEarned.toFixed(0) || 0, "withSpaces")}`,
        },
        { name: "Vaults", content: String($apiData?.total.activeVaults) },
      ]);
    }
  }, [$apiData]);

  const isAlert = $apiData?.network.status == "Alert";
  const isOk = $apiData?.network.status == "OK";

  const builderAgent: IBuilderAgent = getAgent('BUILDER' as AgentId)

  return (
    <div className="flex flex-col max-w-[1200px] w-full gap-[36px]">
      <h2>Summary</h2>

      <div className="flex w-full gap-[20px]">
        <div className="flex flex-col lg:w-1/2 bg-accent-900 p-[10px] min-h-[200px]">
          <div>Asset management</div>
          <div>
            <div>Vaults: {$apiData?.total.activeVaults}, {formatNumber($apiData?.total.tvl || 0, "abbreviate")}</div>
            <div>MetaVaults: {'6'}</div>
            <div>Lending markets: {'5'}</div>
          </div>
        </div>
        <div className="flex flex-col lg:w-1/2 bg-accent-900 p-[10px] min-h-[200px]">
          <div>Tokenomics</div>
          <div>
            <div>$STBL</div>
            <div>Staked xSTBL</div>
          </div>
        </div>
      </div>

      <h2>Agents</h2>

      <div className="flex w-full flex-wrap">
        <div className="flex flex-col lg:w-1/2  p-[10px]">
          <div className="flex flex-col bg-accent-900 min-h-[400px]">
            <div>Stability Operator</div>
            <div>

              <div className="flex flex-col w-full">
                <div className="flex text-[14px] h-[30px] items-center">
                  <span className="bg-gray-700 px-[10px]">Platform status</span>
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
            {$apiData?.network.status}
          </span>
                </div>

                {/*{isAlert && (
          <div className="flex flex-col gap-3">
            {Object.entries(
              $apiData?.network.healthCheckReview?.alerts || {}
            ).map(([key, value], index) => (
              <div
                key={index}
                className="p-3 bg-[#111114] border border-[#232429] rounded-lg"
              >
                <p className="font-semibold">{key}</p>

                {typeof value === "object" && value !== null ? (
                  <div className="ml-3">
                    <pre className="bg-gray-800 text-green-400 p-2 rounded-lg">
                      <code>{JSON.stringify(value, null, 2)}</code>
                    </pre>
                  </div>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        )}*/}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:w-1/2 p-[10px]">
          <div className="flex flex-col bg-accent-900 min-h-[400px]">
            <div>Stability Builder</div>
            <div>
              {builderAgent.repo.map(repo => (
                <div>{repo}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:w-1/2 p-[10px]">
          <div className="flex bg-accent-900 min-h-[200px]">
            <div>Yield Tracker</div>

          </div>
        </div>
      </div>

      <h2>Knowledge</h2>

      <div className="flex flex-wrap gap-[30px]">

        <a
          className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[32px] inline-flex w-[200px] justify-center"
          href="/chains"
          title="View all blockchains"
        >
          Chains
        </a>

        <a
          className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[32px] inline-flex w-[200px] justify-center"
          href="/integrations"
          title="View all organizations and protocols"
        >
          Protocols
        </a>

        <a
          className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[32px] inline-flex w-[200px] justify-center"
          href="/assets"
          title="View all assets"
        >
          Assets
        </a>

        <a
          className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[32px] inline-flex w-[200px] justify-center"
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

      <PlatformUpgrade />

      <h2>Administrate</h2>

      <div className="flex flex-wrap">
        <CountersBlockCompact
          title="Network"
          link="/network"
          linkTitle="View Stability Network"
          counters={networksInfo}
        />
        <CountersBlockCompact
          title="Swapper"
          link="/swapper"
          linkTitle="Go to Swapper"
          counters={swapperInfo}
        />

        <CountersBlockCompact
          title="Factory"
          link="/factory"
          linkTitle="Go to Factory"
          counters={factoryInfo}
        />
      </div>

    </div>
  );
};

export { Platform };
