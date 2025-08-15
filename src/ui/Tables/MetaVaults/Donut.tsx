import { useState, useEffect, useRef } from "react";

import { PieChart, Pie, Cell, Sector } from "recharts";

interface IProps {
  data: any;
  activeSection: any;
  setActiveSection: React.Dispatch<React.SetStateAction<any>>;
}

const Donut: React.FC<IProps> = ({ data, activeSection, setActiveSection }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const logoSrc =
    activeSection?.img ||
    (activeSection.name === "Aave" ? "/logo_dark.png" : activeSection.logoSrc);

  const symbol =
    activeSection?.symbol ||
    (activeSection.name === "Aave" ? "Stability" : activeSection.name);

  const percentage = activeSection?.value?.toFixed(2);

  const onMouseEnter = (_: any, index: number) => {
    setActiveSection({ ...data[index], isHovered: true });
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveSection(data[0]);
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
  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <PieChart
        width={220}
        height={220}
        className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
      >
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer"
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none">
        <img src={logoSrc} alt={symbol} className="w-6 h-6 rounded-full mb-1" />
        <span className="text-xl font-bold">{percentage}%</span>
        <span className="text-sm leading-tight">{symbol}</span>
      </div>
    </div>
  );
};

export { Donut };
