import { useState, useEffect, useRef } from "react";

import { formatUnits } from "viem";

import { useStore } from "@nanostores/react";

import { assetsPrices } from "@store";

import { getTokenData, formatNumber } from "@utils";

import { WBTC, WETH, WMATIC } from "@constants";

type TToken = {
  logo: string;
  price: string;
};

const PriceWidget = () => {
  const $assetsPrices = useStore(assetsPrices);

  const [widget, setWidget] = useState<boolean>(false);
  const [tokens, setTokens] = useState<TToken[]>([]);

  useEffect(() => {
    if ($assetsPrices) {
      const BTC_LOGO = getTokenData(WBTC[0])?.logoURI as string;
      const ETH_LOGO = getTokenData(WETH[0])?.logoURI as string;
      const MATIC_LOGO = getTokenData(WMATIC[0])?.logoURI as string;

      const BTC_PRICE = formatNumber(
        formatUnits($assetsPrices[WBTC[0]], 18),
        "format"
      ) as string;

      const ETH_PRICE = formatNumber(
        formatUnits($assetsPrices[WETH[0]], 18),
        "format"
      ) as string;

      const MATIC_PRICE = formatNumber(
        formatUnits($assetsPrices[WMATIC[0]], 18),
        "format"
      ) as string;

      setTokens([
        { logo: BTC_LOGO, price: BTC_PRICE },
        { logo: ETH_LOGO, price: ETH_PRICE },
        { logo: MATIC_LOGO, price: MATIC_PRICE },
      ]);
    }
  }, [$assetsPrices]);

  return (
    !!tokens && (
      <div
        onClick={() => setWidget((prev) => !prev)}
        className="text-[#fff] fixed top-1/2 transform -translate-y-1/2 bg-button rounded-sm z-50 cursor-pointer"
      >
        <div className="flex items-center px-3 py-2 left-5">
          <div className={`flex flex-col gap-3 ${widget ? "" : "hidden"}`}>
            {!!tokens &&
              tokens.map((token) => (
                <div key={token.logo} className="flex items-center gap-2">
                  <img
                    src={token.logo}
                    alt="logo"
                    className="w-6 h-6 rounded-full"
                  />
                  <p className="text-[#848e9c] text-[18px]">${token.price}</p>
                </div>
              ))}
          </div>
          <div className={widget ? "rotate-180" : ""}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 18L18 12L12 6" stroke="white" />
              <path d="M6 18L12 12L6 6" stroke="white" />
            </svg>
          </div>
        </div>
      </div>
    )
  );
};

export { PriceWidget };
