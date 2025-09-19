import { useStore } from "@nanostores/react";

import { formatNumber } from "@utils";

import { marketPrices } from "@store";

import type { TChartPayload } from "@types";

type TProps = {
  active?: boolean;
  payload?: TChartPayload[];
  APRType?: string;
  type?: string;
};

const ChartTooltip = ({
  active,
  payload,
  APRType,
  type = "default",
}: TProps): JSX.Element | null => {
  const $marketPrices = useStore(marketPrices);

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  const renderContent = () => {
    switch (type) {
      case "TVL":
        return <p>TVL: {formatNumber(payload[0].value, "abbreviate")}</p>;
      case "sharePrice":
        return <p>Price: ${Number(payload[0].value).toFixed(4)}</p>;
      case "APR":
        return (
          <p>
            {APRType ?? "APR"}: {payload[0].value}%
          </p>
        );
      case "xSTBL":
        return (
          <p>
            xSTBL: {formatNumber(data?.value, "format")} (
            {formatNumber(
              data?.value * Number($marketPrices.STBL.price),
              "abbreviate"
            )}
            )
          </p>
        );
      default:
        return (
          <>
            <p>
              {data?.label ?? "Label"}: {payload[0].value}
            </p>
            <p>Date: {data?.date ?? data?.timestamp}</p>
          </>
        );
    }
  };

  return (
    <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
      <div className="px-5 py-3">
        {data?.date && <p>{data.date}</p>}
        {renderContent()}
      </div>
    </div>
  );
};
export { ChartTooltip };
