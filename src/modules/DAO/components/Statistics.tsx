import { useWalletClient } from "wagmi";

import { Indicator, Skeleton } from "@ui";

import { getTokenData, addAssetToWallet, formatNumber } from "@utils";

import { useUserData } from "../hooks";

import { STBL_DAO } from "../constants";

const Statistics: React.FC = () => {
  const { data: userData, isLoading: isUserDataLoading } = useUserData("146");

  const client = useWalletClient();

  const stblDaoData = getTokenData(STBL_DAO);

  return (
    <div className="bg-[#101012] border border-[#23252A] p-4 md:p-6 rounded-lg flex justify-between min-w-full gap-3 flex-wrap md:flex-nowrap">
      {isUserDataLoading ? (
        <Skeleton width={110} height={72} />
      ) : (
        <Indicator
          title="Your power"
          value={
            <p className="flex items-center gap-1">
              <img
                src={stblDaoData?.logoURI}
                alt={stblDaoData?.symbol}
                title={stblDaoData?.symbol}
                className="w-6 h-6"
              />

              <span>{formatNumber(userData.balance, "abbreviateNotUsd")}</span>

              {!!Number(userData.balance) && (
                <img
                  src="/metamask.svg"
                  alt="MetaMask"
                  title="Add to MetaMask"
                  className="w-3 h-3"
                  onClick={() =>
                    addAssetToWallet(
                      client,
                      STBL_DAO,
                      stblDaoData?.decimals ?? 18,
                      stblDaoData?.symbol ?? "",
                      stblDaoData?.logoURI
                    )
                  }
                />
              )}
            </p>
          }
          subValue={formatNumber(userData.balanceInUSD, "abbreviate")}
        />
      )}

      {isUserDataLoading ? (
        <Skeleton width={110} height={72} />
      ) : (
        <Indicator
          title="Your share"
          value={`${userData.share}%`}
          subValue={`Rank ${userData?.rank}`}
        />
      )}

      {isUserDataLoading ? (
        <Skeleton width={110} height={72} />
      ) : (
        <Indicator
          title="Total"
          value={
            <p className="flex items-center gap-1">
              <img
                src={stblDaoData?.logoURI}
                alt={stblDaoData?.symbol}
                title={stblDaoData?.symbol}
                className="w-6 h-6"
              />
              <span>
                {formatNumber(userData.totalSupply, "abbreviateNotUsd")}
              </span>
            </p>
          }
          subValue={formatNumber(userData.totalSupplyInUSD, "abbreviate")}
        />
      )}
    </div>
  );
};

export { Statistics };
