import React from "react";

interface IProps {
  text: string;
  scale: 1 | 2 | 3;
  styles?: string;
}

const HeadingText: React.FC<IProps> = ({ text, scale, styles = "" }) => {
  const tag = `h${scale}` as keyof JSX.IntrinsicElements;

  const textSize = {
    1: "text-[32px] leading-[44px]",
    2: "text-[24px] leading-8",
    3: "text-[18px] leading-6",
  };

  return React.createElement(
    tag,
    {
      className: `font-manrope font-bold text-neutral-50 ${textSize[scale]} ${styles}`,
    },
    text
  );
};

export { HeadingText };
