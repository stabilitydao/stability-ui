import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { vaults, lastTx } from "@store";

import type { TLocalStorageToken, TToast } from "@types";

import "./Toast.css";

import { CHAINS } from "@constants";

const Toast = (): JSX.Element | null => {
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
          ? setColor("#59CB59")
          : setColor("#B34D61");

        const array = Object.entries(
          initialTx.tokens as Record<string, TLocalStorageToken>
        ).map(([address, { amount, symbol, logo }]) => ({
          address,
          amount: Number(amount).toFixed(4),
          symbol,
          logo,
        }));

        setTokens(array);
        setIsVisible(true);
      }
    }
  }, [$lastTx]);

  // const explorer = useMemo(() => {
  //   return CHAINS.find((chain) => chain.id === network)?.explorer;
  // }, [network]);

  const explorer = CHAINS["146"]?.explorer;

  if (isVisible && $vaults) {
    return (
      <div key={storeTx.hash} className="toast z-[30]">
        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {storeTx?.status === "success" ? (
                <img
                  src="/icons/success.png"
                  alt="success"
                  className="w-[18px] h-[18px]"
                />
              ) : (
                <img
                  src="/icons/failed.png"
                  alt="error"
                  className="w-[18px] h-[18px]"
                />
              )}
              <p className="capitalize leading-5 text-[14px]">
                {storeTx?.status}
              </p>
            </div>
            <svg
              onClick={() => setIsVisible(false)}
              className="cursor-pointer self-start"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="#7C7E81"
            >
              <g filter="url(#filter0_i_910_1841)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.292893 1.70711C-0.097631 1.31658 -0.097631 0.683417 0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711Z"
                  fill="#7C7E81"
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
              <p className="capitalize-first text-[#7C7E81]">{storeTx?.type}</p>
              <div className="flex flex-col justify-center items-center gap-1">
                {tokens &&
                  tokens.map((token: TLocalStorageToken) => (
                    <div className="flex items-center gap-1" key={token.amount}>
                      <p className="text-[#7C7E81]">{token.amount}</p>
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
              href={`${explorer}/address/${storeTx?.vault}`}
              className="underline"
            >
              {$vaults["146"][storeTx?.vault]?.symbol}
            </a>
          </div>
          <a
            target="_blank"
            href={`${explorer}/tx/${storeTx?.hash}`}
            className="flex items-center gap-2"
          >
            <p className="text-[16px] font-semibold">View on block explorer</p>
            <img src="/link.svg" alt="link" className="w-5 h-5" />
          </a>
        </div>
        <div
          className="progress"
          style={{ width: `${progress}%`, backgroundColor: color }}
        ></div>
      </div>
    );
  }
  return null;
};

export { Toast };
