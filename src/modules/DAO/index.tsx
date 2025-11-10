import WagmiLayout from "@layouts/WagmiLayout";

import { Indicator } from "@ui";

import { Table, DelegateForm } from "./components";

import { formatNumber } from "@utils";

import { useVestingData } from "./hooks";

const DAO = (): JSX.Element => {
  const { data: claimable, isLoading: isClaimableLoading } =
    useVestingData("146");

  return (
    <WagmiLayout>
      <div className="flex flex-col gap-6 min-w-full pb-[100px] lg:min-w-[960px] xl:min-w-[1200px]">
        <div>
          <h2 className="page-title__font text-start mb-2 md:mb-5">DAO</h2>
          <h3 className="text-[#97979a] page-description__font">
            Stability Decentralized Autonomous Organization.
          </h3>
        </div>
        <div className="flex items-start flex-col lg:flex-row gap-3 mb-[26px]">
          <div className="w-full lg:w-2/3">
            <Table />
          </div>
          <div className="w-full lg:w-1/3">
            <DelegateForm />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-[26px]">
          <h2 className="text-center text-[26px] font-bold">
            Allocators (Coolimg soon)
          </h2>
          <span className="text-[#97979a] text-[14px] leading-5">
            Inter-chain power distribution for MetaVaults allocations voting.
            Under construction.
          </span>
        </div>
        <div className="flex flex-col gap-6 mb-[26px]">
          <h2 className="text-center text-[26px] font-bold">Foundation</h2>
          <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between min-w-full gap-3">
            <Indicator title="Total" value="30M STBL" />

            <Indicator
              title="Claimable"
              value={`${formatNumber(claimable, "abbreviateNotUsd")} STBL`}
            />

            <Indicator title="Invested" value="0 STBL" />
          </div>
        </div>
        <div className="flex flex-col gap-6 mb-[26px]">
          <h2 className="text-center text-[26px] font-bold">DAO parameters</h2>
          <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex flex-col min-w-full gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[#97979A] text-[16px] leading-5 font-medium">
                xSTBL instant exit fee
              </span>
              <span className="font-semibold">50%</span>
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
                Inter-chain power allocation delay
              </span>
              <span className="font-semibold">1 day</span>
            </div>
          </div>
        </div>
      </div>
    </WagmiLayout>
  );
};

export { DAO };
