import { FullPageLoader, ProposalsTable } from "@ui";

import { useProposals } from "../hooks";

import type { TProposal } from "@types";

const Table: React.FC = () => {
  const { data: proposals, isLoading: isProposalsLoading } = useProposals();

  return (
    <div className="">
      <div className="">
        <div className="flex items-center bg-[#151618] border border-[#23252A] border-b-0 rounded-t-lg h-[48px]">
          <div className="flex items-center justify-between px-4 w-full">
            <span className="text-[20px] leading-6 font-semibold">
              Proposals
            </span>
            <a
              className="text-sm font-semibold flex items-center gap-2"
              href="https://snapshot.box/#/s:stabilitydao.eth"
              target="_blank"
            >
              <p>Snapshots</p>
              <img
                src="/icons/purple_link.png"
                alt="external link"
                className="w-3 h-3 cursor-pointer"
              />
            </a>
          </div>
        </div>
        <div>
          {isProposalsLoading ? (
            <div className="relative h-[280px] flex items-center justify-center bg-[#101012] border border-[#23252A] rounded-b-lg">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <FullPageLoader />
              </div>
            </div>
          ) : (
            <ProposalsTable proposals={proposals as TProposal[]} />
          )}
        </div>
      </div>
      {/* <Pagination
                  pagination={pagination}
                  data={filteredVaults}
                  tab={currentTab}
                  display={displayType}
                  setTab={setCurrentTab}
                  setPagination={setPagination}
                /> */}
    </div>
  );
};

export { Table };
