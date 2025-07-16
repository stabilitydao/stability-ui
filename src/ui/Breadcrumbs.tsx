import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { metaVaults, vaults } from "@store";

import { PATHS } from "@constants";

import { contests, chains, integrations } from "@stabilitydao/stability";

const Breadcrumbs = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1);

  const $vaults = useStore(vaults);
  const $metaVaults = useStore(metaVaults);

  const [paths, setPaths] = useState<{ name: string; path: string }[]>([]);

  useEffect(() => {
    const crumbs = [{ name: "Home", path: "" }];

    const add = (name: string, path = "") => crumbs.push({ name, path });

    const [main, ...rest] = currentPath.split("/");

    const pathFromConst = PATHS.find((_) => _.path === currentPath);

    if (pathFromConst) {
      add(pathFromConst.name, currentPath);
    } else if (currentPath === "contests") {
      add("Leaderboard", "leaderboard");
      add("Contests", "contests");
    } else if (main === "contests" && rest.length === 1) {
      const contest = contests[rest[0]];
      add("Leaderboard", "leaderboard");
      add("Contests", "contests");
      add(contest?.name || "Unknown Contest");
    } else if (currentPath === "platform") {
      add("Platform", "platform");
    } else if (main === "vaults" && rest[0] === "vault" && rest.length === 3) {
      const [, , chainId, vaultAddress] = currentPath.split("/");

      const symbol =
        $vaults?.[chainId]?.[vaultAddress?.toLowerCase()]?.symbol || "Vault";

      add("All Vaults", "vaults");
      add(symbol);
    } else if (main === "strategies") {
      add("Platform", "platform");
      add("Strategies", "strategies");
      if (rest[0]) add(rest[0].toUpperCase());
    } else if (main === "chains") {
      add("Platform", "platform");
      add("Chains", "chains");
      if (rest[0]) add(chains?.[rest[0]]?.name || rest[0]);
    } else if (main === "integrations") {
      add("Platform", "platform");
      add("Integrations", "integrations");
      if (rest[0]) {
        const integrationName = rest[0].toLowerCase().replace(/\s+/g, "");
        const integration = Object.values(integrations).find(
          (i) => i.name.toLowerCase().replace(/\s+/g, "") === integrationName
        );
        add(integration?.name || "Integration");
      }
    } else if (main === "network") {
      add("Platform", "platform");
      add("Network", "network");
      if (rest[0]) {
        const short = `${rest[0].slice(0, 4)}...${rest[0].slice(-4)}`;
        add(`Node ${short}`);
      }
    } else if (main === "swapper" && rest[0] === "add-pools") {
      add("Platform", "platform");
      add("Swapper", "swapper");
      add("Add Pools");
    } else if (["assets", "swapper", "factory"].includes(main)) {
      add("Platform", "platform");
      add(main.charAt(0).toUpperCase() + main.slice(1));
    } else if (
      main === "metavaults" &&
      rest[0] === "metavault" &&
      rest.length === 2 &&
      $metaVaults["146"]
    ) {
      // rest length == 2 bcs no chain id
      // todo change to 3 (with chain id)
      const [, , metaVaultAddress] = currentPath.split("/");

      const symbol =
        $metaVaults["146"].find(
          ({ address }) => address.toLowerCase() === metaVaultAddress
        )?.name || "Meta Vault";

      add("Meta Vaults", "metavaults");
      add(symbol);
    }

    setPaths(crumbs);
  }, [currentPath, $vaults, $metaVaults]);

  return (
    <div className="font-manrope text-[14px] flex gap-1">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        return (
          <div key={path.name}>
            {isLast ? (
              <span>{path.name}</span>
            ) : (
              <>
                <a
                  href={`/${path.path}`}
                  className="text-[#97979a] hover:text-white mr-1"
                >
                  {path.name}
                </a>
                <span className="text-[#26282d]">&gt;</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Breadcrumbs };
