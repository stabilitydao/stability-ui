import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { vaults, lastTx } from "@store";

import { getTokenData } from "@utils";

import type { TToast } from "@types";

import "./Toast.css";

const Toast = () => {
  const $vaults = useStore(vaults);
  const $lastTx = useStore(lastTx);

  const [isVisible, setIsVisible] = useState(false);
  const [storeTx, setStoreTx] = useState<TToast>({
    hash: "",
    status: "",
    timestamp: 0,
    tokens: {},
    type: "",
    vault: "",
  });
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState<any>(false);
  const [color, setColor] = useState("transparent");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 1) % 101);
    }, 100);

    const timeoutId = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const initialTx = JSON.parse(localStorage.getItem("lastTx") as string);
    if (initialTx) {
      const currentTime = new Date().getTime();
      const lastUpdateTime = initialTx.timestamp || 0;
      const timeDifference = currentTime - lastUpdateTime;
      if (timeDifference < 10000) {
        setStoreTx(initialTx);
        initialTx.status === "success"
          ? setColor("#9FC6A7")
          : setColor("#B34D61");

        const array = Object.entries(
          initialTx.tokens as Record<
            string,
            { amount: string; symbol?: string; logo?: string }
          >
        ).map(([address, { amount, symbol, logo }]) => ({
          address,
          amount: Number(amount).toFixed(4),
          symbol: symbol ? symbol : getTokenData(address)?.symbol,
          logo: logo ? logo : getTokenData(address)?.logoURI,
        }));
        setTokens(array);

        setIsVisible(true);
      }
    }
  }, [$lastTx]);
  return (
    isVisible && (
      <div key={storeTx.hash} className="toast z-[20]">
        <div className="flex flex-col gap-3 px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {storeTx?.status === "success" ? (
                <img
                  src="/success.svg"
                  alt="success"
                  className="w-[30px] h-[30px]"
                />
              ) : (
                <img
                  src="/error.svg"
                  alt="error"
                  className="w-[30px] h-[30px]"
                />
              )}
              <p className="capitalize">{storeTx?.status}</p>
            </div>
            <svg
              onClick={() => setIsVisible(false)}
              className="cursor-pointer self-start"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill={color}
            >
              <g filter="url(#filter0_i_910_1841)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.292893 1.70711C-0.097631 1.31658 -0.097631 0.683417 0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711Z"
                  fill={color}
                />
              </g>
              <defs>
                <filter
                  id="filter0_i_910_1841"
                  x="0"
                  y="0"
                  width="14"
                  height="14"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dx="2" dy="2" />
                  <feGaussianBlur stdDeviation="1" />
                  <feComposite
                    in2="hardAlpha"
                    operator="arithmetic"
                    k2="-1"
                    k3="1"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="shape"
                    result="effect1_innerShadow_910_1841"
                  />
                </filter>
              </defs>
            </svg>
          </div>
          <div className="text-[16px] flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <p className="capitalize-first">{storeTx?.type}</p>{" "}
              <div className="flex flex-col justify-center items-center gap-1">
                {tokens &&
                  tokens.map((token: any) => (
                    <div
                      className="flex items-center gap-1"
                      key={token.address}
                    >
                      <p>{token.amount}</p>
                      <img
                        className="w-5 h-5 rounded-full"
                        src={token.logo}
                        alt={token.symbol}
                      />
                    </div>
                  ))}
              </div>
            </div>
            <a
              target="_blank"
              href={`https://polygonscan.com/address/${storeTx?.vault}`}
              className="underline "
            >
              {$vaults[storeTx?.vault].symbol}
            </a>
          </div>
          <a
            target="_blank"
            href={`https://polygonscan.com/tx/${storeTx?.hash}`}
            className="flex items-center gap-2"
          >
            <p className="text-[16px] font-semibold">View on PolygonScan</p>
            <img src="/link.svg" alt="link" className="w-5 h-5" />
          </a>
        </div>
        <div
          className="progress"
          style={{ width: `${progress}%`, backgroundColor: color }}
        ></div>
      </div>
    )
  );
};

export { Toast };
