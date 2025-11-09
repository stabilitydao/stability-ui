import { Badge } from "../../Badge";

import { cn } from "@utils";

import type { TProposal, TVote } from "@types";

interface IProps {
  proposal: TProposal;
  isLast: boolean;
}

const BADGE_CONFIG = {
  pending: { text: "Upcoming", state: "warning" },
  active: { text: "Open for voting", state: "success" },
  closed: { text: "Executed", state: "default" },
  unknown: { text: "Unknown", state: "default" },
} as const;

const Row: React.FC<IProps> = ({ proposal, isLast }) => {
  const badge =
    BADGE_CONFIG[proposal.state as keyof typeof BADGE_CONFIG] ??
    BADGE_CONFIG["unknown"];

  return (
    <a
      className={cn(
        "bg-[#101012] border-b border-x border-[#23252A] cursor-pointer min-w-full",
        isLast && "rounded-b-lg"
      )}
      href={`https://snapshot.box/#/s:stabilitydao.eth/proposal/${proposal.id}`}
      target="_blank"
    >
      <div className="flex items-start justify-between flex-col gap-5 md:gap-0 md:flex-row p-4">
        <div className="flex flex-col items-start justify-between gap-4 w-full md:w-[70%]">
          <Badge {...badge} greater />
          <span className="text-[16px] leading-5 md:text-[20px] md:leading-7 font-semibold">
            {proposal.title}
          </span>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          {proposal.votes.map((vote: TVote) => {
            return (
              <div key={vote.choice} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-medium">
                  <div className="flex gap-2">
                    <span>{vote.choice}</span>
                    <span className=" font-semibold">{vote.count}</span>
                  </div>

                  <span className="text-[#97979A]">{vote.percent}%</span>
                </div>

                <div className="w-full h-2 rounded bg-[#18191C] overflow-hidden">
                  <div
                    className="h-2 bg-[#9180F4] rounded transition-all duration-300"
                    style={{ width: `${vote.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </a>
  );
};

export { Row };
