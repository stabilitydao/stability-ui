import type { TAddress } from "@types";

type TProps = {
  hash: TAddress;
  status: string;
  timestamp: number;
  tokens: TAddress[];
  type: string;
  vault: TAddress;
};

const setLocalStoreHash = (obj: TProps) => {
  console.log(obj);
  localStorage.setItem("lastTx", JSON.stringify(obj));
};

export { setLocalStoreHash };
