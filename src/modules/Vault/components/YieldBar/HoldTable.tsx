import type { TShareData, THoldData } from "@types";

interface IProps {
  shareData: TShareData;
  holdData: THoldData[];
}

const HoldTable: React.FC<IProps> = ({ shareData, holdData }) => {
  return (
    <table className="table table-auto w-full rounded-lg">
      <thead className="bg-[#0b0e11]">
        <tr className="text-[16px] text-[#8f8f8f] uppercase">
          <th></th>
          <th>INIT PRICE</th>
          <th>PRICE</th>
          <th>CHANGE</th>
        </tr>
      </thead>
      <tbody className="text-[16px]">
        {!!shareData && (
          <tr className="hover:bg-[#2B3139]">
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
            <tr key={aprsData.symbol} className="hover:bg-[#2B3139]">
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
