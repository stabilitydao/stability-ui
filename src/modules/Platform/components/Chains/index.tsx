import { useState, useEffect } from "react";

import { chains } from "@stabilitydao/stability";

import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import { Breadcrumbs, TableColumnSort } from "@ui";

import { BridgesList, ChainStatus } from "../../ui";

import { formatNumber, sortTable, getShortAddress } from "@utils";

import { CHAINS_TABLE } from "@constants";

import { CHAINS_INFO } from "../../constants";

import type { TTableColumn, IChainData } from "@types";

import type { ApiMainReply } from "@stabilitydao/stability";

const toChain = (chainId: number): void => {
  window.location.href = `/chains/${chainId}`;
};

const Chains = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  const [tableStates, setTableStates] = useState(CHAINS_TABLE);
  const [tableData, setTableData] = useState<IChainData[]>([]);

  const initTableData = async () => {
    if (chains) {
      const chainsData = Object.entries(chains).map((chain) => ({
        ...chain[1],
        chainId: Number(chain[1].chainId),
        tvl: $apiData?.total.chainTvl[chain[0]] || 0,
      }));

      setTableData(chainsData);
    }
  };

  useEffect(() => {
    initTableData();
  }, [$apiData]);
  return (
    <div>
      <Breadcrumbs links={["Platform", "Chains"]} />

      <h1 className="mb-3">Chains</h1>

      <div className="flex flex-wrap relative mb-5">
        {CHAINS_INFO.map(({ name, length, color }) => (
          <div
            key={name}
            className={`flex w-[140px] h-[120px] mx-[20px] rounded-full ${color} items-center justify-center flex-col`}
          >
            <div className="text-4xl">{length}</div>
            <div className="flex self-center justify-center text-[14px]">
              {name}
            </div>
          </div>
        ))}
      </div>

      <table className="w-full font-manrope">
        <thead className="bg-accent-950 text-neutral-600 h-[36px]">
          <tr className="text-[12px] uppercase">
            {tableStates.map((value: TTableColumn, index: number) => (
              <TableColumnSort
                key={value.name + index}
                index={index}
                value={value.name}
                sort={sortTable}
                table={tableStates}
                setTable={setTableStates}
                tableData={tableData}
                setTableData={setTableData}
              />
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {!!tableData.length &&
            tableData.map(
              ({
                chainId,
                name,
                status,
                img,
                multisig,
                chainLibGithubId,
                tvl,
              }) => (
                <tr
                  onClick={() => toChain(chainId)}
                  key={chainId}
                  className="h-[48px] hover:bg-accent-950 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {img && (
                        <img
                          src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${img}`}
                          alt={name}
                          className="w-[24px] h-[24px] mr-2 rounded-full"
                        />
                      )}
                      {name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{chainId}</td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    {formatNumber(tvl, "abbreviate")}
                  </td>
                  <td className="px-4 py-3 text-[12px]">
                    <div className="flex">
                      {multisig && <span>{getShortAddress(multisig)}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {chainLibGithubId && (
                        <a
                          className="inline-flex"
                          href={`https://github.com/stabilitydao/stability-contracts/issues/${chainLibGithubId}`}
                          target="_blank"
                          title="Go to chain library issue page on Github"
                        >
                          <img
                            src="/icons/github.svg"
                            alt="Github"
                            className="w-[20px]"
                          />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <ChainStatus status={status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center">
                      <BridgesList chainId={chainId} chainName={name} />
                    </div>
                  </td>
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
};

export { Chains };
