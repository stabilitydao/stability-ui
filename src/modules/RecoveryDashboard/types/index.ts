import { Address } from "viem";

interface DashboardCardData {
  title: string;
  value: string | number | null;
  subtitle?: string | null;
  change?: string | null;
  changeType?: string | null;
  specialType?: string | null;
}

type GetPriceReturn = {
  price_token1_per_token0: number;
  price_token0_per_token1: number;
  sym0: string;
  sym1: string;
};

type PriceCache = Record<string, GetPriceReturn>;

type Token = {
  name: string;
  symbol: string;
  address: Address;
  initialSupply: bigint;
  decimals: number;
};

type PriceCellProps = {
  price?: GetPriceReturn | null;
};

interface Column {
  label: string;
  sortable: boolean;
  onSort?: () => void;
}

export type {
  Column,
  PriceCellProps,
  Token,
  PriceCache,
  GetPriceReturn,
  DashboardCardData,
};
