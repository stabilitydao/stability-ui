import { useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { TimeDifferenceIndicator } from "@components";

import { aprFilter, hideFeeApr } from "@store";

import type { TAPRModal } from "@types";

interface IProps {
  state: TAPRModal;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const APRModal: React.FC<IProps> = ({ state, setModalState }) => {
  const modalRef: any = useRef(null);

  const $hideFeeAPR = useStore(hideFeeApr);
  const $aprFilter = useStore(aprFilter);

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setModalState({
        earningData: "",
        daily: 0,
        lastHardWork: 0,
        symbol: "",
        state: false,
      });
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflowY = "unset";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="bg-[#13141f] w-full h-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50] opacity-80"></div>
      <div
        ref={modalRef}
        className={`text-[#fff] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[51] w-[300px] bg-[#26282f] rounded-[10px] ${
          state.symbol === "REKT" || state.symbol === "REKT+"
            ? "h-[400px]"
            : "h-[250px]"
        }`}
      >
        <svg
          onClick={() => {
            setModalState({
              earningData: "",
              daily: 0,
              lastHardWork: 0,
              symbol: "",
              state: false,
            });
          }}
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

        <div className="p-10 flex items-start justify-center flex-col gap-4">
          {state.symbol === "REKT" || state.symbol === "REKT+" ? (
            <div className="flex flex-col items-center gap-2 mb-[10px]">
              <h3 className="text-[#f52a11] font-bold">{state.symbol} VAULT</h3>
              <p className="text-[12px] text-start">
                Rekt vault regularly incurs losses, potentially leading to rapid
                USD value decline, with returns insufficient to offset the
                losses.
              </p>
            </div>
          ) : null}
          <div className="text-[16px] w-full">
            <div className="font-bold flex items-center justify-between mb-1">
              <p>Total APY</p>
              <p className="text-end">
                {$hideFeeAPR
                  ? $aprFilter === "24h"
                    ? state.earningData.apy.withoutFees.daily
                    : $aprFilter === "week"
                    ? state.earningData.apy.withoutFees.weekly
                    : state.earningData.apy.withFees[$aprFilter]
                  : $aprFilter === "24h"
                  ? state.earningData.apy.withFees.daily
                  : $aprFilter === "week"
                  ? state.earningData.apy.withFees.weekly
                  : state.earningData.apy.withFees[$aprFilter]}
                %
              </p>
            </div>

            <div className="font-bold flex items-center justify-between mb-1">
              <p>Total APR</p>
              <p className="text-end">
                {$hideFeeAPR
                  ? $aprFilter === "24h"
                    ? state.earningData.apr.withoutFees.daily
                    : $aprFilter === "week"
                    ? state.earningData.apr.withoutFees.weekly
                    : state.earningData.apr.withoutFees[$aprFilter]
                  : $aprFilter === "24h"
                  ? state.earningData.apr.withFees.daily
                  : $aprFilter === "week"
                  ? state.earningData.apr.withFees.weekly
                  : state.earningData.apr.withFees[$aprFilter]}
                %
              </p>
            </div>
            {state.earningData.poolSwapFeesAPR.daily != "-" && (
              <div className="flex items-center justify-between mb-1">
                <p>Pool swap fees APR</p>
                <p className={`${$hideFeeAPR && "line-through"} text-end`}>
                  {$aprFilter === "24h"
                    ? state.earningData.poolSwapFeesAPR.daily
                    : $aprFilter === "week"
                    ? state.earningData.poolSwapFeesAPR.weekly
                    : state.earningData.poolSwapFeesAPR[$aprFilter]}
                  %
                </p>
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <p>Strategy APR</p>
              <p className="text-end">
                {$aprFilter === "24h"
                  ? state.earningData.farmAPR.daily
                  : $aprFilter === "week"
                  ? state.earningData.farmAPR.weekly
                  : state.earningData.farmAPR[$aprFilter]}
                %
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>Daily yield</p>
              <p className="text-end">
                {$hideFeeAPR
                  ? state.earningData.apr.withoutFees.daily
                  : state.earningData.apr.withFees.daily}
                %
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-[16px]">Last Hard Work</p>
            <TimeDifferenceIndicator unix={state.lastHardWork} />
          </div>
        </div>
      </div>
    </div>
  );
};
export { APRModal };
