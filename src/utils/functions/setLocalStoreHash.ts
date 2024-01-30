import type { TAddress } from "@types";

type TProps = {
  hash: TAddress;
  status: string;
  timestamp: number;
  tokens: any[];
  type: string;
  vault: TAddress;
};

const setLocalStoreHash = (obj: TProps) => {
  localStorage.setItem("lastTx", JSON.stringify(obj));
};

export { setLocalStoreHash };
