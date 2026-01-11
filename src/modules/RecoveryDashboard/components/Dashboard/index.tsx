import { Card } from "./Card";

import type { DashboardCardData } from "../../types";

interface IProps {
  cards: DashboardCardData[];
  averageBurnRate: number | null;
  totalBurnPercent: number | null;
}

const Dashboard = ({
  cards,
  averageBurnRate,
  totalBurnPercent,
}: IProps): JSX.Element => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {cards.map((card, index) => (
        <Card
          key={index}
          card={card}
          averageBurnRate={averageBurnRate}
          totalBurnPercent={averageBurnRate}
        />
      ))}
    </div>
  );
};

export { Dashboard };
