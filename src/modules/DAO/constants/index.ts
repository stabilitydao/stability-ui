import { assets } from "@stabilitydao/stability";

import { TAddress } from "@types";

const VESTING_ADDRESSES = {
  foundation: "0x8C42C261A3104cEEFBb388CFd6C1f0E7c9F22062",
  community: "0xEF2CE83527FAE22E0012Efc4d64987C1a51448c5",
};

const STBL_DAO = assets?.find((asset) => asset?.symbol === "STBL_DAO")
  ?.addresses?.["146"] as TAddress;

export { VESTING_ADDRESSES, STBL_DAO };
