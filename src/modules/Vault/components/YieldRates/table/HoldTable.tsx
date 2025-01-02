import type { TShareData, THoldData } from "@types";

interface IProps {
  shareData: TShareData;
  holdData: THoldData[];
  daysFromCreation?: number;
}

const HoldTable: React.FC<IProps> = ({
  shareData,
  holdData,
  daysFromCreation= 0,
}) => {
  return (
    <table className="font-manrope w-full">
      <thead className="bg-accent-950 text-neutral-600 h-[36px]">
        <tr className="text-[14px] uppercase">
          <th></th>
          <th className="text-right">INIT PRICE</th>
          <th className="text-right">PRICE</th>
          <th className="text-right">CHANGE {daysFromCreation} DAYS</th>
        </tr>
      </thead>
      <tbody className="text-[14px]">
        {!!shareData && (
          <tr className="h-[48px] hover:bg-accent-950">
            <td>Vault</td>
            <td className="text-right py-1">
              {shareData.sharePriceOnCreation}
            </td>
            <td className="text-right py-1">{shareData.sharePrice}</td>
            <td className="text-right py-1">
              {Number(shareData.yieldPercent) > 0 && "+"}
              {shareData.yieldPercent}%
            </td>
          </tr>
        )}
        {!!holdData &&
          holdData.map((aprsData) => (
            <tr key={aprsData.symbol} className="h-[48px] hover:bg-accent-950">
              <td>{aprsData.symbol}</td>
              <td className="text-right py-1">{aprsData.initPrice}</td>
              <td className="text-right py-1">{aprsData.price}</td>
              <td className="text-right py-1">
                {Number(aprsData.priceDifference) > 0 && "+"}
                {aprsData.priceDifference}%
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export { HoldTable };
