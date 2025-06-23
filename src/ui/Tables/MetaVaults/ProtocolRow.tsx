import { useState } from "react";

import {
  ArrowIcon,
  TimeDifferenceIndicator,
  StrategyBadge,
  ArrowRightIcon,
} from "@ui";

import { cn, formatNumber } from "@utils";

interface IProps {
  protocol: any;
  activeProtocol: any;
}

const ProtocolRow: React.FC<IProps> = ({ protocol, activeProtocol }) => {
  const [expandedData, setExpandedData] = useState(false);

  const isDimmed =
    activeProtocol?.isHovered && activeProtocol.name !== protocol.name;

  return (
    <div className={cn("border border-[#23252A] border-b-0")}>
      <a
        className={cn(
          "text-center bg-[#101012] h-[56px] font-medium relative flex items-center cursor-default min-[860px]:cursor-pointer",
          isDimmed ? "opacity-30" : "opacity-100"
        )}
        href="#"
        onClick={(e) => {
          if (window.innerWidth <= 860) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div className="flex items-center w-full min-[860px]:w-[50%] justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img
                className="w-8 h-8 rounded-full flex-shrink-0"
                src={
                  protocol.name === "Aave V3"
                    ? "/logo_dark.png"
                    : protocol.logoSrc
                }
                alt="logo"
              />
            </div>
            <span
              className="font-semibold text-[16px] truncate overflow-hidden whitespace-nowrap max-w-[200px] min-[860px]:max-w-full"
              title={protocol.name === "Aave V3" ? "Stability" : protocol.name}
            >
              {protocol.name === "Aave V3" ? "Stability" : protocol.name}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 flex-shrink-0">
            <div className="block min-[860px]:hidden ml-2">
              <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
            </div>
          </div>
        </div>
        <div className="px-4 w-[20%] hidden min-[860px]:block">
          <p className="text-[16px] whitespace-nowrap text-end">
            {formatNumber(protocol.allocation, "format")}
          </p>
        </div>
        <div className="px-4 text-right text-[16px] w-[30%] hidden min-[860px]:block">
          <span>{protocol.value.toFixed(2)}%</span>
        </div>
      </a>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 bg-[#18191c] border-t border-[#23252A] min-[860px]:hidden">
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Allocation
            </span>
            <p className="text-[16px] whitespace-nowrap text-end">
              {formatNumber(protocol.allocation, "format")}
            </p>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Percent
            </span>
            <span>{protocol.value.toFixed(2)}%</span>
          </div>

          {/* <a
            href={
              vault?.isMetaVault
                ? `/metavaults/metavault/${vault.address}`
                : `/vaults/vault/${vault.network}/${vault.address}`
            }
            className="text-[#816FEA] text-[14px] leading-4 font-medium flex items-center justify-end gap-1 w-full mt-1"
          >
            {vault?.isMetaVault ? "View Meta Vault" : "View Vault"}
            <ArrowRightIcon />
          </a> */}
        </div>
      ) : null}
    </div>
  );
};

export { ProtocolRow };
