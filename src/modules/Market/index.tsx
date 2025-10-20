import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { WagmiLayout } from "@layouts";

import { SectionSelector, AssetSelector, MarketTabs } from "./components";

import { FullPageLoader, ErrorMessage, CustomTooltip } from "@ui";

import { getInitialStateFromUrl } from "./functions";

import { useUserPoolData } from "./hooks";

import {
  updateQueryParams,
  getShortAddress,
  getTokenData,
  getAllowance,
  getBalance,
} from "@utils";

import { formatUnits } from "viem";

import { CHAINS } from "@constants";

import { TOOLTIP_DESCRIPTIONS } from "./constants";

import {
  markets,
  error,
  account,
  connected,
  lastTx,
  currentChainID,
} from "@store";

import { web3clients, AaveProtocolDataProviderABI } from "@web3";

import { MarketSectionTypes, TMarket, TMarketReserve, TAddress } from "@types";

interface IProps {
  network: string;
  market: string;
}

const Market: React.FC<IProps> = ({ network, market }) => {
  const $markets = useStore(markets);
  const $error = useStore(error);

  const $lastTx = useStore(lastTx);
  const $currentChainID = useStore(currentChainID);

  const $connected = useStore(connected);
  const $account = useStore(account);

  const client = web3clients[network as keyof typeof web3clients];

  const { asset, section } = getInitialStateFromUrl();

  const [localMarket, setLocalMarket] = useState<TMarket>();

  const { data: userPoolData } = useUserPoolData(network, localMarket?.pool);

  const [activeAsset, setActiveAsset] = useState<TMarketReserve | undefined>();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeSection, setActiveSection] =
    useState<MarketSectionTypes>(section);

  const handleAssetChange = (asset: TMarketReserve) => {
    if (asset?.address === localMarket?.reserves?.[0]?.address) {
      updateQueryParams({ asset: null });
    } else {
      updateQueryParams({ asset: asset?.address });
    }

    setActiveAsset(asset);
  };

  const handleSectionChange = (section: MarketSectionTypes) => {
    if (section === MarketSectionTypes.Operations) {
      section = MarketSectionTypes.Supply;
    }

    if (section === MarketSectionTypes.Supply) {
      updateQueryParams({ section: null });
    } else {
      updateQueryParams({ section });
    }

    if (
      [MarketSectionTypes.Borrow, MarketSectionTypes.Repay].includes(section) &&
      !activeAsset?.isBorrowable
    ) {
      const borrowableAssets = localMarket?.reserves?.filter(
        ({ isBorrowable }) => isBorrowable
      );

      handleAssetChange(borrowableAssets?.[0] as TMarketReserve);
    }

    setActiveSection(section);
  };

  const getUserReservesData = async () => {
    if (!$connected || !$account || !localMarket?.reserves?.length) {
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);

      const availableBorrowsBase = userPoolData?.availableBorrowsBase ?? 0;

      for (const asset of localMarket.reserves) {
        const address = asset.address as TAddress;
        const aTokenAddress = asset.aToken as TAddress;
        const decimals = getTokenData(address)?.decimals ?? 18;

        const rawATokenBalance = await getBalance(
          client,
          aTokenAddress,
          $account
        );
        const withdraw = formatUnits(rawATokenBalance, decimals);

        const [rawBalance, rawAllowance] = await Promise.all([
          getBalance(client, address, $account),
          getAllowance(client, address, $account, localMarket.pool),
        ]);

        const balance = formatUnits(rawBalance, decimals);
        const allowance = formatUnits(rawAllowance, decimals);
        const deposited = withdraw;

        asset.supply = { balance, allowance, deposited };
        asset.withdraw = { balance: withdraw };

        if (asset.isBorrowable) {
          const tokenPrice = Number(asset.price);
          if (availableBorrowsBase > 0 && tokenPrice > 0) {
            const rawAmount =
              (availableBorrowsBase / tokenPrice) * 10 ** decimals;
            const safeAmount = BigInt(Math.floor(rawAmount * 0.999999));
            const formattedAmount = formatUnits(safeAmount, decimals);
            asset.borrow = { balance: formattedAmount };
          } else {
            asset.borrow = { balance: "0" };
          }
        }

        if (asset.isBorrowable) {
          const userReserveData = (await client.readContract({
            address: localMarket.protocolDataProvider,
            abi: AaveProtocolDataProviderABI,
            functionName: "getUserReserveData",
            args: [address, $account],
          })) as bigint[];

          const rawVariableDebt = userReserveData[2];
          const repayBalance = formatUnits(rawVariableDebt, decimals);

          const rawRepayAllowance = await getAllowance(
            client,
            address,
            $account,
            localMarket.pool
          );
          const repayAllowance = formatUnits(rawRepayAllowance, decimals);

          asset.repay = {
            balance: repayBalance,
            allowance: repayAllowance,
          };
        }
      }

      console.log("Updated reserves:", localMarket.reserves);
    } catch (error) {
      console.error("Get user reserve states error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ($markets && market) {
      const _market = $markets[network]?.find(
        ({ marketId }: { marketId: string }) => marketId === market
      );

      const chain = CHAINS.find(({ id }) => id == network);
      console.log({
        marketId: market,
        network: chain,
        engine: _market?.engine,
        pool: _market?.pool,
        protocolDataProvider: _market?.protocolDataProvider,
        deployed: _market?.deployed,
        reserves: _market?.reserves,
      });
      setLocalMarket({
        marketId: market,
        network: chain,
        engine: _market?.engine,
        pool: _market?.pool,
        protocolDataProvider: _market?.protocolDataProvider,
        deployed: _market?.deployed,
        reserves: _market?.reserves,
      } as TMarket);
    }
  }, [$markets]);

  useEffect(() => {
    if (localMarket && !activeAsset) {
      if (asset) {
        const urlAsset = localMarket?.reserves?.find(
          ({ address }) => asset === address
        );

        setActiveAsset(urlAsset ? urlAsset : localMarket?.reserves[0]);
      } else {
        setActiveAsset(localMarket?.reserves[0]);
      }
    }
  }, [$markets, localMarket]);

  useEffect(() => {
    getUserReservesData();
  }, [
    localMarket,
    $lastTx,
    $account,
    $connected,
    $currentChainID,
    userPoolData,
  ]);

  return market && localMarket ? (
    <WagmiLayout>
      <div className="w-full mx-auto font-manrope pb-5 lg:min-w-[900px] xl:min-w-[1230px]">
        <div>
          <h1 className="page-title__font text-start">
            {localMarket?.marketId}
          </h1>
          <div className="flex flex-col gap-4 mt-[-20px]">
            <div className="flex flex-col items-start gap-6">
              <div className="bg-[#18191C] border border-[#232429] rounded-xl w-full">
                <div className="flex items-center px-4 pt-4 pb-[10px] md:px-0 md:py-[10px] flex-wrap gap-2">
                  <div className="flex items-center gap-3 pl-2 pr-4  border-r border-r-[#232429]">
                    <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                      Chain:
                    </span>
                    <div className="flex items-center gap-2">
                      <img
                        src={localMarket?.network?.logoURI}
                        alt={localMarket?.network?.name}
                        className="w-5 h-5 rounded-full"
                      />

                      <span className="text-[14px] leading-5 font-semibold">
                        {localMarket?.network?.name}
                      </span>

                      <span className="text-[12px] leading-4 font-medium bg-[#2B2C2F] border border-[#58595D] rounded px-2 py-[2px]">
                        {localMarket?.network?.id}
                      </span>
                    </div>
                  </div>
                  <a
                    className="flex items-center gap-2 pl-2 pr-4 border-r border-r-[#232429]"
                    href={`${localMarket?.network?.explorer}/address/${localMarket?.pool}`}
                    target="_blank"
                  >
                    <span className="text-[14px] leading-5 font-medium text-[#9180F4]">
                      Pool: {getShortAddress(localMarket?.pool ?? "", 6, 4)}
                    </span>
                    <img
                      src="/icons/purple_link.png"
                      alt="address"
                      className="w-4 h-4"
                    />
                  </a>
                  <div className="pl-2 pr-4 border-r border-r-[#232429]">
                    <CustomTooltip
                      name="Isolated risk"
                      description={TOOLTIP_DESCRIPTIONS.isolatedRisk}
                      isMediumText={true}
                    />
                  </div>
                  <div className="pl-2 pr-4 border-r border-r-[#232429]">
                    <div className="flex items-center">
                      <span className="font-medium text-[14px] leading-5 text-[#7C7E81]">
                        Engine: {localMarket?.engine}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-start flex-col gap-3">
                <SectionSelector
                  market={market}
                  activeSection={activeSection}
                  handleSectionChange={handleSectionChange}
                />
                <AssetSelector
                  assets={localMarket?.reserves}
                  activeSection={activeSection}
                  activeAsset={activeAsset}
                  handleAssetChange={handleAssetChange}
                />
              </div>
            </div>
            {/* <MarketTabs
              marketData={localMarket}
              section={activeSection}
              asset={activeAsset}
              userReserves={userReservesStates}
              isLoading={isLoading}
            /> */}
          </div>
        </div>
      </div>
    </WagmiLayout>
  ) : (
    <div>
      <ErrorMessage type={$error.type} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <FullPageLoader />
      </div>
    </div>
  );
};
export { Market };
