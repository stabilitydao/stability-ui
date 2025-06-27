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
    (activeSection.name === "Aave V3"
      ? "/logo_dark.png"
      : activeSection.logoSrc);

  const symbol =
    activeSection?.symbol ||
    (activeSection.name === "Aave V3" ? "Stability" : activeSection.name);

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

// import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// type Data = {
//   name: string;
//   value: number;
//   fill: string;
// };

// let data: Data[] = [
//   {
//     name: "Paris",
//     value: 25,
//     fill: "#F1F1F1",
//   },
//   {
//     name: "Berlin",
//     value: 50,
//     fill: "#5A5771",
//   },
//   {
//     name: "Moscow",
//     value: 25,
//     fill: "#FF7141",
//   },
// ];

// type CustomLabelProps = {
//   cx: number;
//   cy: number;
//   midAngle: number;
//   innerRadius: number;
//   outerRadius: number;
//   percent: number;
//   fill: string;
// };

// function calculateLuminance(color: string) {
//   const rgb = parseInt(color.substring(1), 16);
//   const r = (rgb >> 16) & 0xff;
//   const g = (rgb >> 8) & 0xff;
//   const b = (rgb >> 0) & 0xff;

//   return 0.299 * r + 0.587 * g + 0.114 * b;
// }

/** BONUS: Label with inverted color */
// function renderLabel(props: CustomLabelProps) {
//   let { cx, cy, midAngle, innerRadius, outerRadius, percent, fill } = props;

//   // Avoid rendering label on thin slices (< 5%);
//   if (percent * 100 < 5) return null;

//   const RADIAN = Math.PI / 180;
//   const radius = innerRadius + (outerRadius - innerRadius) / 2;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

//   const textColor = calculateLuminance(fill) > 128 ? "#000" : "#FFF";

//   return (
//     <text
//       x={x}
//       y={y}
//       fill={textColor}
//       className="pointer-events-none select-none text-sm font-medium"
//       textAnchor="middle"
//       dominantBaseline="central"
//     >
//       {`${(percent * 100).toFixed(0)}%`}
//     </text>
//   );
// }

// export const Donut = () => {
//   return (
//     <div className="grid place-items-center h-screen overflow-hidden bg-white">
//       <div className="flex flex-col items-center">
//         <h1 className="text-lg font-medium tracking-tight text-gray-900">
//           Animated Slices
//         </h1>
//         <div className="mt-4 size-64">
// <ResponsiveContainer>
//   <PieChart margin={{ left: 0, right: 0, bottom: 0, top: 0 }}>
//     <Pie
//       dataKey="value"
//       data={data}
//       blendStroke
//       className="focus:outline-none"
//       startAngle={90}
//       label={renderLabel}
//       animationDuration={600}
//       animationBegin={0}
//       animationEasing="ease-out"
//       endAngle={-270}
//       labelLine={false}
//       cx="50%"
//       cy="50%"
//       innerRadius="45%"
//       outerRadius="95%"
//     >
//       {data.map((entry, i) => (
//         // https://recharts.org/en-US/api/Cell
//         <Cell
//           key={`cell-${i}`}
//           fill={entry.fill}
//           className="origin-center transition-transform duration-200 ease-out hover:scale-105 focus:outline-none outline-none"
//         />
//       ))}
//     </Pie>
//   </PieChart>
// </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };
