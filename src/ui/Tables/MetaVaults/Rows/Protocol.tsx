import { useState } from "react";

import { ArrowIcon } from "@ui";

import { cn, formatNumber, getTimeDifference } from "@utils";

import { IProtocol, IProtocolModal } from "@types";

interface IProps {
  isProDisplay: boolean;
  protocol: IProtocol;
  activeProtocol: any;
  setModalState: React.Dispatch<React.SetStateAction<IProtocolModal>>;
}

const Protocol: React.FC<IProps> = ({
  isProDisplay,
  protocol,
  activeProtocol,
  setModalState,
}) => {
  const [expandedData, setExpandedData] = useState(false);

  const lifetime = getTimeDifference(protocol.creationDate, true);

  const isDimmed =
    activeProtocol?.isHovered && activeProtocol.name !== protocol.name;

  return (
    <div className="border-t border-[#23252A]">
      <div
        className={cn(
          "text-center bg-[#101012] h-[56px] font-medium relative flex items-center",
          isDimmed ? "opacity-30" : "opacity-100"
        )}
        onClick={(e) => {
          if (!isProDisplay && window.innerWidth <= 860) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4",
            isProDisplay
              ? "sticky bg-[#101012] lg:bg-transparent top-0 left-0 z-10 h-[56px] w-[100px] border-r border-[#23252A] md:border-r-0 md:w-[30%]"
              : "w-full md:w-[30%]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img
                className={cn(
                  "rounded-full flex-shrink-0",
                  isProDisplay ? "w-5 h-5 md:w-8 md:h-8" : "w-8 h-8"
                )}
                src={
                  protocol.name.includes("Aave")
                    ? "/logo_dark.png"
                    : protocol.logoSrc
                }
                alt="logo"
              />
            </div>

            <span
              className={cn(
                "font-semibold truncate overflow-hidden whitespace-nowrap max-w-[200px] md:max-w-full",
                isProDisplay ? "text-[12px] md:text-[16px]" : " text-[16px]"
              )}
              title={
                protocol.name.includes("Aave") ? "Stability" : protocol.name
              }
            >
              {protocol.name.includes("Aave") ? "Stability" : protocol.name}
            </span>
          </div>
          {!isProDisplay && (
            <div className="flex items-center justify-center gap-1 flex-shrink-0">
              <div className="block md:hidden ml-2">
                <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
              </div>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-[10%] px-4 text-[14px]",
            isProDisplay
              ? "flex items-center gap-1 w-[100px] md:w-[10%]"
              : "hidden md:flex items-center gap-1"
          )}
        >
          {!!lifetime?.years && (
            <span className="text-start">{lifetime?.years}y</span>
          )}
          <span className="text-start">{lifetime?.days}d</span>
        </div>
        <div
          onClick={() => {
            !!protocol?.audits.length &&
              setModalState({ ...protocol, state: true, type: "audits" });
          }}
          className={cn(
            "w-[10%] px-4 text-[16px]",
            isProDisplay
              ? "w-[100px] md:w-[10%] flex items-center gap-1"
              : "hidden md:flex items-center gap-1",
            !protocol?.audits.length
              ? "opacity-0 cursor-default"
              : "cursor-help"
          )}
        >
          <img src="/icons/question_mark.svg" alt="question_mark" />{" "}
          <span className="text-start">{protocol?.audits.length}</span>
        </div>
        <div
          onClick={() => {
            !!protocol?.accidents.length &&
              setModalState({ ...protocol, state: true, type: "accidents" });
          }}
          className={cn(
            "w-[10%] px-4 text-[16px]",
            isProDisplay
              ? "w-[100px] md:w-[10%] flex items-center gap-1"
              : "hidden md:flex items-center gap-1",
            !protocol?.accidents.length
              ? "opacity-0 cursor-default"
              : "cursor-help"
          )}
        >
          <img src="/icons/question_mark.svg" alt="question_mark" />{" "}
          <span className="text-start">{protocol?.accidents.length}</span>
        </div>
        <div
          className={cn(
            "px-4 w-[20%]",
            isProDisplay
              ? "w-[100px] md:w-[20%] flex justify-end"
              : "hidden md:block"
          )}
        >
          <span className="text-[16px] whitespace-nowrap text-end">
            {formatNumber(protocol?.allocation ?? 0, "abbreviate")?.slice(1)}
          </span>
        </div>
        <div
          className={cn(
            "px-4 text-right text-[16px] w-[20%]",
            isProDisplay ? "w-[100px] md:w-[20%]" : "hidden md:block"
          )}
        >
          <span>{protocol?.value?.toFixed(2)}%</span>
        </div>
      </div>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 bg-[#18191c] border-t border-[#23252A] md:hidden">
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Allocation
            </span>
            <span className="text-[16px] whitespace-nowrap text-end">
              {formatNumber(protocol?.allocation ?? 0, "abbreviate")?.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Lifetime
            </span>
            <div className="flex items-center cursor-help text-[16px] whitespace-nowrap text-end gap-1">
              {!!lifetime?.years && (
                <span className="text-start">{lifetime?.years}y</span>
              )}
              <span className="text-start">{lifetime?.days}d</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Audits
            </span>
            <div
              className="flex items-center cursor-help text-[16px] whitespace-nowrap text-end"
              onClick={() => {
                !!protocol?.audits.length &&
                  setModalState({ ...protocol, state: true, type: "audits" });
              }}
            >
              <img src="/icons/question_mark.svg" alt="question_mark" />
              <span className="text-start">{protocol?.audits.length}</span>
            </div>
          </div>
          {!!protocol?.accidents.length && (
            <div className="flex items-center justify-between w-full">
              <span className="text-[#909193] text-[14px] leading-5 font-medium">
                Accidents
              </span>
              <div
                className="flex items-center cursor-help text-[16px] whitespace-nowrap text-end"
                onClick={() => {
                  setModalState({
                    ...protocol,
                    state: true,
                    type: "accidents",
                  });
                }}
              >
                <img src="/icons/question_mark.svg" alt="question_mark" />
                <span className="text-start">{protocol?.accidents.length}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Proportion
            </span>
            <span className="text-[16px] whitespace-nowrap text-end">
              {protocol?.value?.toFixed(2)}%
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { Protocol };
