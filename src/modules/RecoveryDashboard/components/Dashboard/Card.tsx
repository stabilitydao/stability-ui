import type { DashboardCardData } from "../../types";

interface IProps {
  card: DashboardCardData;
  averageBurnRate: number | null;
  totalBurnPercent: number | null;
}

const Card = ({
  card,
  averageBurnRate,
  totalBurnPercent,
}: IProps): JSX.Element => {
  return (
    <div className="bg-[#101012] backdrop-blur-md border border-[#23252A] rounded-lg p-6 hover:bg-[#23252A] flex flex-col gap-2">
      <h3 className="text-[#9798A4] text-base">{card.title}</h3>

      <p className="text-white text-[32px] font-bold">
        {card.specialType === "averageBurnRate"
          ? averageBurnRate !== null
            ? averageBurnRate.toFixed(2) + "%"
            : "—"
          : card.value}
      </p>

      {card.subtitle && (
        <p className="text-[#9798A4] text-base">{card.subtitle}</p>
      )}

      {card.specialType === "averageBurnRate" ? (
        <p className="text-green-500 text-sm">
          {totalBurnPercent !== null &&
            totalBurnPercent.toFixed(2) + "% burned across all tokens"}
        </p>
      ) : (
        card.change && (
          <p
            className={`text-sm ${
              card.changeType === "positive"
                ? "text-green-500"
                : card.changeType === "negative"
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            {card.change}
          </p>
        )
      )}
    </div>
  );
};

export { Card };
