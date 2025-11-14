import { Badge } from "./Badge";

import { formatNumber } from "@utils";

interface IProps {
  APR: number;
}

const APRBadge: React.FC<IProps> = ({ APR }) => {
  if (APR < 50) return null;

  const text = `APR: ${formatNumber(APR, "formatAPR")}%`;

  return (
    <Badge state={APR >= 100 ? "accent" : "success"} text={text} greater />
  );
};

export { APRBadge };
