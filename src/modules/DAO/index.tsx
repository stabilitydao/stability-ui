import { useState } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { Indicator, Skeleton } from "@ui";

import {
  Table,
  DelegateForm,
  SectionHandler,
  Statistics,
  Holders,
} from "./components";

import { formatNumber, cn, updateQueryParams } from "@utils";

import { useVestingData } from "./hooks";

import { getInitialStateFromUrl } from "./functions";

import { daos } from "@stabilitydao/stability";

import { DAOSectionTypes } from "@types";

const DAO = (): JSX.Element => {
  const { data: vestingData, isLoading } = useVestingData("146");

  const stabilityDAO = daos?.find(({ name }) => name === "Stability");

  const { section } = getInitialStateFromUrl();

  const [activeSection, setActiveSection] = useState(section);

  const changeSection = (section: DAOSectionTypes) => {
    updateQueryParams({ section });
    setActiveSection(section);
  };

  return (
    <WagmiLayout>
      <div className="flex flex-col gap-6 min-w-full pb-[100px] lg:min-w-[960px] xl:min-w-[1200px]">
        <div>
          <h2 className="page-title__font text-start mb-2 md:mb-5">DAO</h2>
          <h3 className="text-[#97979a] page-description__font">
            Stability Decentralized Autonomous Organization.
          </h3>
        </div>

        <Statistics />

        <SectionHandler
          activeSection={activeSection}
          changeSection={changeSection}
        />

        <div
          className={cn(
            "flex items-start flex-col lg:flex-row gap-3",
            activeSection !== DAOSectionTypes.Governance && "hidden"
          )}
        >
          <div className="w-full lg:w-2/3">
            <Table />
          </div>
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            <DelegateForm />

            <div className="bg-[#101012] border border-[#23252A] rounded-lg flex flex-col min-w-full">
              <div className="bg-[#151618] rounded-t-lg h-[48px] flex items-center justify-start">
                <h2 className="text-[20px] leading-6 font-semibold pl-4 md:pl-6">
                  Parameters
                </h2>
              </div>
              <div className="flex flex-col min-w-full gap-3 px-4 pb-4 md:px-6 md:pb-6 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                    xSTBL instant exit fee
                  </span>
                  <span className="font-semibold">
                    {stabilityDAO?.params?.pvpFee}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                    Minimal power
                  </span>
                  <span className="font-semibold">4,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                    Proposal threshold
                  </span>
                  <span className="font-semibold">100,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                    STT bribe
                  </span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                    Recovery revenue share
                  </span>
                  <span className="font-semibold">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-col gap-2",
            activeSection !== DAOSectionTypes.InterChain && "hidden"
          )}
        >
          <span className="text-[#97979a] text-[14px] leading-5">
            Inter-chain power distribution for MetaVaults allocations voting.
          </span>
          <div className="flex items-center justify-center rounded-[4px] w-full bg-warning-950 border border-warning-400">
            <p className="font-manrope font-semibold px-2 text-[12px] leading-[17px] py-3 text-warning-400">
              Under construction
            </p>
          </div>
        </div>
        <div
          className={cn(
            activeSection !== DAOSectionTypes.Tokenomics && "hidden"
          )}
        >
          <h3 className="text-[26px] leading-8 font-semibold mb-3">
            Vesting allocations
          </h3>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <div className="bg-[#101012] border border-[#23252A] rounded-lg min-w-full flex flex-col">
                <div className="bg-[#151618] rounded-t-lg h-[48px] flex items-center justify-start">
                  <h2 className="text-[20px] leading-6 font-semibold pl-4 md:pl-6">
                    Foundation
                  </h2>
                </div>
                <div className="flex justify-between gap-3 flex-wrap md:flex-nowrap px-4 pb-4 md:px-6 md:pb-6 pt-4">
                  <Indicator title="Total" value="30M STBL" />

                  {isLoading ? (
                    <Skeleton width={110} height={48} />
                  ) : (
                    <Indicator
                      title="Claimable"
                      value={`${formatNumber(vestingData.foundation, "abbreviateNotUsd")} STBL`}
                    />
                  )}

                  <Indicator title="Spent" value="0 STBL" />

                  <Indicator title="Monthly unlock" value="~625K STBL" />
                </div>
              </div>
              <div className="bg-[#101012] border border-[#23252A] rounded-lg min-w-full flex flex-col">
                <div className="bg-[#151618] rounded-t-lg h-[48px] flex items-center justify-start">
                  <h2 className="text-[20px] leading-6 font-semibold pl-4 md:pl-6">
                    Investors
                  </h2>
                </div>
                <div className="flex justify-between gap-3 flex-wrap md:flex-nowrap px-4 pb-4 md:px-6 md:pb-6 pt-4">
                  <Indicator title="Total" value="20M STBL" />

                  {isLoading ? (
                    <Skeleton width={110} height={48} />
                  ) : (
                    <Indicator
                      title="Claimable"
                      value={`${formatNumber(vestingData.investors, "abbreviateNotUsd")} STBL`}
                    />
                  )}

                  <Indicator title="Spent" value="0 STBL" />

                  <Indicator title="Monthly unlock" value="~1.66M STBL" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <div className="bg-[#101012] border border-[#23252A] rounded-lg min-w-full flex flex-col">
                <div className="bg-[#151618] rounded-t-lg h-[48px] flex items-center justify-start">
                  <h2 className="text-[20px] leading-6 font-semibold pl-4 md:pl-6">
                    Community
                  </h2>
                </div>
                <div className="flex justify-between gap-3 flex-wrap md:flex-nowrap px-4 pb-4 md:px-6 md:pb-6 pt-4">
                  <Indicator title="Total" value="20M STBL" />
                  {isLoading ? (
                    <Skeleton width={110} height={48} />
                  ) : (
                    <Indicator
                      title="Claimable"
                      value={`${formatNumber(vestingData.community, "abbreviateNotUsd")} STBL`}
                    />
                  )}
                  <Indicator title="Spent" value="28K STBL" />

                  <Indicator title="Monthly unlock" value="~416K STBL" />
                </div>
              </div>
              <div className="bg-[#101012] border border-[#23252A] rounded-lg min-w-full flex flex-col">
                <div className="bg-[#151618] rounded-t-lg h-[48px] flex items-center justify-start">
                  <h2 className="text-[20px] leading-6 font-semibold pl-4 md:pl-6">
                    Team
                  </h2>
                </div>
                <div className="flex justify-between gap-3 flex-wrap md:flex-nowrap px-4 pb-4 md:px-6 md:pb-6 pt-4">
                  <Indicator title="Total" value="20M STBL" />
                  {isLoading ? (
                    <Skeleton width={110} height={48} />
                  ) : (
                    <Indicator
                      title="Claimable"
                      value={`${formatNumber(vestingData.team, "abbreviateNotUsd")} STBL`}
                    />
                  )}
                  <Indicator title="Spent" value="0 STBL" />

                  <Indicator title="Monthly unlock" value="~416K STBL" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "w-full",
            activeSection !== DAOSectionTypes.Holders && "hidden"
          )}
        >
          <Holders />
        </div>
      </div>
    </WagmiLayout>
  );
};

export { DAO };
