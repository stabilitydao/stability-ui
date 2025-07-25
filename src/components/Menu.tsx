import { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useStore } from "@nanostores/react";

import { Prices, NavIcon, Socials } from "@ui";

import { cn, formatNumber } from "@utils";

import { apiData, isNavbar } from "@store";

import { PATHS } from "@constants";

const Menu = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1);

  const $isNavbar = useStore(isNavbar);
  const $apiData = useStore(apiData);

  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    const platformPaths = [
      "platform",
      "strategies",
      "chains",
      "integrations",
      "assets",
      "factory",
      "network",
      "swapper",
    ];

    const basicPaths = [
      "xstbl",
      "dashboard",
      "leveraged-farming",
      "alm",
      "agents",
    ];

    const isPlatform =
      platformPaths.some((path) => path === currentPath) ||
      platformPaths.some((path) => currentPath.includes(path));

    const isVaults =
      !currentPath.includes("metavaults") && currentPath.includes("vault");

    const isBasicPage = basicPaths.includes(currentPath);

    if (isVaults) {
      setActivePath("vaults");
    } else if (isPlatform) {
      setActivePath("platform");
    } else if (
      currentPath === "leaderboard" ||
      currentPath.includes("contests")
    ) {
      setActivePath("leaderboard");
    } else if (currentPath.includes("metavaults")) {
      setActivePath("metavaults");
    } else if (isBasicPage) {
      setActivePath(currentPath);
    }
  }, []);

  const TVL = useMemo(
    () =>
      $apiData?.total?.tvl
        ? formatNumber($apiData?.total.tvl || 0, "abbreviate")
        : "0",
    [$apiData]
  );

  const isAlert = $apiData?.network.status == "Alert";
  const isOk = $apiData?.network.status == "OK";

  return (
    <div className="block md:hidden">
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

      <AnimatePresence>
        {$isNavbar && (
          <motion.nav
            className="fixed bottom-0 left-0 w-full max-h-[90vh] bg-[#111114] border-t border-[#23252A] z-[1500] flex flex-col justify-between overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex flex-col justify-between gap-4 overflow-y-auto">
              <div className="text-[18px] leading-6 font-semibold text-white flex items-center justify-between">
                <span>Menu</span>
                <img
                  onClick={() => isNavbar.set(false)}
                  className="w-[18px] h-[18px] cursor-pointer"
                  src="/icons/xmark.svg"
                  alt="xmark"
                />
              </div>

              <div className="flex flex-col gap-2">
                {PATHS.map(({ name, path }) => (
                  <div
                    key={name}
                    className={cn(
                      "cursor-pointer rounded-lg bg-[#22242a] border border-[#35363B]",
                      activePath === path && "border-[#816FEA]"
                    )}
                  >
                    <a
                      className="p-4 flex items-center justify-between"
                      href={`/${path}`}
                    >
                      <span
                        className={cn(
                          "text-[#97979A] text-[16px] leading-4 font-medium",
                          activePath === path && "text-white"
                        )}
                      >
                        {name}
                      </span>
                      <NavIcon path={path} isActive={activePath === path} />
                    </a>
                  </div>
                ))}
              </div>

              <Prices isMobile={true} />

              <div className="flex flex-col gap-2">
                <a
                  href="https://stability.market/"
                  target="_blank"
                  className="border border-[#23252A] rounded-lg"
                >
                  <div className="flex items-center justify-between gap-2 px-4 h-10">
                    <span className="text-[#A3A4A6] text-[14px] leading-4 font-medium">
                      Market
                    </span>
                    <img src="/icons/external_link.svg" alt="External link" />
                  </div>
                </a>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex gap-4 w-1/2">
                    {TVL ? (
                      <div className="w-full flex items-center justify-between h-10 gap-2 px-4 border border-[#23252A] rounded-lg text-[14px] leading-4 font-medium">
                        <span className="text-[#A3A4A6]">AUM</span>
                        <span className="text-white">{TVL}</span>
                      </div>
                    ) : null}
                  </div>
                  <a
                    href="/platform"
                    title="Platform"
                    className="w-1/2 flex items-center justify-between h-10 gap-2 px-4 border border-[#23252A] rounded-lg text-[14px] leading-4 font-medium"
                  >
                    <span className="text-[#97979A]">Platform</span>
                    <span className="text-white">
                      <span
                        className="inline-flex w-[10px] h-[10px] rounded-full"
                        style={{
                          backgroundColor: isAlert
                            ? "#ff8d00"
                            : isOk
                              ? "#00ff00"
                              : "#444444",
                        }}
                      ></span>
                    </span>
                  </a>
                </div>
              </div>

              <div className="text-[#97979A] flex items-center justify-between text-sm">
                {/* <div className="flex items-center">
                  <a href="#" className="p-4">
                    Privacy Policy
                  </a>
                  <a href="#" className="p-4">
                    Term of Use
                  </a>
                </div> */}
                <Socials />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Menu };
