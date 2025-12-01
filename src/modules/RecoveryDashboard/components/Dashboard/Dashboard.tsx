import { DashboardCardData } from "../../types";

interface DashboardCardProps {
  card: DashboardCardData;
}

interface DashboardGridProps {
  cards: DashboardCardData[];
}

// DashboardCard Component
export function DashboardCard({ card }: DashboardCardProps) {
  return (
    <div className="bg-[#101012] backdrop-blur-md border border-[#23252A] rounded-lg p-6 hover:bg-[#23252A] flex flex-col gap-2">
      <h3 className="text-[#9798A4] text-base">{card.title}</h3>
      <p className="text-white text-[32px] font-bold">{card.value}</p>
      {card.subtitle && (
        <p className="text-[#9798A4] text-base">{card.subtitle}</p>
      )}
      {card.change && (
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
      )}
    </div>
  );
}

// DashboardGrid Component (Main Export)
export function DashboardGrid({ cards }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((card, index) => (
        <DashboardCard key={index} card={card} />
      ))}
    </div>
  );
}

// Export type for use in other files
export type { DashboardCardData };
