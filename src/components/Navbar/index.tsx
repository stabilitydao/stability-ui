import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { NavIcon } from "@ui";

import { cn, formatNumber } from "@utils";

import { apiData } from "@store";

import { PATHS } from "@constants";

const Navbar = (): JSX.Element => {
  const $apiData = useStore(apiData);

  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1);

  const [activePath, setActivePath] = useState("");

  const [prices, setPrices] = useState([]);

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

  useEffect(() => {
    if ($apiData) {
      const _prices = Object.entries($apiData.prices).sort(
        (a, b) => Number(b[1].price) - Number(a[1].price)
      );
      setPrices(_prices);
    }
  }, [$apiData]);

  return (
    <nav className="navbar">
      <div className="pt-5 pb-[30px] px-4 flex flex-col justify-between h-full">
        <div>
          <a href="/">
            <img
              src="/stability-logo.png"
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
          <div className="flex flex-col gap-1 w-full text-white">
            {prices.map(([symbol, data]) => (
              <div
                key={symbol}
                title={symbol}
                className="flex items-center justify-between border border-[#23252A] rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`/features/${symbol.toLowerCase()}.png`}
                    alt={symbol}
                    className="w-6 h-6"
                  />
                  <span className="text-[14px] font-semibold">{symbol}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[12px] font-semibold">
                    {formatNumber(
                      data.price,
                      Number(data.price) < 1
                        ? "formatWithLongDecimalPart"
                        : "format"
                    )}
                    $
                  </span>
                  <span
                    className={`text-[10px] font-medium ${data.priceChange >= 0 ? "text-[#48C05C]" : "text-[#DE4343]"}`}
                  >
                    {data.priceChange > 0 ? "+" : ""}
                    {data.priceChange}%
                  </span>
                </div>
              </div>
            ))}
          </div>
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
              <a href="https://discord.com/invite/R3nnetWzC9" target="_blank">
                <img src="/socials/discord.png" alt="Stability Discord" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
