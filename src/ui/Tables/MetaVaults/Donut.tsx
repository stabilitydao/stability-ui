import { useState } from "react";

import { PieChart, Pie, Cell, Sector } from "recharts";

import { TAddress } from "@types";

interface IProps {
  vaults: {
    address: TAddress;
    symbol: string;
    color: string;
    img: string;
    value: number;
  }[];
  activeVault: any;
  setActiveVault: React.Dispatch<React.SetStateAction<any>>;
}

const Donut: React.FC<IProps> = ({ vaults, activeVault, setActiveVault }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onMouseEnter = (_: any, index: number) => {
    setActiveVault({ ...vaults[index], isHovered: true });
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveVault(vaults[0]);
    setActiveIndex(null);
  };

  return (
    <div className="relative w-full h-full">
      <PieChart width={220} height={220}>
        <Pie
          data={vaults}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          activeIndex={activeIndex ?? undefined}
          activeShape={(props) => (
            <Sector
              {...props}
              outerRadius={85}
              innerRadius={65}
              isAnimationActive={true}
              animationDuration={1000}
            />
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isAnimationActive={true}
          animationDuration={1000}
        >
          {vaults.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer transition-all duration-300"
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none">
        <img
          src={activeVault?.img}
          alt={activeVault?.symbol}
          className="w-6 h-6 rounded-full mb-1"
        />
        <span className="text-xl font-bold">{activeVault?.percentage}%</span>
        <span className="text-sm leading-tight">{activeVault?.symbol}</span>
      </div>
    </div>
  );
};

export { Donut };
