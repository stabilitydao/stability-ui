import { useStore } from "@nanostores/react";

import { account, isNavbar } from "@store";

import { Wallet } from "./Wallet";
import { SonicPointsButton } from "./SonicPointsButton";

import { Breadcrumbs } from "@ui";

import { WagmiLayout } from "@layouts";

import "./header.css";

const Header = (): JSX.Element => {
  const $account = useStore(account);
  const $isNavbar = useStore(isNavbar);

  return (
    <WagmiLayout>
      <header className="font-manrope header">
        <div className="flex items-center justify-between w-full h-full pl-0 pr-0 xxl:pl-10 md:pr-10">
          <div className="flex items-center gap-4 h-full">
            <div
              className="min-h-full border-r border-[#232429] xxl:border-r-0 hidden md:block"
              onClick={() => isNavbar.set(!$isNavbar)}
            >
              <img
                src="/icons/sidebar.svg"
                alt="Sidebar logo"
                className="p-4 cursor-pointer min-h-full xxl:hidden"
              />
            </div>

            <a className="xxl:hidden pl-4 md:pl-0" href="/">
              <img src="/long_logo.png" alt="Stability logo" />
            </a>

            <div className="hidden xxl:block">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex justify-end h-full">
            {!!$account && <SonicPointsButton />}
            <Wallet />
            <div
              className="min-h-full block md:hidden"
              onClick={() => isNavbar.set(!$isNavbar)}
            >
              <img
                src="/icons/icon_menu_bottom.svg"
                alt="Menu logo"
                className="p-4 cursor-pointer min-h-full"
              />
            </div>
          </div>
        </div>
        <div className="block xxl:hidden py-3 pl-4 border-b border-[#232429] backdrop-blur-md">
          <Breadcrumbs />
        </div>
      </header>
    </WagmiLayout>
  );
};

export { Header };
