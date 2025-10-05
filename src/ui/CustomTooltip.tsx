import Tippy from "@tippyjs/react";

import { cn } from "@utils";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";

interface IProps {
  name: string;
  description: string;
  isMediumText?: string;
}

const CustomTooltip: React.FC<IProps> = ({
  name,
  description,
  isMediumText = false,
}) => {
  return (
    <Tippy
      content={description}
      placement="top"
      animation="shift-away"
      interactive={true}
      delay={[100, 50]}
      theme="custom"
    >
      <div className="flex items-center gap-2 cursor-help text-[#7C7E81]">
        <span
          className={cn(
            "font-medium",
            isMediumText ? "text-[14px] leading-5" : "text-[16px] leading-6"
          )}
        >
          {name}
        </span>
        <img
          src="/icons/circle_question.png"
          alt="Question icon"
          className="w-4 h-4"
        />
      </div>
    </Tippy>
  );
};

export { CustomTooltip };
