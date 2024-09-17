import {useStore} from "@nanostores/react";
import {apiData, currentChainID, platformVersions} from "@store";
import {
  type ApiMainReply,
  assets,
  getNetworksTotals,
  integrations,
  strategies,
  StrategyShortId,
  StrategyState
} from "@stabilitydao/stability";
import packageJson from "../../../package.json";
import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

const Platform = () => {
  const $currentChainID = useStore(currentChainID);
  const $platformVersions = useStore(platformVersions);
  const $apiData: ApiMainReply|undefined = useStore(apiData);

  const _networksTotal = getNetworksTotals()

  const strategyStatus = {
    live: 0,
    dev: 0,
    awaiting: 0,
    proposed: 0,
  }
  // @ts-ignore
  Object.keys(strategies).forEach((shortId: StrategyShortId) => {
    const status = strategies[shortId].state
    if (status === StrategyState.LIVE) {
      strategyStatus.live++
    }
    if (status === StrategyState.DEVELOPMENT) {
      strategyStatus.dev++
    }
    if (status === StrategyState.AWAITING) {
      strategyStatus.awaiting++
    }
    if (status === StrategyState.POSSIBLE || status === StrategyState.PROPOSAL) {
      strategyStatus.proposed++
    }

  })

  const capitalize = (s: string) => (s && s[0].toUpperCase() + s.slice(1)) || ""

  let protocolsTotal = 0
  for (const defiOrgCode of Object.keys(integrations)) {
    protocolsTotal += Object.keys(integrations[defiOrgCode].protocols).length
  }

  return (
    <>
      <h1 className="mb-5">Platform</h1>

      <div className="flex flex-wrap">
        <div
          className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-gray-200 items-center justify-center flex-col"
        >
          <div className="text-4xl">${$apiData?.total.tvl}</div>
          <div className="flex self-center justify-center text-[16px]">AUM</div>
        </div>
        <div
          className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-gray-200 items-center justify-center flex-col"
        >
          <div className="text-4xl">{$apiData?.total.activeVaults}</div>
          <div className="flex self-center justify-center text-[16px]">Vaults</div>
        </div>
      </div>

      <a href="/create-vault" className="hover:bg-amber-950 flex flex-col px-3 py-2 rounded-2xl mb-10">
        <h2 className="mb-3 text-3xl flex items-center justify-center">
          Factory
        </h2>

        <div className="flex relative flex-col">
          <div>Farms: {$apiData?.total.farms}</div>
          <div>Available for building: {$apiData?.total.vaultForBuilding}</div>
        </div>

      </a>

      <a
        className="hover:bg-gray-900 px-3 py-5 rounded-xl mb-6 flex flex-col"
        href="/network"
        title="View all strategies"
      >
        <h2 className="text-3xl mb-3">Network</h2>
        <div className="flex mb-10 flex-col">
          <div>
            Status: {$apiData?.network.status}
          </div>
          <div>
            Nodes: {Object.keys($apiData?.network.nodes || []).length}
          </div>

        </div>
      </a>

      <br/>

      <a
        className="hover:bg-gray-900 px-3 py-5 rounded-xl mb-6 flex flex-col"
        href="/strategies"
        title="View all strategies"
      >
        <h2 className="text-3xl text-center mb-3">Strategies</h2>
        <div className="flex relative">
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-green-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{strategyStatus.live}</div>
            <div className="flex self-center justify-center text-[16px]">Live</div>
          </div>

          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-blue-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{strategyStatus.dev}</div>
            <div className="flex self-center justify-center text-[16px]">Development</div>
          </div>

          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-violet-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{strategyStatus.awaiting}</div>
            <div className="flex self-center justify-center text-[16px]">Awaiting</div>
          </div>

          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-fuchsia-300 items-center justify-center flex-col"
          >
            <div className="text-4xl">{strategyStatus.proposed}</div>
            <div className="flex self-center justify-center text-[16px]">Proposal</div>
          </div>

        </div>
      </a>

      <a
        className="hover:bg-gray-900 px-3 py-5 rounded-xl mb-6 flex flex-col"
        href="/integrations"
        title="View all strategies"
      >
        <h2 className="text-3xl text-center mb-3">Integrations</h2>
        <div className="flex relative">
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-amber-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{Object.keys(integrations).length}</div>
            <div className="flex self-center justify-center text-[16px]">Organizations</div>
          </div>
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-blue-500 items-center justify-center flex-col"
          >
            <div className="text-4xl">{protocolsTotal}</div>
            <div className="flex self-center justify-center text-[16px]">Protocols</div>
          </div>
        </div>
      </a>

      <a
        className="hover:bg-gray-900 px-3 py-5 rounded-xl mb-6 flex flex-col"
        href="/chains"
        title="View all blockchains"
      >
        <h3 className="text-3xl text-center mb-3">Chains</h3>
        <div className="flex relative">
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-green-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{_networksTotal.SUPPORTED}</div>
            <div className="flex self-center justify-center text-[16px]">Supported</div>
          </div>
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-cyan-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{_networksTotal.CHAINLIB_DONE}</div>
            <div className="flex self-center justify-center text-[16px]">Coming soon</div>
          </div>
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-blue-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{_networksTotal.CHAINLIB_DEVELOPMENT + _networksTotal.CHAINLIB_AWAITING}</div>
            <div className="flex self-center justify-center text-[16px]">Development</div>
          </div>
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-fuchsia-300 items-center justify-center flex-col"
          >
            <div className="text-4xl">{_networksTotal.NOT_SUPPORTED}</div>
            <div className="flex self-center justify-center text-[16px]">Not supported</div>
          </div>

        </div>
      </a>

      <a
        className="hover:bg-gray-900 px-3 py-5 rounded-xl mb-6 flex flex-col"
        href="/assets"
        title="View all strategies"
      >
        <h2 className="text-3xl text-center mb-3">Assets</h2>
        <div className="flex relative">
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-amber-200 items-center justify-center flex-col"
          >
            <div className="text-4xl">{assets.length}</div>
            <div className="flex self-center justify-center text-[16px]">Assets</div>
          </div>
          <div
            className="flex w-[160px] h-[120px] mx-[20px] rounded-full text-blue-500 items-center justify-center flex-col"
          >
            <div className="text-4xl">{tokenlist.tokens.length}</div>
            <div className="flex self-center justify-center text-[16px]">Tokenlist items</div>
          </div>
        </div>
      </a>


      <h2 className="text-3xl text-center mb-3">Software</h2>
      <div className="mb-10 flex items-center gap-2">
        <div className="flex flex-col w-full">
          <a
            className="hover:bg-cyan-950 px-3 py-3 rounded-xl flex items-center"
            href="https://github.com/stabilitydao/stability-contracts"
            target="_blank"
            title="Go to smart contracts source code on Github"
          >
            <GitHub/>
            <span className="ml-1">💎 Stability Platform {$platformVersions[$currentChainID]}</span>
          </a>

          <a
            className="hover:bg-cyan-950 px-3 py-3 rounded-xl flex items-center"
            href="https://github.com/stabilitydao/stability"
            target="_blank"
            title="Go to library source code on Github"
          >
            <GitHub/>
            <span
              className="ml-1">📦 Stability Integration Library {packageJson.dependencies["@stabilitydao/stability"].replace('^', '')}</span>
          </a>

          <a
            className="hover:bg-cyan-950 px-3 py-3 rounded-xl mb-6 flex items-center w-full"
            href="https://github.com/stabilitydao/stability-ui"
            target="_blank"
            title="Go to UI source code on Github"
          >
            <GitHub/>
            <span className="ml-1">👩‍🚀 Stability User Interface {packageJson.version}</span>
          </a>


        </div>

      </div>

    </>
  )
}

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

export {Platform}