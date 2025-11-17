import { TVote, TProposal } from "@types";

export const countVotes = (proposal: TProposal): TVote[] => {
  const counts = Array(proposal.choices.length).fill(0);

  for (const vote of proposal.votes) {
    const choice = vote.choice;

    if (Array.isArray(choice)) {
      for (const _ of choice) {
        const index = _ - 1;
        if (counts[index] !== undefined) counts[index]++;
      }
    } else if (typeof choice === "number") {
      const index = choice - 1;
      if (counts[index] !== undefined) counts[index]++;
    } else if (Array.isArray(choice) && choice.length === 1) {
      const index = choice[0] - 1;
      if (counts[index] !== undefined) counts[index]++;
    }
  }

  const totalVotes = counts.reduce((sum, n) => sum + n, 0);

  const results = proposal.choices.map((label, i) => ({
    choice: label,
    count: counts[i],
    percent:
      totalVotes > 0 ? ((counts[i] / totalVotes) * 100).toFixed(2) : "0.00",
  }));

  return results;
};
