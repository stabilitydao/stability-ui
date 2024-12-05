import { memo } from "react";

interface IProps {
  isSharePrice: boolean;
  data: string;
  testID?: string;
}

const YieldTableCell: React.FC<IProps> = memo(
  ({ isSharePrice, data, testID = "" }) => {
    return (
      <td
        {...(!!testID && { "data-testid": testID })}
        className="text-right py-1"
      >
        {isSharePrice ? `${data}%` : "-"}
      </td>
    );
  }
);

export { YieldTableCell };
