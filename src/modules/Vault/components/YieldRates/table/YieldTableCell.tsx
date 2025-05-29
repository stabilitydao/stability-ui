import { memo } from "react";

import { cn } from "@utils";

interface IProps {
  isSharePrice: boolean;
  data: string | number;
  testID?: string;
  customClassName?: string;
}

const YieldTableCell: React.FC<IProps> = memo(
  ({ isSharePrice, data, testID = "", customClassName }) => {
    return (
      <div
        {...(!!testID && { "data-testid": testID })}
        className={cn("text-right w-[20%]", customClassName)}
      >
        {isSharePrice ? `${data}%` : "-"}
      </div>
    );
  }
);

export { YieldTableCell };
