import { memo, useState, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";
import { useWalletClient, useAccount } from "wagmi";

import {
  VaultState,
  VaultType,
  HeadingText,
  TimeDifferenceIndicator,
} from "@ui";

import { getTimeDifference, getDate, addAssetToWallet } from "@utils";

import { CHAINS } from "@constants";

import { connected, currentChainID } from "@store";

import type { TVault } from "@types";

interface IProps {
  network: string;
  vault: TVault;
}

const VaultInfo: React.FC<IProps> = memo(({ network, vault }) => {
  const [created, setCreated] = useState<{ time: string; days: number }>();
  const [hardWorkOnDeposit, setHardWorkOnDeposit] = useState("");

  const client = useWalletClient();
  const { connector } = useAccount();

  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);

  useEffect(() => {
    if (vault) {
      const date = getDate(Number(vault?.created));

      setHardWorkOnDeposit(vault?.hardWorkOnDeposit ? "YES" : "NO");
      setCreated({ time: date, days: getTimeDifference(vault?.created)?.days });
    }
  }, [vault]);

  const isAddToWallet = useMemo(() => {
    return (
      vault?.symbol?.length <= 11 &&
      $connected &&
      window?.ethereum &&
      connector?.id === "io.metamask" &&
      network === $currentChainID
    );
  }, [vault?.symbol, $connected, connector, $currentChainID]);

  const gasReserve = useMemo(() => {
    return !!Number(vault?.gasReserve)
      ? Number(formatUnits(BigInt(vault?.gasReserve), 18)).toFixed(5)
      : 0;
  }, [vault?.gasReserve]);

  const nativeCurrency = CHAINS.find(
    (chain) => chain.id === network
  )?.nativeCurrency;

  return (
    <div>
      <HeadingText
        text="Vault"
        scale={2}
        styles="text-left md:ml-4 md:mb-0 mb-2"
      />

      <div className="flex flex-col items-start gap-5 md:p-4">
        <div className="flex flex-col gap-3">
          <p data-testid="vaultType" className="text-[16px]">
            <VaultType greater={true} type={vault?.type} />
          </p>
          <p data-testid="vaultIncomeText" className="text-[18px]">
            All income is automatically reinvested into vault
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between items-start w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              VAULT STATUS
            </p>
            <div className="text-[16px] mt-1 flex items-center gap-1">
              <VaultState status={vault?.status} />
              <span data-testid="vaultStatus">{vault?.status}</span>
            </div>
          </div>
          <div className="sm:w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              GAS RESERVE
            </p>
            <p data-testid="vaultGasReserve" className="text-[16px] mt-1">
              {gasReserve} {nativeCurrency}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 items-start justify-between w-full">
          <div className="flex flex-col">
            <div
              data-testid="vaultLastHardWork"
              className="flex flex-col justify-between"
            >
              <p className="uppercase text-[14px] leading-3 text-[#8D8E96] mb-[7px]">
                Last Hard Work
              </p>
              <TimeDifferenceIndicator unix={vault?.lastHardWork} />
            </div>
          </div>
          <div className="sm:w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              HARD WORK ON DEPOSIT
            </p>
            <p data-testid="hardWorkOnDeposit" className="text-[16px] mt-1">
              {hardWorkOnDeposit}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 items-start justify-between w-full">
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              CREATED
            </p>
            <p data-testid="vaultCreated" className="text-[16px] mt-1">
              {created?.time} / {created?.days} days ago
            </p>
          </div>
          <div className="sm:w-1/2">
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              NFT TOKEN ID
            </p>
            <p data-testid="vaultManagerID" className="text-[16px] mt-1">
              {vault?.NFTtokenID}
            </p>
          </div>
        </div>

        {!!vault?.version && (
          <div>
            <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
              VAULT VERSION
            </p>
            <p data-testid="vaultVersion" className="text-[16px] mt-1">
              {vault?.version}
            </p>
          </div>
        )}

        {isAddToWallet && (
          <button
            onClick={() =>
              addAssetToWallet(
                client,
                vault?.address,
                18,
                vault?.symbol,
                `https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`
              )
            }
            className="px-3 py-2 bg-[#262830] rounded-md text-[16px] cursor-pointer w-[200px] flex items-center justify-center gap-2"
          >
            <span>Add to MetaMask </span>{" "}
            <img src="/metamask.svg" alt="metamask" />
          </button>
        )}
      </div>
    </div>
  );
});

export { VaultInfo };
