import { memo } from "react";

interface IProps {
  isVsActive: boolean;
  vsHold: number;
  testID?: string;
}

const VSHoldTableCell: React.FC<IProps> = memo(
  ({ isVsActive, vsHold, testID = "" }) => {
    return (
      <td
        {...(!!testID && { "data-testid": testID })}
        className={`text-right ${
          isVsActive
            ? `text-[18px] ${vsHold > 0 ? "text-success-400" : "text-error-400"}`
            : ""
        }`}
      >
        {isVsActive ? (
          <>
            {vsHold > 0 ? "+" : ""}
            {vsHold}%
          </>
        ) : (
          "-"
        )}
      </td>
    );
  }
);

export { VSHoldTableCell };
