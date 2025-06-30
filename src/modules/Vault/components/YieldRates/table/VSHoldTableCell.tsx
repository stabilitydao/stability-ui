import { memo } from "react";

import { cn } from "@utils";

interface IProps {
  isVsActive: boolean;
  vsHold: number;
  testID?: string;
  customClassName?: string;
}

const VSHoldTableCell: React.FC<IProps> = memo(
  ({ isVsActive, vsHold, testID = "", customClassName }) => {
    return (
      <div
        {...(!!testID && { "data-testid": testID })}
        className={cn(
          "text-right w-1/5 md:w-[17.5%]",
          isVsActive && `${vsHold > 0 ? "text-success-400" : "text-error-400"}`,
          customClassName
        )}
      >
        {isVsActive ? (
          <>
            {vsHold > 0 ? "+" : ""}
            {vsHold}%
          </>
        ) : (
          "-"
        )}
      </div>
    );
  }
);

export { VSHoldTableCell };
