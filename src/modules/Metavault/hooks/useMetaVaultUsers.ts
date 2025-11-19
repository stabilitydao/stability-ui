import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import axios from "axios";

import { metaVaultsUsers } from "@store";

import { seeds } from "@stabilitydao/stability";

import type { TAddress, TMetaVaultUser } from "@types";

type TResult = {
  data: TMetaVaultUser[] | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useMetaVaultUsers = (
  network: string,
  metavault: TAddress
): TResult => {
  const $metaVaultsUsers = useStore(metaVaultsUsers);

  const data = $metaVaultsUsers[metavault];

  const fetchUsers = async () => {
    try {
      const req = await axios.get(
        `${seeds[0]}/metavaults/${network}/${metavault}/users`
      );

      const usersData = req?.data;

      if (usersData) {
        metaVaultsUsers.setKey(metavault, usersData);
      }
    } catch (error) {
      console.error("Get meta vault users error:", error);
    }
  };

  useEffect(() => {
    if (!data) {
      fetchUsers();
    }
  }, [metavault, network]);

  return {
    data,
    isLoading: !data,
    refetch: fetchUsers,
  };
};
