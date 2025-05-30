import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useStore } from "@nanostores/react";

import { Prices } from "@ui";

import { NavIcon } from "@ui";

import { cn } from "@utils";

import { isNavbar } from "@store";

import { PATHS } from "@constants";

const Navbar = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1);

  const $isNavbar = useStore(isNavbar);

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
    } else if (currentPath === "users" || currentPath.includes("contests")) {
      setActivePath("users");
    } else if (currentPath.includes("metavaults")) {
      setActivePath("metavaults");
    } else if (isBasicPage) {
      setActivePath(currentPath);
    }
  }, []);

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

      <AnimatePresence>
        {($isNavbar || window.innerWidth >= 1440) && (
          <motion.nav
            className={cn("navbar", !$isNavbar && "hidden xxl:block")}
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
          >
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
                        className="p-4 flex items-center justify-between"
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
                        <NavIcon path={path} isActive={activePath === path} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[25px]">
                <Prices />
                <div className="text-[#97979A] flex flex-col">
                  <a href="#" className="px-4 py-2">
                    Privacy Policy
                  </a>
                  <a href="#" className="px-4 py-2">
                    Terms of Use
                  </a>
                  <div className="flex items-center gap-4 p-4 pb-0">
                    <a href="https://x.com/stabilitydao" target="_blank">
                      <img src="/socials/x.png" alt="Stability X" />
                    </a>
                    <a
                      href="https://discord.com/invite/R3nnetWzC9"
                      target="_blank"
                    >
                      <img src="/socials/discord.png" alt="Stability Discord" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Navbar };
