interface IProps {
  state: "default" | "bright" | "accent" | "error" | "warning" | "success";
  text: string;
  greater?: boolean;
}

const BUTTON_STYLES = {
  default: "bg-[#151618] border border-[#23252A]",
  bright: "bg-neutral-900",
  accent: "bg-[#1C1E31] border border-[#5E6AD2]",
  error: "bg-error-950 border border-error-400",
  warning: "bg-warning-950 border border-warning-400",
  success: "bg-[#192C1E] border border-[#48C05C]",
};

const TEXT_STYLES = {
  default: "text-[#97979A]",
  bright: "text-neutral-50",
  accent: "text-[#5E6AD2]",
  error: "text-error-400",
  warning: "text-warning-400",
  success: "text-[#48C05C]",
};

const Badge: React.FC<IProps> = ({ state, text, greater = false }) => {
  const buttonStyle = BUTTON_STYLES[state];
  const textStyle = TEXT_STYLES[state];

  return (
    <div
      className={`flex items-center justify-center rounded-[4px] ${greater ? "max-w-[100px]" : "max-w-[60px]"} ${buttonStyle}`}
    >
      <p
        className={`font-manrope font-semibold px-2 ${greater ? "text-[12px] leading-[17px] py-1" : "text-[10px] leading-[10px] py-[2px]"} ${textStyle}`}
      >
        {text}
      </p>
    </div>
  );
};

export { Badge };
