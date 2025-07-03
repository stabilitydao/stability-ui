import { useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { TimeDifferenceIndicator } from "@ui";

import { formatNumber } from "@utils";

import { aprFilter } from "@store";

import type { TAPRModal, TEarningData } from "@types";

interface IProps {
  state: TAPRModal;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const APRModal: React.FC<IProps> = ({ state, setModalState }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const $aprFilter = useStore(aprFilter);

  const totalAPYValue = state?.earningData?.apy[$aprFilter] || "0";

  const totalAPRValue = state?.earningData?.apr[$aprFilter];

  const swapFeesAPRValue = state.earningData.poolSwapFeesAPR[$aprFilter];

  const strategyAPRValue = state.earningData.farmAPR[$aprFilter];

  const dailyAPRValue = (
    Number(state.earningData.apr[$aprFilter]) / 365
  ).toFixed(2);

  const gemsAPR = formatNumber(
    state.earningData.gemsAPR[$aprFilter],
    "formatAPR"
  );

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setModalState({
        earningData: {} as TEarningData,
        daily: 0,
        lastHardWork: "",
        symbol: "",
        state: false,
        pool: {},
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="bg-[#13141f] w-full h-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50] opacity-80"></div>
      <div
        ref={modalRef}
        className="text-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[51] w-[345px] bg-[#1C1D1F] border border-[#383B42] rounded-lg"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#383B42]">
          <span className="text-[16px] leading-5 font-medium">Total APR</span>
          <img
            src="/icons/xmark.svg"
            alt="xmark"
            className="bg-[#27292F] p-[6px] rounded-full cursor-pointer"
            onClick={() => {
              setModalState({
                earningData: {} as TEarningData,
                daily: 0,
                lastHardWork: "",
                symbol: "",
                state: false,
                pool: {},
              });
            }}
          />
        </div>
        <div className="p-4 flex items-start justify-center flex-col gap-2">
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

          <div className="text-[14px] leading-5 w-full flex justify-between flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-[#97979A] font-medium">Total APY</p>
              <p className="text-end font-semibold">{totalAPYValue}%</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[#97979A] font-medium">Total APR</p>
              <p className="text-end font-semibold">{totalAPRValue}%</p>
            </div>
            {state.earningData.poolSwapFeesAPR.daily != "-" &&
              !!state?.pool && (
                <div className="flex items-center justify-between">
                  <p className="text-[#97979A] font-medium">
                    Pool swap fees APR
                  </p>
                  <p className="text-end font-semibold">{swapFeesAPRValue}%</p>
                </div>
              )}
            <div className="flex items-center justify-between">
              <p className="text-[#97979A] font-medium">Strategy APR</p>
              <p className="text-end font-semibold">{strategyAPRValue}%</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#97979A] font-medium">Daily yield</p>
              <p className="text-end font-semibold">{dailyAPRValue}%</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#97979A] font-medium">Gems APR</p>
              <p className="text-end font-semibold"> {gemsAPR}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-[#97979A] font-medium text-[14px] leading-5">
              Last Hard Work
            </p>
            <TimeDifferenceIndicator unix={state.lastHardWork} />
          </div>
        </div>
      </div>
    </div>
  );
};
export { APRModal };
