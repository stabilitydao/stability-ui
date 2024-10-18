interface IProps {
  state: "default" | "bright" | "accent" | "error" | "warning" | "success";
  text: string;
  greater?: boolean;
}

const BUTTON_STYLES = {
  default: "bg-neutral-950",
  bright: "bg-neutral-900",
  accent: "bg-accent-950 border border-accent-400",
  error: "bg-error-950 border border-error-400",
  warning: "bg-warning-950 border border-warning-400",
  success: "bg-success-950 border border-success-400",
};

const TEXT_STYLES = {
  default: "text-neutral-500",
  bright: "text-neutral-50",
  accent: "text-accent-400",
  error: "text-error-400",
  warning: "text-warning-400",
  success: "text-success-400",
};

const Badge: React.FC<IProps> = ({ state, text, greater = false }) => {
  const buttonStyle = BUTTON_STYLES[state];
  const textStyle = TEXT_STYLES[state];

  return (
    <div
      className={`flex items-center justify-center rounded-2xl ${greater ? "max-w-[100px]" : "max-w-[60px]"} ${buttonStyle}`}
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
