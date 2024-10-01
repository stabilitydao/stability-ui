import { useState } from "react";

import { Wallet } from "./Wallet";

import { WagmiLayout } from "@layouts";

import "./header.css";

const Header = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1); // remove the first "/"

  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu((prev) => !prev);
    const body = document.querySelector("body");
    if (body) body.classList.toggle("no-scroll", !menu);
  };

  return (
    <WagmiLayout>
      <header className="font-manrope bg-[#130932] rounded-b-[16px]">
        <span className="title sm:w-4/12 md:w-5/12">
          <a data-testid="stability-logo" href="/" title="Stability">
            <img src="/logo.svg" alt="Stability logo" />
            <span className="block text-[20px] font-semibold text-[#A995FF]">
              Stability
            </span>
          </a>
        </span>
        <div className="menu w-2/12 text-[16px]">
          <a
            data-testid="vaults-link"
            className={currentPath === "" ? "active" : ""}
            href="/"
          >
            Vaults
          </a>
        </div>
        <div className="flex sm:w-8/12 md:w-5/12 justify-end mr-[10px]">
          <div className="min-[601px]:block hidden">
            <Wallet />
          </div>

          <div className="burger-menu" onClick={toggleMenu}>
            {menu ? (
              <img src="/close.svg" alt="close" />
            ) : (
              <img src="/menu.svg" alt="menu" />
            )}
          </div>
        </div>
        <nav className={`menu-nav text-center gap-3 ${menu && "active"}`}>
          <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "" ? "bg-[#2B1570] rounded-[16px]" : ""}`}
            href="/"
          >
            Vaults
          </a>
          <div className="w-full">
            <Wallet />
          </div>
        </nav>
      </header>
    </WagmiLayout>
  );
};

export { Header };
