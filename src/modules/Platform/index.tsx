import { useStore } from "@nanostores/react";

import {
  type ApiMainReply,
  assets, ChainStatus, chainStatusInfo, getChainsTotals, getStrategiesTotals,
  integrations, seeds,
  strategies,
  StrategyShortId,
  StrategyState,
} from "@stabilitydao/stability";
import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

import { apiData, currentChainID, platformVersions } from "@store";

import packageJson from "../../../package.json";
import {CountersBlock} from "../../ui/CountersBlock.tsx";

function numberWithSpaces(x: number|string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const Platform = (): JSX.Element => {
  const $currentChainID = useStore(currentChainID);
  const $platformVersions = useStore(platformVersions);
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  const chainsTotals = getChainsTotals();
  const strategiesTotals = getStrategiesTotals()

  const strategyStatus = {
    live: 0,
    dev: 0,
    awaiting: 0,
    proposed: 0,
  };
  // @ts-ignore
  Object.keys(strategies).forEach((shortId: StrategyShortId) => {
    const status = strategies[shortId].state;
    if (status === StrategyState.LIVE) {
      strategyStatus.live++;
    }
    if (status === StrategyState.DEVELOPMENT) {
      strategyStatus.dev++;
    }
    if (status === StrategyState.AWAITING) {
      strategyStatus.awaiting++;
    }
    if (
      status === StrategyState.POSSIBLE ||
      status === StrategyState.PROPOSAL
    ) {
      strategyStatus.proposed++;
    }
  });

  // const capitalize = (s: string) => (s && s[0].toUpperCase() + s.slice(1)) || ""

  let protocolsTotal = 0;
  for (const defiOrgCode of Object.keys(integrations)) {
    protocolsTotal += Object.keys(integrations[defiOrgCode].protocols).length;
  }

  return (
    <div className="flex flex-col min-[1440px]:min-w-[1338px] gap-[36px]">
      <h1 className="mb-0 text-[40px] font-bold">Platform</h1>

      <div className="flex p-[16px] gap-[8px] bg-[#441B06] rounded-[24px]">
        <svg className="mt-[2px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 9V13M12 17H12.01M21.7299 18L13.7299 3.99998C13.5555 3.69218 13.3025 3.43617 12.9969 3.25805C12.6912 3.07993 12.3437 2.98608 11.9899 2.98608C11.6361 2.98608 11.2887 3.07993 10.983 3.25805C10.6773 3.43617 10.4244 3.69218 10.2499 3.99998L2.24993 18C2.07361 18.3053 1.98116 18.6519 1.98194 19.0045C1.98272 19.3571 2.07671 19.7032 2.25438 20.0078C2.43204 20.3124 2.68708 20.5646 2.99362 20.7388C3.30017 20.9131 3.64734 21.0032 3.99993 21H19.9999C20.3508 20.9996 20.6955 20.9069 20.9992 20.7313C21.303 20.5556 21.5551 20.3031 21.7304 19.9991C21.9057 19.6951 21.998 19.3504 21.9979 18.9995C21.9978 18.6486 21.9054 18.3039 21.7299 18Z"
            stroke="#FB8B13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex text-[18px] font-semibold" style={{lineHeight: '24px'}}>
          This is an early Alpha version of the Stability platform, a minimum viable product.
          <br/>
          Only the critical scope of vault contracts has been audited.
          <br/>
          Beta version coming in 2025.
        </div>
      </div>

      <div className="flex flex-wrap p-[36px] ">
        {[
          ['AUM', `\$${numberWithSpaces($apiData?.total.tvl || 0)}`,],
          ['Users earned', `\$${numberWithSpaces($apiData?.total.usersEarned.toFixed(0) || 0)}`,],
          ['Vaults', $apiData?.total.activeVaults,],
        ].map(t => (
          <div
            key={t[0]}
            className="flex w-full sm:w-6/12 md:w-4/12 lg:w-3/12 min-[1440px]:w-4/12 h-[120px] px-[12px] rounded-full text-gray-200 items-center justify-center flex-col">
            <div className="text-[36px]">{t[1]}</div>
            <div className="flex self-center justify-center text-[16px]">{t[0]}</div>
          </div>
        ))}
      </div>

      <CountersBlock
        title="Strategies"
        link="/strategies"
        linkTitle="Go to strategies"
        counters={[
          ['Live', strategiesTotals.LIVE, '#4FAE2D',],
          ['Awaiting deployment', strategiesTotals.DEPLOYMENT, '#612FFB',],
          ['Development', strategiesTotals.DEVELOPMENT, '#2D67FB',],
          ['Awaiting developer', strategiesTotals.AWAITING, '#E1E114',],
          ['Blocked', strategiesTotals.BLOCKED, '#E01A1A',],
          ['Proposal', strategiesTotals.PROPOSAL, '#FB8B13',],
        ].map(t => {
          return {
            color: t[2].toString(),
            name: t[0].toString(),
            value: t[1].toString(),
          }
        })}
      />

      <CountersBlock
        title="Chains"
        link="/chains"
        linkTitle="View all blockchains"
        counters={Object.keys(chainStatusInfo).map(status => {
          return {
            color: chainStatusInfo[status as ChainStatus].color,
            name: chainStatusInfo[status as ChainStatus].title,
            value: chainsTotals[status as ChainStatus].toString(),
          }
        })}
      />

      <CountersBlock
        title="Integrations"
        link="/integrations"
        linkTitle="View all organizations and protocols"
        counters={[
          ['Organizations', Object.keys(integrations).length, '#612FFB',],
          ['Protocols', protocolsTotal, '#05B5E1',],
        ].map(t => {
          return {
            color: t[2].toString(),
            name: t[0].toString(),
            value: t[1].toString(),
          }
        })}
      />

      <CountersBlock
        title="Assets"
        link="/assets"
        linkTitle="View all assets"
        counters={[
          ['Assets', assets.length, '#E1E114',],
          ['Tokenlist items', tokenlist.tokens.length, '#2D67FB',],
        ].map(t => {
          return {
            color: t[2].toString(),
            name: t[0].toString(),
            value: t[1].toString(),
          }
        })}
      />

      <CountersBlock
        title="Network"
        link="/network"
        linkTitle="View Stability Network"
        counters={[
          ['Nodes', Object.keys($apiData?.network.nodes || []).length, '#2D67FB',],
          ['Seed nodes', seeds.length, '#4FAE2D',],
        ].map(t => {
          return {
            color: t[2].toString(),
            name: t[0].toString(),
            value: t[1].toString(),
          }
        })}
      />

      <CountersBlock
        title="Factory"
        link="/create-vault"
        linkTitle="Gp to Factory"
        counters={[
          ['Available for building', $apiData?.total.vaultForBuilding || '-', '#2D67FB',],
          ['Farms', $apiData?.total.farms || '-', '#4FAE2D',],
        ].map(t => {
          return {
            color: t[2].toString(),
            name: t[0].toString(),
            value: t[1].toString(),
          }
        })}
      />

      <h2 className="text-[32px] font-bold text-center mb-0">Software</h2>
      <div className="mb-10 flex items-center gap-2">
        <div className="flex flex-col w-full">
          <a
            className="hover:bg-[#141033] px-3 py-3 rounded-xl flex items-center"
            href="https://github.com/stabilitydao/stability-contracts"
            target="_blank"
            title="Go to smart contracts source code on Github"
          >
            <GitHub/>
            <span className="ml-1">
              💎 Stability Platform {$platformVersions[$currentChainID]}
            </span>
          </a>

          <a
            className="hover:bg-[#141033] px-3 py-3 rounded-xl flex items-center"
            href="https://github.com/stabilitydao/stability"
            target="_blank"
            title="Go to library source code on Github"
          >
            <GitHub/>
            <span className="ml-1">
              📦 Stability Integration Library{" "}
              {packageJson.dependencies["@stabilitydao/stability"].replace(
                "^",
                ""
              )}
            </span>
          </a>

          <a
            className="hover:bg-[#141033] px-3 py-3 rounded-xl mb-6 flex items-center w-full"
            href="https://github.com/stabilitydao/stability-ui"
            target="_blank"
            title="Go to UI source code on Github"
          >
            <GitHub/>
            <span className="ml-1">
              👩‍🚀 Stability User Interface {packageJson.version}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

const GitHub: React.FC<{}> = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 15 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.49999 0.562544C5.73427 0.562782 4.02622 1.19122 2.68139 2.33543C1.33657 3.47964 0.442689 5.06499 0.15966 6.80789C-0.123368 8.55078 0.222916 10.3375 1.13657 11.8485C2.05022 13.3595 3.47164 14.4961 5.14655 15.055C5.51843 15.1241 5.6778 14.8957 5.6778 14.6991C5.6778 14.5025 5.6778 14.0563 5.6778 13.4347C3.61124 13.881 3.17562 12.436 3.17562 12.436C3.03029 11.9806 2.72444 11.5936 2.31499 11.3469C1.6403 10.89 2.36812 10.8954 2.36812 10.8954C2.60378 10.9286 2.82872 11.0154 3.02576 11.1489C3.22279 11.2824 3.38671 11.4591 3.50499 11.6657C3.71077 12.0347 4.0547 12.307 4.46115 12.4226C4.86761 12.5381 5.30332 12.4875 5.67249 12.2819C5.70249 11.905 5.86867 11.5519 6.13999 11.2885C4.49312 11.0972 2.75593 10.4597 2.75593 7.61223C2.74389 6.87268 3.01796 6.15705 3.52093 5.61473C3.29327 4.97415 3.31989 4.27066 3.5953 3.64911C3.5953 3.64911 4.21687 3.44723 5.64062 4.40879C6.85796 4.07674 8.14202 4.07674 9.35937 4.40879C10.7778 3.44723 11.3994 3.64911 11.3994 3.64911C11.6748 4.27066 11.7014 4.97415 11.4737 5.61473C11.9767 6.15705 12.2508 6.87268 12.2387 7.61223C12.2387 10.4704 10.5016 11.0972 8.84406 11.2832C9.02161 11.4631 9.15853 11.6791 9.24559 11.9164C9.33264 12.1538 9.36782 12.407 9.34874 12.6591C9.34874 13.6525 9.34874 14.4547 9.34874 14.6991C9.34874 14.9435 9.48155 15.1294 9.87999 15.055C11.5571 14.4954 12.98 13.3566 13.8935 11.8428C14.807 10.3291 15.1514 8.5394 14.8649 6.79474C14.5784 5.05007 13.6797 3.46454 12.33 2.32245C10.9804 1.18037 9.26801 0.556436 7.49999 0.562544Z"
        fill="white"
      ></path>
    </svg>
  );
};

export { Platform };
