import { useState } from "react";

import { Wallet } from "./Wallet";

import { WagmiLayout } from "@layouts";

import "./header.css";

const Header = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1); // remove the first "/"

  const platformPaths = [
    "platform",
    "strategies",
    "chains",
    "integrations",
    "assets",
    "create-vault",
  ];

  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu((prev) => !prev);
    const body = document.querySelector("body");
    if (body) body.classList.toggle("no-scroll", !menu);
  };

  const isPlatform =
    platformPaths.some((path) => path === currentPath) ||
    currentPath.includes("network/") ||
    currentPath.includes("chains/") ||
    currentPath.includes("strategies/");

  const isVaults = currentPath === "" || currentPath.includes("vault/");
  return (
    <WagmiLayout>
      <header className="font-manrope bg-accent-950 md:bg-transparent rounded-b-[16px] relative">
        <span className="title">
          <a data-testid="stability-logo" href="/" title="Stability">
            <img src="/logo.svg" alt="Stability logo" />
            <span className="block text-[20px] font-semibold text-[#A995FF]">
              Stability
            </span>
          </a>
        </span>
        <div className="menu absolute left-1/2 transform -translate-x-1/2 text-[16px]">
          <a
            data-testid="vaults-link"
            className={isVaults ? "active" : ""}
            href="/"
          >
            Vaults
          </a>
          <a
            className={
              currentPath === "users" || currentPath.includes("contests")
                ? "active"
                : ""
            }
            href="/users"
          >
            Users
          </a>
          <a className={isPlatform ? "active" : ""} href="/platform">
            Platform
          </a>
        </div>
        <div className="flex justify-end mr-[15px] gap-3">
          <Wallet />
          <div className="burger-menu" onClick={toggleMenu}>
            {menu ? (
              <img className="w-4 h-4" src="/close.svg" alt="close" />
            ) : (
              <img className="w-4 h-4" src="/menu.svg" alt="menu" />
            )}
          </div>
        </div>
        <nav className={`menu-nav text-center gap-3 ${menu && "active"}`}>
          <a
            className={`px-4 py-[10px] font-semibold ${isVaults ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/"
          >
            Vaults
          </a>
          <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "users" || currentPath.includes("contests") ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/users"
          >
            Users
          </a>
          <a
            className={`px-4 py-[10px] font-semibold ${isPlatform ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/platform"
          >
            Platform
          </a>
        </nav>
      </header>
    </WagmiLayout>
  );
};

export { Header };
