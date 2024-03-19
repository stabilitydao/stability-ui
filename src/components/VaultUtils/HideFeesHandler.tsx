import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { hideFeeApr } from "@store";

interface IProps {
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const HideFeesHandler: React.FC<IProps> = ({ setModalState }) => {
  const $hideFeeAPR = useStore(hideFeeApr);
  const [hideFee, setHideFee] = useState($hideFeeAPR);

  useEffect(() => {
    localStorage.setItem("hideFeeAPR", JSON.stringify(hideFee));
    hideFeeApr.set(hideFee);
  }, [hideFee]);

  return (
    <button
      onClick={() => setHideFee((prev) => !prev)}
      className="bg-[#262830] rounded-md"
    >
      <div className="flex items-center justify-center gap-2 px-2 h-[30px]">
        {hideFee ? (
          <div className="w-[10px] h-[10px] rounded-full blur-[2px] bg-[#FFB800]"></div>
        ) : (
          <div className="w-[10px] h-[10px] rounded-full blur-[2px] bg-[#443C28]"></div>
        )}
        <p className="text-[12px]">Hide swap fees</p>

        <div className="tooltip">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-1 cursor-pointer opacity-40 hover:opacity-100 transition delay-[40ms] tooltip"
            onClick={(e) => {
              e.stopPropagation();
              setModalState(true);
            }}
          >
            <circle cx="8" cy="8" r="7.5" stroke="white" />
            <path
              d="M7.34516 9.37249V9.3266C7.35011 8.83967 7.39958 8.45216 7.49359 8.16408C7.58759 7.876 7.72117 7.64273 7.89433 7.46427C8.06749 7.28581 8.27528 7.12138 8.5177 6.97096C8.66365 6.87918 8.79476 6.77083 8.91103 6.64591C9.02729 6.51844 9.11882 6.37185 9.18561 6.20614C9.25487 6.04043 9.2895 5.85688 9.2895 5.65547C9.2895 5.40563 9.23261 5.18893 9.11882 5.00538C9.00503 4.82182 8.85289 4.68033 8.66242 4.5809C8.47194 4.48148 8.26044 4.43176 8.02791 4.43176C7.82506 4.43176 7.62964 4.4751 7.44164 4.56178C7.25364 4.64846 7.09655 4.78485 6.9704 4.97096C6.84424 5.15707 6.77126 5.40053 6.75147 5.70136H5.81641C5.8362 5.26797 5.94504 4.89703 6.14294 4.58855C6.34331 4.28007 6.60676 4.04426 6.93329 3.88109C7.26229 3.71793 7.62717 3.63635 8.02791 3.63635C8.46328 3.63635 8.84176 3.72558 9.16335 3.90404C9.4874 4.0825 9.73725 4.32724 9.91288 4.63826C10.091 4.94929 10.18 5.30366 10.18 5.70136C10.18 5.9818 10.138 6.23546 10.0539 6.46236C9.97225 6.68925 9.85351 6.89193 9.69767 7.07039C9.5443 7.24884 9.35877 7.40691 9.14108 7.54457C8.92339 7.68479 8.749 7.83266 8.61789 7.98817C8.48678 8.14113 8.39155 8.32341 8.33218 8.53501C8.27281 8.74661 8.24065 9.01048 8.2357 9.3266V9.37249H7.34516ZM7.82012 11.6364C7.63706 11.6364 7.47998 11.5688 7.34887 11.4337C7.21777 11.2986 7.15221 11.1367 7.15221 10.948C7.15221 10.7594 7.21777 10.5975 7.34887 10.4624C7.47998 10.3272 7.63706 10.2597 7.82012 10.2597C8.00317 10.2597 8.16025 10.3272 8.29136 10.4624C8.42247 10.5975 8.48802 10.7594 8.48802 10.948C8.48802 11.0729 8.4571 11.1877 8.39526 11.2922C8.33589 11.3967 8.25549 11.4808 8.15407 11.5446C8.05512 11.6058 7.9438 11.6364 7.82012 11.6364Z"
              fill="white"
            />
          </svg>
          <div className="visible__tooltip toLeft">
            <div className="flex items-start flex-col">
              <p className="text-[14px] flex flex-col gap-1 w-full text-left">
                During times of high volatility, the majority of pool swap fees
                may be used to cover Impermanent Losses (IL) once ALMs rebalance
                positions. Excluding swap fees income from profitability
                calculations can sometimes show more realistic APRs.
              </p>
            </div>
            <i></i>
          </div>
        </div>
      </div>
    </button>
  );
};

export { HideFeesHandler };
