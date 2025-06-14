import { cn } from "@utils";

import { STABILITY_AAVE_POOLS, STABILITY_STRATEGY_LABELS } from "@constants";

import { IStrategyInfo } from "@types";

interface IProps {
  info: IStrategyInfo;
  specific: string;
}

const StrategyBadge: React.FC<IProps> = ({ info, specific }) => {
  const matchedAddress = STABILITY_AAVE_POOLS.find((addr) =>
    specific.includes(addr)
  );

  const isStabilityLogo = !!matchedAddress;

  const strategySpecific = matchedAddress
    ? STABILITY_STRATEGY_LABELS[matchedAddress]
    : specific.includes("0xb38d..97b8")
      ? "MEV Capital"
      : specific.includes("0xeeb1..cb6c")
        ? "Re7 Labs"
        : specific;

  return (
    <div className="flex items-center text-[12px]">
      {info && (
        <div
          style={{
            backgroundColor: info.bgColor + "66",
            border: `1px solid ${info.bgColor}`,
          }}
          className="px-2 rounded-[4px] h-6 flex items-center gap-1"
        >
          <span
            style={{
              color: info.color,
            }}
            title={info.id}
          >
            {info.shortId}
          </span>
          <span className="flex items-center gap-1">
            <span className="flex items-center">
              {isStabilityLogo ? (
                <img
                  className="h-6 w-6 mx-[2px]"
                  src="/logo.svg"
                  alt="Stability"
                  title="Stability"
                />
              ) : (
                info.protocols.map((protocol, index) => (
                  <div
                    key={protocol.logoSrc + String(index)}
                    className={cn(
                      "h-4 w-4 rounded-full bg-black flex items-center justify-center",
                      !index && info.protocols.length > 1 && "mr-[-6px] z-[5]"
                    )}
                  >
                    <img
                      className="rounded-full"
                      src={protocol.logoSrc}
                      alt={protocol.name}
                      title={protocol.name}
                      style={{
                        zIndex: info.protocols.length - index,
                      }}
                    />
                  </div>
                ))
              )}
            </span>
            {specific && (
              <span
                className={`font-bold text-[#b6bdd7] inline ${
                  strategySpecific.length > 10
                    ? "lowercase text-[10px] pl-[12px] whitespace-pre-wrap max-w-[70px] text-left"
                    : "uppercase text-[10px] pl-[12px]"
                }`}
              >
                {strategySpecific}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export { StrategyBadge };
