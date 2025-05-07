import { useStore } from "@nanostores/react";

import { account } from "@store";

import { Wallet } from "./Wallet";
import { SonicPointsButton } from "./SonicPointsButton";

import { Breadcrumbs } from "@ui";

import { WagmiLayout } from "@layouts";

import "./header.css";

const Header = (): JSX.Element => {
  const $account = useStore(account);

  return (
    <WagmiLayout>
      <header className="font-manrope header">
        <div className="flex items-center justify-between w-full h-full px-10">
          <Breadcrumbs />
          <div className="flex justify-end h-full">
            {!!$account && <SonicPointsButton />}
            <Wallet />
          </div>
        </div>
      </header>
    </WagmiLayout>
  );
};

export { Header };
