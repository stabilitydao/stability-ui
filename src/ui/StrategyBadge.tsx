import { cn } from "@utils";

import { IStrategyInfo } from "@types";

interface IProps {
  info: IStrategyInfo;
  specific: string;
}

const StrategyBadge: React.FC<IProps> = ({ info, specific }) => {
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
              {info.protocols.map((protocol, index) => (
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
              ))}
            </span>
            {specific && <span>{specific}</span>}
          </span>
        </div>
      )}
    </div>
  );
};

export { StrategyBadge };
