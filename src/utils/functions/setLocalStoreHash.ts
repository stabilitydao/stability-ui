import type { TAddress } from "@types";

type TPropsTokens = {
  [address: string]: {
    amount: string;
  };
};

type TProps = {
  hash: TAddress;
  status: string;
  timestamp: number;
  tokens: TPropsTokens[];
  type: string;
  vault: TAddress;
};

const setLocalStoreHash = (obj: TProps): void => {
  localStorage.setItem("lastTx", JSON.stringify(obj));
};

export { setLocalStoreHash };
