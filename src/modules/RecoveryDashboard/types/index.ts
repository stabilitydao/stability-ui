import { Address } from "viem";

export interface DashboardCardData {
  title: string;
  value: string | number | null;
  subtitle?: string | null;
  change?: string | null;
  changeType?: string | null;
  specialType?: string | null;
}

export type GetPriceReturn = {
  price_token1_per_token0: number;
  price_token0_per_token1: number;
  sym0: string;
  sym1: string;
};

export type PriceCache = Record<string, GetPriceReturn>;

export type Token = {
  name: string;
  symbol: string;
  address: Address;
  initialSupply: bigint;
  decimals: number;
};

export type PriceCellProps = {
  price?: GetPriceReturn | null;
};

export interface Column {
  label: string;
  sortable: boolean;
  onSort?: () => void;
}
