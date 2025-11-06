import { useEffect, useState, useCallback } from "react";

import axios from "axios";

import { SPACE_ID, SNAPSHOT_API } from "../constants";

type TProposal = {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: string;
  author: string;
  space: {
    id: string;
    name: string;
  };
};

type TResult = {
  data: TProposal[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useProposals = (): TResult => {
  const [data, setData] = useState<TProposal[]>();

  const [isLoading, setIsLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);

    const query = `
      query Proposals {
        proposals(
          first: 20,
          skip: 0,
          where: { space_in: ["${SPACE_ID}"] }
          orderBy: "created"
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
        }
      }
    `;

    try {
      const { data } = await axios.post(SNAPSHOT_API, { query });

      setData(data?.data?.proposals ?? []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, []);

  return { data, isLoading, refetch: fetchProposals };
};
