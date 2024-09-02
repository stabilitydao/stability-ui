import { DEFAULT_ERROR } from "@constants";

import type { TError } from "@types";

interface IProps {
  error: TError;
  setError: React.Dispatch<React.SetStateAction<TError>>;
}

const InvestError: React.FC<IProps> = ({ error, setError }) => {
  return (
    <div className="bg-[#734950] border border-[#b75457] rounded-sm mt-5 relative">
      <div className="px-2 py-2 flex items-center justify-center flex-col">
        <div className="flex items-center justify-between w-full">
          <svg
            width="24"
            height="21"
            viewBox="0 0 24 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M23.2266 17.7266L13.8516 1.4375C13.1484 0.226562 11.3125 0.1875 10.6094 1.4375L1.23438 17.7266C0.53125 18.9375 1.42969 20.5 2.875 20.5H21.5859C23.0312 20.5 23.9297 18.9766 23.2266 17.7266ZM12.25 14.3281C13.2266 14.3281 14.0469 15.1484 14.0469 16.125C14.0469 17.1406 13.2266 17.9219 12.25 17.9219C11.2344 17.9219 10.4531 17.1406 10.4531 16.125C10.4531 15.1484 11.2344 14.3281 12.25 14.3281ZM10.5312 7.88281C10.4922 7.60938 10.7266 7.375 11 7.375H13.4609C13.7344 7.375 13.9688 7.60938 13.9297 7.88281L13.6562 13.1953C13.6172 13.4688 13.4219 13.625 13.1875 13.625H11.2734C11.0391 13.625 10.8438 13.4688 10.8047 13.1953L10.5312 7.88281Z"
              fill="#DE2E2E"
            />
          </svg>
          <p className="text-[18px] text-[#f2aeae]">{error?.type}</p>
          <svg
            width="16"
            height="16"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer"
            onClick={() => setError(DEFAULT_ERROR)}
          >
            <g filter="url(#filter0_i_910_1842)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.292893 1.70711C-0.097631 1.31658 -0.097631 0.683417 0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711Z"
                fill="white"
              />
            </g>
            <defs>
              <filter
                id="filter0_i_910_1842"
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
                  result="effect1_innerShadow_910_1842"
                />
              </filter>
            </defs>
          </svg>
        </div>
        <p className="text-[16px] max-w-[400px] text-[#f2aeae] break-words">
          {error?.description}
        </p>
      </div>
    </div>
  );
};
export { InvestError };
