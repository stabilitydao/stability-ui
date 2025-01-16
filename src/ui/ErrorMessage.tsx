import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { error, reload } from "@store";

import { CHAINS } from "@constants";

import { deployments } from "@stabilitydao/stability";

interface IProps {
  type: string;
  isAlert?: boolean;
  onlyForChainId?: number;
}

const ErrorMessage: React.FC<IProps> = ({
  type,
  isAlert = false,
  onlyForChainId = 0,
}) => {
  const $error = useStore(error);
  const $reload = useStore(reload);

  const [chainId, setChainId] = useState("");
  const [chainLogo, setChainLogo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if ($error.state) {
      const message = $error.description?.message ?? $error.description;

      const slicedMessage = `${message?.slice(0, 40)}...`;

      if (type === "WEB3") {
        const errorChain = Object.entries(deployments).find(([_, deployment]) =>
          Object.entries(deployment.core).some(([_, value]) =>
            message.includes(value)
          )
        );
        if (errorChain) {
          const [chainID, deployment] = errorChain;

          const contractName = Object.entries(deployment.core).find(
            ([_, value]) => message.includes(value)
          )?.[0];

          const chainImg =
            CHAINS.find((chain) => chain.id === chainID)?.logoURI || "";

          const contractErrorMessage = contractName
            ? `${contractName}: ${slicedMessage}`
            : slicedMessage;
          setChainId(chainID);
          setChainLogo(chainImg);
          setErrorMessage(contractErrorMessage);
        } else {
          setErrorMessage(slicedMessage);
        }
      } else {
        setErrorMessage(slicedMessage);
      }
    }
  }, [$error, type]);

  if (
    $error.state &&
    (!onlyForChainId || onlyForChainId.toString() === chainId.toString())
  ) {
    return (
      <div
        className={`flex items-center justify-center bg-accent-950 text-neutral-50 font-manrope text-[16px] w-full rounded-[32px] ${isAlert ? "relative" : "fixed top-0 left-1/2 transform -translate-x-1/2 max-w-[700px] flex-col mt-3 z-[200]"}`}
      >
        <svg
          onClick={() => error.set({ state: false, type: "", description: "" })}
          className="absolute right-5 top-5 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <g filter="url(#filter0_i_910_1841)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.292893 1.70711C-0.097631 1.31658 -0.097631 0.683417 0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711Z"
              fill="white"
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
        <img
          className="absolute left-5 top-5"
          src="/triangle-alert.png"
          alt="alert-img"
        />
        <div
          className={`${isAlert ? "py-4" : "py-8"} px-3 flex items-center gap-1 mt-5 md:mt-0`}
        >
          {!!chainLogo && (
            <img src={chainLogo} alt="chain-img" className="w-6 h-6" />
          )}
          <span>{errorMessage}</span>
        </div>
        <button
          onClick={() => reload.set(!$reload)}
          className={`bg-accent-500 font-semibold py-2 min-w-[100px] rounded-2xl ${isAlert ? "" : "mb-2"}`}
        >
          Reload
        </button>
      </div>
    );
  }
};

export { ErrorMessage };
