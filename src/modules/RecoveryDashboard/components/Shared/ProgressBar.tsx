interface Props {
  label: string;
  percentage: number;
  color?: string;
}

export function ProgressBar({ label, percentage, color = "#7C3BED" }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="text-[#97979A] text-sm mb-2">{label}</div>
        <div className="w-full bg-[#23252A] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
      <span
        className="font-semibold text-sm min-w-[50px] text-right"
        style={{ color }}
      >
        {percentage}%
      </span>
    </div>
  );
}
