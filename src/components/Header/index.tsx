import { useState } from "react";

import { WagmiProvider } from "wagmi";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { wagmiConfig } from "@web3";

import { queryClient, persister } from "@store";

import { Wallet } from "./Wallet";

import "./header.css";

const Header = () => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1); // remove the first "/"

  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu((prev) => !prev);
    const body = document.querySelector("body");
    if (body) body.classList.toggle("no-scroll", !menu);
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <header>
          <span className="title w-1/3">
            <a href="/" title="Stability">
              <img src="/logo.svg" alt="Stability logo" />
              <span className="hidden sm:flex">Stability</span>
            </a>
          </span>
          <div className="menu w-1/3">
            <a
              className={currentPath === "" ? "active font-bold" : ""}
              href="/"
            >
              Vaults
            </a>
            {/* <a className={currentPath === "dao" ? "active" : ""} href="/dao">
      DAO
    </a> */}
          </div>
          <div className="flex sm:w-1/3 justify-end">
            <Wallet />
            <div
              className={`burger-menu ${menu && "active"}`}
              onClick={toggleMenu}
            >
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
          <nav className={`menu-nav text-center ${menu && "active"}`}>
            <a href="/">Vaults</a>
          </nav>
        </header>
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
};

export { Header };
