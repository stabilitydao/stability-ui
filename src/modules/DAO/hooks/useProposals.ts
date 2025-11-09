import { useEffect, useState } from "react";

import axios from "axios";

import { countVotes } from "../functions";

import { SPACE_ID, SNAPSHOT_API } from "../constants";

import { TProposal } from "@types";

type TResult = {
  data: TProposal[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useProposals = (): TResult => {
  const [data, setData] = useState<TProposal[]>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposals = async () => {
    setIsLoading(true);

    const proposalsQuery = `
      query Proposals {
        proposals(
          first: 10,
          skip: 0,
          where: { space_in: ["${SPACE_ID}"] }
          orderBy: "created"
          orderDirection: desc
        ) {
          id
          title
          choices
          state
        }
      }
    `;

    try {
      const { data } = await axios.post(SNAPSHOT_API, {
        query: proposalsQuery,
      });

      const proposals: TProposal[] = data?.data?.proposals ?? [];

      const proposalsWithVotes = await Promise.all(
        proposals.map(async (proposal) => {
          const votesQuery = `
            query Votes {
              votes(
                first: 100
                where: { proposal: "${proposal.id}" }
              ) {
                id
                voter
                choice
              }
            }
          `;

          try {
            const { data } = await axios.post(SNAPSHOT_API, {
              query: votesQuery,
            });

            const votes = countVotes({
              ...proposal,
              votes: data?.data?.votes ?? [],
            });

            return { ...proposal, votes };
          } catch (err) {
            console.error(`Error fetching votes for ${proposal.id}:`, err);
            return { ...proposal, votes: [] };
          }
        })
      );

      setData(proposalsWithVotes);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return { data, isLoading, refetch: fetchProposals };
};
