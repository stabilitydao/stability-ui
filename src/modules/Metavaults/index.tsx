import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { FullPageLoader } from "@ui";

import { MetaVaultsLinks } from "./components/MetaVaultsLinks";

import { metaVaults } from "@store";

const Metavaults = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);

  const [localMetaVaults, setLocalMetaVaults] = useState([]);

  const initMetavaults = async () => {
    setLocalMetaVaults($metaVaults);
  };

  useEffect(() => {
    if ($metaVaults.length) {
      initMetavaults();
    }
  }, [$metaVaults]);

  return (
    <div className="mx-auto flex flex-col gap-10">
      <div>
        <h2 className="font-bold text-[40px] leading-[48px] text-start mb-5">
          Metavaults
        </h2>
        <h3 className="text-[#97979a] font-medium text-[20px] leading-8">
          Metavaults are automated vaults that combine multiple DeFi <br />{" "}
          protocols and assets into a single strategy
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
