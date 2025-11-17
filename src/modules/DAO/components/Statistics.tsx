import { useWalletClient } from "wagmi";

import { Skeleton } from "@ui";

import { getTokenData, addAssetToWallet, formatNumber } from "@utils";

import { useUserData } from "../hooks";

import { STBL_DAO } from "../constants";

const Statistics: React.FC = () => {
  const { data: userData, isLoading: isUserDataLoading } = useUserData("146");

  const client = useWalletClient();

  const stblDaoData = getTokenData(STBL_DAO);

  return (
    <div className="flex items-stretch gap-3 flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
        <div className="flex flex-col items-center justify-center py-6">
          <span className="text-[#97979A] text-[16px] leading-6 font-medium">
            Your share
          </span>
          {!isUserDataLoading ? (
            <div className="flex flex-col items-center">
              <span className="text-[32px] leading-10 font-semibold">
                {userData.share}%
              </span>
              <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                Rank {userData?.rank}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Skeleton height={40} width={160} />
              <Skeleton height={24} width={80} />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
        <div className="flex flex-col items-center justify-center py-6">
          <span className="text-[#97979A] text-[16px] leading-6 font-medium">
            Your power
          </span>
          {!isUserDataLoading ? (
            <div className="flex flex-col items-center">
              <p className="text-[32px] leading-10 font-semibold flex items-center gap-1">
                <img
                  src={stblDaoData?.logoURI}
                  alt={stblDaoData?.symbol}
                  title={stblDaoData?.symbol}
                  className="w-6 h-6"
                />

                <span>{formatNumber(userData.balance, "format")}</span>

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
              <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                ${formatNumber(userData.balanceInUSD, "format")}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Skeleton height={40} width={160} />
              <Skeleton height={24} width={80} />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-lg">
        <div className="flex flex-col items-center justify-center py-6">
          <span className="text-[#97979A] text-[16px] leading-6 font-medium">
            Total
          </span>

          {!isUserDataLoading ? (
            <>
              <div className="flex flex-col items-center">
                <p className="text-[32px] leading-10 font-semibold flex items-center gap-1">
                  <img
                    src={stblDaoData?.logoURI}
                    alt={stblDaoData?.symbol}
                    title={stblDaoData?.symbol}
                    className="w-6 h-6"
                  />

                  <span>{formatNumber(userData.totalSupply, "format")}</span>
                </p>
                <span className="text-[#97979A] text-[16px] leading-6 font-medium">
                  ${formatNumber(userData.totalSupplyInUSD, "format")}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <Skeleton height={40} width={160} />
              <Skeleton height={24} width={80} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Statistics };
