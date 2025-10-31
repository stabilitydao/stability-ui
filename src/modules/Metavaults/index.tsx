import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { FullPageLoader } from "@ui";

import { MetaVaultsLinks } from "./components/MetaVaultsLinks";

import { useModalClickOutside, formatNumber } from "@utils";

import { metaVaults } from "@store";

import { VaultTypes } from "@types";

export type TModal = {
  APR: string;
  merklAPR: string;
  gemsAPR: string;
  totalAPR: string;
  isOpen: boolean;
};

const Metavaults = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);

  const [localMetaVaults, setLocalMetaVaults] = useState([]);

  const [modal, setModal] = useState<TModal>({
    APR: "0",
    merklAPR: "0",
    gemsAPR: "0",
    totalAPR: "0",
    isOpen: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const initMetavaults = async () => {
    const sonicOnlyMetaVaults = $metaVaults["146"].filter(
      ({ type }: { type: string }) => type === VaultTypes.MetaVault
    );

    const plasmaMetaVaults = $metaVaults["9745"] || [];

    const visibleMetaVaults = [...sonicOnlyMetaVaults, ...plasmaMetaVaults];

    setLocalMetaVaults(visibleMetaVaults);
  };

  useEffect(() => {
    if ($metaVaults && $metaVaults["146"].length) {
      initMetavaults();
    }
  }, [$metaVaults]);

  useModalClickOutside(modalRef, () =>
    setModal((prev) => ({ ...prev, isOpen: false }))
  );

  return (
    <div className="mx-auto flex flex-col gap-6 md:gap-10 lg:min-w-[1000px]">
      <div>
        <h2 className="page-title__font text-start mb-2 md:mb-5">
          Meta Vaults
        </h2>
        <h3 className="text-[#97979a] page-description__font">
          Metavaults are automated vaults that combine multiple DeFi protocols
          and assets <br className="hidden lg:block" /> into a single strategy
          while automatically rebalancing positions across
          <br className="hidden lg:block" /> integrated DeFi protocols and
          assets, maximizing returns
        </h3>
      </div>
      <div className="pb-5">
        {!localMetaVaults.length ? (
          <div className="relative h-[80px]">
            <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
              <FullPageLoader />
            </div>
          </div>
        ) : (
          <MetaVaultsLinks metaVaults={localMetaVaults} setModal={setModal} />
        )}
      </div>
      {modal?.isOpen && (
        <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div
            ref={modalRef}
            className="relative w-[90%] max-w-[400px] max-h-[80vh] overflow-y-auto bg-[#111114] border border-[#232429] rounded-lg"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#232429]">
              <h2 className="text-[18px] leading-6 font-semibold">Total APR</h2>
              <button onClick={() => setModal({ ...modal, isOpen: false })}>
                <img src="/icons/xmark.svg" alt="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="leading-5 text-[#97979A] font-medium">APR</p>
                <p className="text-end font-semibold">
                  {modal.APR ? formatNumber(modal.APR, "formatAPR") : 0}%
                </p>
              </div>
              <a
                className="flex items-center justify-between"
                href="https://app.merkl.xyz/users/"
                target="_blank"
              >
                <div className="flex items-center gap-2">
                  <p className="leading-5 text-[#97979A] font-medium">
                    Merkl APR
                  </p>
                  <img
                    src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Merkl.svg"
                    alt="Merkl"
                    className="w-6 h-6"
                  />
                </div>
                <p className="text-end font-semibold">
                  {modal.merklAPR
                    ? formatNumber(modal.merklAPR, "formatAPR")
                    : 0}
                  %
                </p>
              </a>
              {!!modal.gemsAPR && (
                <div className="flex items-center justify-between">
                  <p className="leading-5 text-[#97979A] font-medium">
                    sGEM1 APR
                  </p>
                  <p className="text-end font-semibold">
                    {modal.gemsAPR
                      ? formatNumber(modal.gemsAPR, "formatAPR")
                      : 0}
                    %
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[#2BB656]">
                <p className="leading-5 font-medium">Total APR</p>
                <p className="text-end font-semibold">
                  {modal.totalAPR
                    ? formatNumber(modal.totalAPR, "formatAPR")
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Metavaults };
