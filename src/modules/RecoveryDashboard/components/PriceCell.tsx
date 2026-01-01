import { PriceCellProps } from "../types";

const PriceCell: React.FC<PriceCellProps> = ({ price }) => {
  if (!price) {
    return <div className="text-[#97979A] text-sm">—</div>;
  }

  return (
    <div className="min-w-0">
      <span className="text-[#EAECEF] font-medium text-sm text-balance leading-tight break-words">
        1 {price.sym0} ={" "}
        {price.price_token1_per_token0.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}{" "}
        {price.sym1}
      </span>
    </div>
  );
};

export { PriceCell };
