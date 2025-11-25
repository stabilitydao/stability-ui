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

import { seeds } from "@stabilitydao/stability";

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
    if (vault && vault?.created) {
      const date = getDate(Number(vault?.created));

      setHardWorkOnDeposit(vault?.hardWorkOnDeposit ? "Yes" : "No");
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
      <HeadingText text="Vault" scale={2} styles="text-left mb-3 md:mb-4" />

      <div className="flex flex-col items-start gap-3 md:gap-4 p-4 md:p-6 bg-[#101012] rounded-lg border border-[#23252A]">
        <div className="flex flex-col gap-4">
          <p data-testid="vaultType" className="text-[16px]">
            <VaultType greater={true} type={vault?.vaultType} />
          </p>
          <p
            data-testid="vaultIncomeText"
            className="text-[14px] leading-6 text-[#97979A]"
          >
            All income is automatically reinvested into vault
          </p>
        </div>

        <div className="flex justify-between items-start w-full">
          <div>
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Vault Status
            </p>
            <div className="text-[20px] leading-6 font-semibold mt-1 flex items-center">
              <VaultState status={vault?.status} />
              <span data-testid="vaultStatus">{vault?.status}</span>
            </div>
          </div>
          <div className="w-1/2">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Gas Reserve
            </p>
            <p
              data-testid="vaultGasReserve"
              className="text-[20px] leading-6 font-semibold mt-1"
            >
              {gasReserve} {nativeCurrency}
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col">
            <div
              data-testid="vaultLastHardWork"
              className="flex flex-col justify-between gap-1"
            >
              <p className="font-medium leading-5 text-[#97979A] text-[14px]">
                Last Hard Work
              </p>
              <TimeDifferenceIndicator unix={vault?.lastHardWork} />
            </div>
          </div>
          <div className="w-1/2">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Hard Work on Deposit
            </p>
            <p
              data-testid="hardWorkOnDeposit"
              className="text-[20px] leading-6 font-semibold mt-1"
            >
              {hardWorkOnDeposit}
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between w-full">
          <div>
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              Created
            </p>
            <p
              data-testid="vaultCreated"
              className="text-[20px] leading-6 font-semibold mt-1"
            >
              {created?.time}
            </p>
          </div>
          <div className="w-1/2">
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              NFT Token ID
            </p>
            <p
              data-testid="vaultManagerID"
              className="text-[20px] leading-6 font-semibold mt-1"
            >
              {vault?.NFTtokenID}
            </p>
          </div>
        </div>

        {!!vault?.version && (
          <div>
            <p className="font-medium leading-5 text-[#97979A] text-[14px]">
              VAULT VERSION
            </p>
            <p
              data-testid="vaultVersion"
              className="text-[20px] leading-6 font-semibold mt-1"
            >
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
                `${seeds[0]}/vault/${vault.network}/${vault.address}/logo.svg`
              )
            }
            className="w-full text-[16px] bg-[#5E6AD2] font-semibold justify-center py-3 rounded-lg"
          >
            Add to wallet
          </button>
        )}
      </div>
    </div>
  );
});

export { VaultInfo };
