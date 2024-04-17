import { useEffect, useRef } from "react";
import { PROTOCOLS } from "@constants";
import { useStore } from "@nanostores/react";

import packageJson from "../../../package.json";

import { apiData, platformVersion } from "@store";

interface IProps {
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const GitHub: React.FC<{}> = () => {
  return (
    <div className="inline-flex">
    <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.49999 0.562544C5.73427 0.562782 4.02622 1.19122 2.68139 2.33543C1.33657 3.47964 0.442689 5.06499 0.15966 6.80789C-0.123368 8.55078 0.222916 10.3375 1.13657 11.8485C2.05022 13.3595 3.47164 14.4961 5.14655 15.055C5.51843 15.1241 5.6778 14.8957 5.6778 14.6991C5.6778 14.5025 5.6778 14.0563 5.6778 13.4347C3.61124 13.881 3.17562 12.436 3.17562 12.436C3.03029 11.9806 2.72444 11.5936 2.31499 11.3469C1.6403 10.89 2.36812 10.8954 2.36812 10.8954C2.60378 10.9286 2.82872 11.0154 3.02576 11.1489C3.22279 11.2824 3.38671 11.4591 3.50499 11.6657C3.71077 12.0347 4.0547 12.307 4.46115 12.4226C4.86761 12.5381 5.30332 12.4875 5.67249 12.2819C5.70249 11.905 5.86867 11.5519 6.13999 11.2885C4.49312 11.0972 2.75593 10.4597 2.75593 7.61223C2.74389 6.87268 3.01796 6.15705 3.52093 5.61473C3.29327 4.97415 3.31989 4.27066 3.5953 3.64911C3.5953 3.64911 4.21687 3.44723 5.64062 4.40879C6.85796 4.07674 8.14202 4.07674 9.35937 4.40879C10.7778 3.44723 11.3994 3.64911 11.3994 3.64911C11.6748 4.27066 11.7014 4.97415 11.4737 5.61473C11.9767 6.15705 12.2508 6.87268 12.2387 7.61223C12.2387 10.4704 10.5016 11.0972 8.84406 11.2832C9.02161 11.4631 9.15853 11.6791 9.24559 11.9164C9.33264 12.1538 9.36782 12.407 9.34874 12.6591C9.34874 13.6525 9.34874 14.4547 9.34874 14.6991C9.34874 14.9435 9.48155 15.1294 9.87999 15.055C11.5571 14.4954 12.98 13.3566 13.8935 11.8428C14.807 10.3291 15.1514 8.5394 14.8649 6.79474C14.5784 5.05007 13.6797 3.46454 12.33 2.32245C10.9804 1.18037 9.26801 0.556436 7.49999 0.562544Z"
              fill="gray"
            ></path>
          </svg>
          </div>
  )
}

const PlatformModal: React.FC<IProps> = ({ setModalState }) => {
  const modalRef: any = useRef(null);

  const $platformVersion = useStore(platformVersion);
  const $apiData = useStore(apiData);

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setModalState(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setModalState(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflowY = "unset";
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div>
      <div className="bg-[#13141f] w-full h-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50] opacity-80"></div>
      <div
        ref={modalRef}
        className="text-[#fff] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[51] bg-modal rounded-[10px] h-min-[250px] w-[320px] md:w-[420px]"
      >
        <svg
          onClick={() => {
            setModalState(false);
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
        <div className="px-6 py-8 flex items-start justify-center">
          <div className="text-[12px] sm:text-[16px] w-full">
            <div className="flex flex-col mb-2">
              <span className="text-[#848E9C]">Smart contracts</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/stabilitydao/stability-contracts"
                  target="_blank"
                  title="Smart contracts source code"
                  className="inline-flex"
                ><GitHub /></a><span>Stability Platform v{$platformVersion}</span>
              </div>
              
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-[#848E9C]">Strategies</span>
              <div className="flex flex-wrap">
              {Object.keys(PROTOCOLS).map((p, index) => {
                const protocol = PROTOCOLS[p]
                return (
                  <img
                    key={protocol?.name + index}
                    className="w-6 h-6 rounded-full m-1"
                    src={protocol?.logoSrc}
                    alt={protocol?.name}
                    title={protocol?.name}
                />
              )
              })}
              </div>
              
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-[#848E9C]">User Interface</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/stabilitydao/stability-ui"
                  target="_blank"
                  title="User interface source code"
                  className="inline-flex"
                ><GitHub /></a>
                <span>stability-ui v{packageJson.version}</span>
              </div>
              
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-[#848E9C]">API</span>
              <span>{$apiData?.about}</span>
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-[#848E9C]">Subgraph</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/stabilitydao/stability-subgraph"
                  target="_blank"
                  title="Subgraph source code"
                  className="inline-flex"
                ><GitHub /></a>
                <a
                target="_blank"
                href="https://thegraph.com/hosted-service/subgraph/jodsmigel/stability"
              >
                jodsmigel/stability
              </a>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export { PlatformModal };
