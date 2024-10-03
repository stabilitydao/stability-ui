import { ColorIndicator } from "./ColorIndicator";

interface IProps {
  riskSymbol: string;
}

const RiskIndicator: React.FC<IProps> = ({ riskSymbol }) => {
  const symbol: string = riskSymbol.toLowerCase();
  let color: string = "#4FAE2D";

  if (symbol.includes("rekt")) {
    color = "#E01A1A";
  } else if (symbol === "high" || symbol === "medium" || symbol === "low") {
    color = "#FB8B13";
  }

  return <ColorIndicator color={color} />;
};

export { RiskIndicator };
