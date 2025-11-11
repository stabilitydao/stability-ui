import { assets } from "@stabilitydao/stability";

import { TAddress } from "@types";

const SPACE_ID = "stabilitydao.eth";

const SNAPSHOT_API = "https://hub.snapshot.org/graphql";

const VESTING_ADDRESSES = {
  foundation: "0x8C42C261A3104cEEFBb388CFd6C1f0E7c9F22062",
  community: "0xEF2CE83527FAE22E0012Efc4d64987C1a51448c5",
};

const STBL_DAO = assets?.find((asset) => asset?.symbol === "STBL_DAO")
  ?.addresses?.["146"] as TAddress;

export { SPACE_ID, SNAPSHOT_API, VESTING_ADDRESSES, STBL_DAO };
