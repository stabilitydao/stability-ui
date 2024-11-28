import { useEffect, useRef } from "react";

import type { TVsHoldModal, THoldData } from "@types";

interface IProps {
  state: TVsHoldModal;
  setModalState: React.Dispatch<React.SetStateAction<TVsHoldModal>>;
}

const VSHoldModal: React.FC<IProps> = ({ state, setModalState }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setModalState({
        assetsVsHold: [],
        lifetimeVsHold: 0,
        vsHoldAPR: 0,
        created: 0,
        state: false,
        isVsActive: false,
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
        className="text-[#fff] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[51] w-full max-w-[450px] bg-[#26282f] rounded-[10px] h-[200px]"
      >
        <svg
          onClick={() => {
            setModalState({
              assetsVsHold: [],
              lifetimeVsHold: 0,
              vsHoldAPR: 0,
              created: 0,
              state: false,
              isVsActive: false,
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
        <div className=" px-5 py-10 md:p-10 flex items-start justify-center">
          <table className="table table-auto w-full rounded-lg">
            <thead className="bg-[#0b0e11]">
              <tr className="text-[16px] text-[#8f8f8f] uppercase">
                <th></th>
                <th>{state.created} days</th>
                <th className="text-right">est Annual</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              <tr className="hover:bg-[#2B3139]">
                <td className="text-left">VAULT VS HODL</td>

                {state.isVsActive ? (
                  <td
                    className={`text-right ${
                      state.lifetimeVsHold > 0
                        ? "text-[#b0ddb8]"
                        : "text-[#eb7979]"
                    }`}
                  >
                    {state.lifetimeVsHold > 0 ? "+" : ""}
                    {state.lifetimeVsHold}%
                  </td>
                ) : (
                  <td className="text-right">-</td>
                )}

                {state.isVsActive ? (
                  <td
                    className={`text-right ${
                      state.vsHoldAPR > 0 ? "text-[#b0ddb8]" : "text-[#eb7979]"
                    }`}
                  >
                    {state.vsHoldAPR > 0 ? "+" : ""}
                    {state.vsHoldAPR}%
                  </td>
                ) : (
                  <td className="text-right">-</td>
                )}
              </tr>

              {state.assetsVsHold.map((aprsData: THoldData, index: number) => (
                <tr key={index} className="hover:bg-[#2B3139]">
                  <td className="text-left">
                    VAULT VS {aprsData?.symbol} HODL
                  </td>

                  {state.isVsActive ? (
                    <td
                      className={`text-right ${
                        Number(aprsData.latestAPR) > 0
                          ? "text-[#b0ddb8]"
                          : "text-[#eb7979]"
                      }`}
                    >
                      {Number(aprsData.latestAPR) > 0 ? "+" : ""}
                      {aprsData.latestAPR}%
                    </td>
                  ) : (
                    <td className="text-right">-</td>
                  )}

                  {state.isVsActive ? (
                    <td
                      className={`text-right ${
                        Number(aprsData.latestAPR) > 0
                          ? "text-[#b0ddb8]"
                          : "text-[#eb7979]"
                      }`}
                    >
                      {Number(aprsData.APR) > 0 ? "+" : ""}
                      {aprsData.APR}%
                    </td>
                  ) : (
                    <td className="text-right">-</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export { VSHoldModal };
