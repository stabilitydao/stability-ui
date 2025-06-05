import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { FullPageLoader } from "@ui";

import { MetaVaultsLinks } from "./components/MetaVaultsLinks";

import { META_VAULTS_TYPE } from "@constants";

import { metaVaults } from "@store";

const Metavaults = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);

  const [localMetaVaults, setLocalMetaVaults] = useState([]);

  const initMetavaults = async () => {
    const onlyMetaVaults = $metaVaults["146"].filter(
      ({ symbol }: { symbol: string }) =>
        META_VAULTS_TYPE[symbol as keyof typeof META_VAULTS_TYPE] ===
        "metaVault"
    );

    setLocalMetaVaults(onlyMetaVaults);
  };

  useEffect(() => {
    if ($metaVaults && $metaVaults["146"].length) {
      initMetavaults();
    }
  }, [$metaVaults]);

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
          <MetaVaultsLinks metaVaults={localMetaVaults} />
        )}
      </div>
    </div>
  );
};

export { Metavaults };
