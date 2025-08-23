import { useRef } from "react";

import { formatNumber, useModalClickOutside } from "@utils";

import type { TMetaVault } from "@types";

interface IProps {
  metaVault: TMetaVault;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<IProps> = ({ metaVault, setModal }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalClickOutside(modalRef, () => setModal((prev) => !prev));

  return (
    <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative w-[90%] max-w-[400px] max-h-[80vh] overflow-y-auto bg-[#111114] border border-[#232429] rounded-lg"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#232429]">
          <h2 className="text-[18px] leading-6 font-semibold">Total APR</h2>
          <button onClick={() => setModal(false)}>
            <img src="/icons/xmark.svg" alt="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <p className="leading-5 text-[#97979A] font-medium">APR</p>
            <p className="text-end font-semibold">
              {formatNumber(metaVault?.APR, "formatAPR")}%
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
              {formatNumber(metaVault?.merklAPR, "formatAPR")}%
            </p>
          </a>

          {!!metaVault?.gemsAPR && (
            <div className="flex items-center justify-between">
              <p className="leading-5 text-[#97979A] font-medium">sGEM1 APR</p>
              <p className="text-end font-semibold">
                {formatNumber(metaVault?.gemsAPR, "formatAPR")}%
              </p>
            </div>
          )}
          <div className="flex items-center justify-between text-[#2BB656]">
            <p className="leading-5 font-medium">Total APR</p>
            <p className="text-end font-semibold">
              {formatNumber(metaVault?.totalAPR, "formatAPR")}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export { Modal };
