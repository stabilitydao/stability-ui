import { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useStore } from "@nanostores/react";

import { Prices, NavIcon, Socials, TextSkeleton, Badge, APRBadge } from "@ui";

import { cn, formatNumber, useProposals, useStakingData } from "@utils";

import { apiData, isNavbar } from "@store";

import { PATHS, ROUTES } from "@constants";

const Navbar = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1);

  const { isVoting } = useProposals();

  const { data: stakingData } = useStakingData();

  const $apiData = useStore(apiData);

  const $isNavbar = useStore(isNavbar);

  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    const isPlatform =
      ROUTES.platform.some((path) => path === currentPath) ||
      ROUTES.platform.some((path) => currentPath.includes(path));

    const isVaults =
      !currentPath.includes("metavaults") && currentPath.includes("vault");

    const isBasicPage = ROUTES.basic.includes(currentPath);

    if (isVaults) {
      setActivePath("vaults");
    } else if (isPlatform) {
      setActivePath("platform");
    } else if (
      currentPath === "leaderboards" ||
      currentPath.includes("contests") ||
      currentPath.includes("season-1")
    ) {
      setActivePath("leaderboards");
    } else if (currentPath.includes("metavaults")) {
      setActivePath("metavaults");
    } else if (currentPath.includes("lending")) {
      setActivePath("lending");
    } else if (isBasicPage) {
      setActivePath(currentPath);
    }
  }, []);

  const AUM = useMemo(
    () =>
      $apiData?.total?.tvl
        ? formatNumber(
            Number($apiData?.total.tvl ?? 0) +
              Number($apiData?.total?.marketTvl ?? 0),
            "abbreviate"
          )
        : "0",
    [$apiData]
  );

  const statusColor =
    $apiData?.network.status == "Alert"
      ? "#ff8d00"
      : $apiData?.network.status == "OK"
        ? "#00ff00"
        : "#1B1D21";

  return (
    <div className="hidden md:block">
      <AnimatePresence>
        {$isNavbar && (
          <motion.div
            className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => isNavbar.set(false)}
          />
        )}
      </AnimatePresence>

      {($isNavbar || window.innerWidth >= 1560) && (
        <div className={cn("navbar", !$isNavbar && "hidden xl3:block")}>
          <div className="pt-5 pb-[30px] px-4 flex flex-col justify-between gap-[80px] h-full">
            <div>
              <a href="/">
                <img
                  src="/long_logo.png"
                  alt="Stability logo"
                  className="ml-[14px]"
                />
              </a>

              <div className="mt-4">
                {PATHS.map(({ name, path }) => (
                  <div
                    key={name}
                    className={cn(
                      "cursor-pointer rounded-lg",
                      activePath === path && "bg-[#22242a]"
                    )}
                  >
                    <a
                      className="px-4 py-3 flex items-center justify-between"
                      href={`/${path}`}
                    >
                      <span
                        className={cn(
                          "text-[#97979A]",
                          activePath === path && "text-white"
                        )}
                      >
                        {name}
                      </span>
                      <div className="flex items-center gap-3">
                        {path === "staking" && (
                          <APRBadge APR={stakingData?.APR ?? 0} />
                        )}
                        {path === "dao" && isVoting && (
                          <Badge state="success" text="Voting" />
                        )}
                        <NavIcon path={path} isActive={activePath === path} />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Prices />
              <div className="flex gap-2">
                <div className="w-2/3 flex items-center justify-between h-10 px-4 border border-[#23252A] rounded-lg text-[14px] leading-4 font-medium">
                  <span className="text-[#A3A4A6]">AUM</span>
                  {AUM !== "0" ? (
                    <span className="text-white">{AUM}</span>
                  ) : (
                    <TextSkeleton lineHeight={16} width={50} />
                  )}
                </div>
                <a
                  href="/platform"
                  title="Platform"
                  className="w-1/3 flex items-center justify-center gap-[6px] h-10 px-4 border border-[#23252A] rounded-lg text-[12px] leading-3 font-medium"
                >
                  <span className="text-[#97979A] uppercase">
                    <img src="/logo.svg" alt="Stability" className="w-4 h-4" />
                  </span>
                  <span className="text-white">
                    <span
                      className="inline-flex w-[10px] h-[10px] rounded-full"
                      style={{ backgroundColor: statusColor }}
                    ></span>
                  </span>
                </a>
              </div>
              <div className="text-[#97979A] flex flex-col">
                {/* <a href="#" className="px-4 py-2">
                  Privacy Policy
                </a>
                <a href="#" className="px-4 py-2">
                  Terms of Use
                </a> */}
                <Socials styles="pb-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Navbar };
