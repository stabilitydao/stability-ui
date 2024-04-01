import { memo, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { assetsPrices, connected } from "@store";

import { getTimeDifference } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

interface IvsAPR {
  symbol: string;
  latestAPR: string;
  APR: string;
}

const YieldBar: React.FC<IProps> = memo(({ vault }) => {
  const $assetsPrices = useStore(assetsPrices);
  const $connected = useStore(connected);

  const [vaultVsAPR, setVaultVsAPR] = useState<IvsAPR[]>([]);

  const getHoldData = async () => {
    if (!$assetsPrices) return;
    const tokensHold = vault.assets.map((asset, index) => {
      const sharePriceOnCreation = 1;
      const sharePrice = Number(vault.shareprice);

      const price = Number(formatUnits($assetsPrices[asset.address], 18));
      const priceOnCreation = Number(
        formatUnits(BigInt(vault.assetsPricesOnCreation[index]), 18)
      );

      const difference = getTimeDifference(vault.created).days;

      const assetsDifference =
        ((price - priceOnCreation) / priceOnCreation) * 100;
      const sharePriceDifference = (sharePrice - sharePriceOnCreation) * 100;

      const percentDiff = assetsDifference + sharePriceDifference;
      const yearPercentDiff = (percentDiff / difference) * 365;

      return {
        symbol: asset.symbol,
        latestAPR: percentDiff.toFixed(2),
        APR: yearPercentDiff.toFixed(2),
      };
    });

    setVaultVsAPR(tokensHold);
  };

  useEffect(() => {
    getHoldData();
  }, [$connected, $assetsPrices]);
  return (
    <div>
      <div className="flex justify-between items-center h-[60px]">
        <h2 className="text-[28px] text-start ml-4">Yield rates</h2>
      </div>
      <div className="p-4">
        {!!vault?.earningData && (
          <table className="table table-auto w-full rounded-lg">
            <thead className="bg-[#0b0e11]">
              <tr className="text-[18px] md:text-[16px] lg:text-[20px] text-[#8f8f8f] uppercase">
                <th></th>
                <th>Latest</th>
                <th>24h</th>
                <th>Week</th>
              </tr>
            </thead>
            <tbody className="text-[14px] min-[450px]:text-[16px] md:text-[14px] lg:text-[20px]">
              <tr className="hover:bg-[#2B3139]">
                <td>Total APY</td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.latest}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apy?.withFees?.weekly}%
                </td>
              </tr>
              <tr className="hover:bg-[#2B3139]">
                <td>Total APR</td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.latest}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.apr?.withFees?.weekly}%
                </td>
              </tr>
              {vault.strategyInfo.shortName != "CF" && (
                <tr className="hover:bg-[#2B3139]">
                  <td>Pool swap fees APR</td>

                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.latest}%
                  </td>
                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.daily}%
                  </td>
                  <td className="text-right py-1">
                    {vault?.earningData?.poolSwapFeesAPR?.weekly}%
                  </td>
                </tr>
              )}
              <tr className="hover:bg-[#2B3139]">
                {vault.strategyInfo.shortName === "CF" ? (
                  <td>Strategy APR</td>
                ) : (
                  <td>Farm APR</td>
                )}
                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.latest}%
                </td>

                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.daily}%
                </td>
                <td className="text-right py-1">
                  {vault?.earningData?.farmAPR?.weekly}%
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {!!vaultVsAPR &&
          vaultVsAPR.map((aprsData: IvsAPR) => (
            <div key={aprsData.latestAPR} className="mt-5">
              <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
                VAULT VS {aprsData?.symbol} HOLD / APR
              </p>
              <div
                className={`text-[16px] flex gap-1 mt-1 ${
                  Number(aprsData.latestAPR) > 0
                    ? "text-[#b0ddb8]"
                    : "text-[#eb7979]"
                }`}
              >
                <span>
                  {Number(aprsData.latestAPR) > 0 ? "+" : ""}
                  {aprsData.latestAPR}%
                </span>{" "}
                /
                <span>
                  {Number(aprsData.APR) > 0 ? "+" : ""}
                  {aprsData.APR}%
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
});

export { YieldBar };
