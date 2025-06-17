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

const MetaAPRModal: React.FC<IProps> = ({ state, setModalState }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <p className="leading-5 text-[#97979A] font-medium">APR</p>
            <p className="text-end font-semibold">
              {formatNumber(state.APR, "formatAPR")}%
            </p>
          </div>
          <a
            className="flex items-center justify-between"
            href="https://app.merkl.xyz/users/"
            target="_blank"
          >
            <div className="flex items-center gap-2">
              <p className="leading-5 text-[#97979A] font-medium">Merkl APR</p>
              <img
                src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Merkl.svg"
                alt="Merkl"
                className="w-6 h-6"
              />
            </div>
            <p className="text-end font-semibold">
              {formatNumber(state.merklAPR, "formatAPR")}%
            </p>
          </a>
          <div className="flex items-center justify-between">
            <p className="leading-5 text-[#97979A] font-medium">sGEM1 APR</p>
            <p className="text-end font-semibold">
              {formatNumber(state.gemsAPR, "formatAPR")}%
            </p>
          </div>
          <div className="flex items-center justify-between text-[#2BB656]">
            <p className="leading-5 font-medium">Total APR</p>
            <p className="text-end font-semibold">
              {formatNumber(state.totalAPR, "formatAPR")}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MetaAPRModal };
