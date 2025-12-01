export type SortField =
  | "token"
  | "burnProgress"
  | "vault"
  | "pair"
  | "price"
  | null;
export type SortDirection = "asc" | "desc" | null;

export interface DashboardCardData {
  title: string;
  value: string;
  subtitle?: string | null;
  change?: string | null;
  changeType?: string | null;
}

export interface Token {
  id: number;
  token: string;
  tokenAddress: string;
  burnStatus: string;
  burnProgress: number;
}

export interface Pool {
  id: number;
  vault: string;
  pair: string;
  tokenAddress: string;
  price: number;
}
