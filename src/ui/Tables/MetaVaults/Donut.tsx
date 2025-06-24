import { useState, useEffect, useRef } from "react";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const onMouseEnter = (_: any, index: number) => {
    setActiveVault({ ...vaults[index], isHovered: true });
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveVault(vaults[0]);
    setActiveIndex(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (svg instanceof SVGSVGElement) {
      svgRef.current = svg;
    }
  }, []);

  useEffect(() => {
    const handleClickOutsidePie = (e: TouchEvent | MouseEvent) => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile || !svgRef.current) return;

      const chartRect = svgRef.current.getBoundingClientRect();
      const clickX =
        (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      const clickY =
        (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;

      const centerX = chartRect.left + chartRect.width / 2;
      const centerY = chartRect.top + chartRect.height / 2;

      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const innerRadius = 70;
      const outerRadius = 80;

      if (distance < innerRadius || distance > outerRadius) {
        onMouseLeave();
      }
    };

    document.addEventListener("touchstart", handleClickOutsidePie);
    document.addEventListener("mousedown", handleClickOutsidePie);

    return () => {
      document.removeEventListener("touchstart", handleClickOutsidePie);
      document.removeEventListener("mousedown", handleClickOutsidePie);
    };
  }, [vaults]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <PieChart
        width={220}
        height={220}
        className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
      >
        <Pie
          data={vaults}
          className="focus:outline-none"
          cx="50%"
          cy="50%"
          blendStroke
          innerRadius={70}
          outerRadius={80}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
        >
          {vaults.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer"
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none">
        <img
          src={
            activeVault?.img ||
            (activeVault.name === "Aave V3"
              ? "/logo_dark.png"
              : activeVault.logoSrc)
          }
          alt={
            activeVault?.symbol ||
            (activeVault.name === "Aave V3"
              ? "/logo_dark.png"
              : activeVault.name)
          }
          className="w-6 h-6 rounded-full mb-1"
        />
        <span className="text-xl font-bold">
          {activeVault?.value?.toFixed(2)}%
        </span>
        <span className="text-sm leading-tight">
          {activeVault?.symbol ||
            (activeVault?.name === "Aave V3" ? "Stability" : activeVault?.name)}
        </span>
      </div>
    </div>
  );
};

export { Donut };
