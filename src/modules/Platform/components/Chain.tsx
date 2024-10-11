import { chains } from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import { getShortAddress } from "@utils";

import { Breadcrumbs } from "@ui";

import { ChainStatus, BridgesList } from "../ui";

interface IProps {
  chain: number;
}

const Chain: React.FC<IProps> = ({ chain }) => {
  const $apiData = useStore(apiData);

  const chainData = {
    ...chains[chain],
    tvl: $apiData?.total.chainTvl[chain] || 0,
  };
  return (
    <div>
      <Breadcrumbs links={["Platform", "Chains", String(chain)]} />

      <p>{chainData.name}</p>
      <p>{chainData.tvl}</p>
      <h1 className="mb-3">{chain}</h1>
      {chainData.multisig && <span>{getShortAddress(chainData.multisig)}</span>}
      <a
        className="inline-flex"
        href={`https://github.com/stabilitydao/stability-contracts/issues/${chainData.chainLibGithubId}`}
        target="_blank"
        title="Go to chain library issue page on Github"
      >
        <img src="/icons/github.svg" alt="Github" className="w-[20px]" />
      </a>
      <ChainStatus status={chainData.status} />
      <BridgesList chainId={chain} chainName={chainData.name} />
    </div>
  );
};

export { Chain };
