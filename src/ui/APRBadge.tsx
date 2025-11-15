import { Badge } from "./Badge";

interface IProps {
  APR: number;
}

const APRBadge: React.FC<IProps> = ({ APR }) => {
  if (APR < 50) return null;

  const text = `APR ${Number(APR).toFixed()}%`;

  return (
    <Badge state={APR >= 100 ? "accent" : "success"} text={text} greater />
  );
};

export { APRBadge };
