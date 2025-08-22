import { useRef } from "react";

import { useModalClickOutside, formatTimestampToDate } from "@utils";

import type { IProtocolModal } from "@types";

interface IProps {
  modal: IProtocolModal;
  setModal: React.Dispatch<React.SetStateAction<IProtocolModal>>;
}

const ProtocolModal: React.FC<IProps> = ({ modal, setModal }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalClickOutside(modalRef, () =>
    setModal((prev) => ({ ...prev, state: false }))
  );

  return (
    <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative w-[90%] max-w-[400px] max-h-[80vh] overflow-y-auto bg-[#111114] border border-[#232429] rounded-lg"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#232429]">
          <h2 className="text-[18px] leading-6 font-semibold">
            {modal.type === "audits" ? "Audits" : "Accidents"}
          </h2>
          <button onClick={() => setModal({ ...modal, state: false })}>
            <img src="/icons/xmark.svg" alt="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4 text-[12px]">
          {!!modal?.audits.length && modal.type === "audits"
            ? modal?.audits.map(({ name, url }) => (
                <a
                  key={name + url}
                  href={url}
                  target="_blank"
                  className="text-[#97979A] flex items-center gap-1"
                >
                  <img src="/icons/link.png" alt="link" className="w-3 h-3" />
                  <span>{name}</span>
                </a>
              ))
            : null}
          {!!modal?.accidents.length && modal.type === "accidents"
            ? modal?.accidents.map(({ name, url, date }) => (
                <a
                  key={name + url}
                  href={url}
                  target="_blank"
                  className="text-[#97979A] flex items-center gap-1"
                >
                  <img src="/icons/link.png" alt="link" className="w-3 h-3" />
                  <span>
                    {name} ({formatTimestampToDate(date, true)})
                  </span>
                </a>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};
export { ProtocolModal };
