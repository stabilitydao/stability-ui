import { useEffect, useRef } from "react";

import { calculateAPY, formatFromBigInt, getTimeDifference } from "@utils";
import type { TAPRModal } from "@types";

interface IProps {
  state: TAPRModal;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const APRModal: React.FC<IProps> = ({ state, setModalState }) => {
  const modalRef: any = useRef(null);

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setModalState({
        apr: "",
        assetsWithApr: "",
        assetsAprs: "",
        lastHardWork: 0,
        strategyApr: 0,
        state: false,
      });
    }
  };
  const APR = formatFromBigInt(state.apr, 16, "withDecimals").toFixed(2);
  const APY = calculateAPY(APR).toFixed(2);
  const strategyAPR = formatFromBigInt(state.strategyApr, 16).toFixed(2);
  const firstAssetAPR = formatFromBigInt(state.assetsAprs[0], 16).toFixed(2);
  const secondAssetAPR = formatFromBigInt(state.assetsAprs[1], 16).toFixed(2);

  const timeDifference = getTimeDifference(state.lastHardWork);

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
        className="text-[#fff] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[51] max-w-[500px] w-full bg-[#1C1D2D] rounded-[10px] h-[300px]"
      >
        <svg
          onClick={() => {
            setModalState({
              apr: "",
              assetsWithApr: "",
              assetsAprs: "",
              lastHardWork: 0,
              strategyApr: 0,
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

        <div className="p-10 flex items-start flex-col gap-4">
          <div className="flex items-center gap-3">
            <p className="text-[16px]">Last Hard Work :</p>
            {timeDifference.days ? (
              <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E]">
                {timeDifference.days}
                {timeDifference.days > 1 ? "days" : "day"}{" "}
                {timeDifference.hours}h ago
              </div>
            ) : (
              <div
                className={`text-[14px] px-2 py-1 rounded-lg border-[2px]  ${
                  timeDifference.hours > 4
                    ? "bg-[#485069] text-[#B4BFDF] border-[#6376AF]"
                    : "bg-[#486556] text-[#B0DDB8] border-[#488B57]"
                }`}
              >
                {timeDifference.hours}h ago
              </div>
            )}
          </div>
          <div className="text-[16px]">
            <p>
              Total APR {APR}% ({APY}% APY)
            </p>
            <p>Strategy APR {strategyAPR}%</p>
            <p>
              {state.assetsWithApr[0]} APR {firstAssetAPR}%
            </p>
            <p>
              {state.assetsWithApr[1]} APR {secondAssetAPR}%
            </p>
          </div>
          <p className="text-[18px] leading-[22px] mb-[30px] text-center">
            The Annual Percentage Rate (APR) for the Vault is equal to the sum
            of the Strategy APR and Underlying APRs
          </p>
        </div>
      </div>
    </div>
  );
};
export { APRModal };
