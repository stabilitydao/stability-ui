import { cn } from "@utils";

import type { TShareData, THoldData } from "@types";

interface IProps {
  shareData: TShareData;
  holdData: THoldData[];
  daysFromCreation?: number;
}

const HoldTable: React.FC<IProps> = ({
  shareData,
  holdData,
  daysFromCreation = 0,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden">
        <div className="px-4 w-[40%]"></div>
        <div className="text-right w-1/5">Init price</div>
        <div className="text-right w-1/5 pr-4">Price</div>
        <div className="text-right w-1/5 pr-4">
          Change {daysFromCreation} days
        </div>
      </div>

      <div className="flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]">
        <div className="px-4 w-[40%]">Vault</div>
        <div className="text-right w-[20%]">
          {shareData.sharePriceOnCreation}
        </div>
        <div className="text-right w-[20%] pr-4">{shareData.sharePrice} </div>
        <div className="text-right w-[20%] pr-4">
          {Number(shareData.yieldPercent) > 0 && "+"}
          {shareData.yieldPercent}%
        </div>
      </div>

      {!!holdData &&
        holdData.map((aprsData, index) => (
          <div
            key={aprsData.symbol}
            className={cn(
              "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]",
              holdData.length - 1 === index && "rounded-b-lg"
            )}
          >
            <div className="w-[40%] px-4">{aprsData.symbol}</div>
            <div className="text-right w-[20%]">{aprsData.initPrice} </div>
            <div className="text-right w-[20%] pr-4">{aprsData.price}</div>
            <div className="text-right w-[20%] pr-4">
              {Number(aprsData.priceDifference) > 0 && "+"}
              {aprsData.priceDifference}%
            </div>
          </div>
        ))}
    </div>
  );
};

export { HoldTable };
