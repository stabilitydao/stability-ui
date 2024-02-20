import { useState } from "react";

import { WagmiConfig } from "wagmi";

import { wagmiConfig } from "@web3";

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
    <WagmiConfig config={wagmiConfig}>
      <header>
        <span className="title sm:w-4/12 md:w-5/12">
          <a href="/" title="Stability">
            <img src="/logo8.png" alt="Stability logo"/>
            <span className="hidden sm:flex">Stability</span>
          </a>
        </span>
        <div className="menu w-2/12">
          <a className={currentPath === "" ? "active font-bold" : ""} href="/">
            Vaults
          </a>
          {/* <a className={currentPath === "dao" ? "active" : ""} href="/dao">
        DAO
      </a> */}
        </div>
        <div className="flex sm:w-8/12 md:w-5/12 justify-end">
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
    </WagmiConfig>
  );
};

export { Header };
