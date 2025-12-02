"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { erc20Abi, Address } from "viem";
import { readContract } from "@wagmi/core";
import { dashboardData, poolData, tokenData } from "./constants/data";
import {
  CheckmarkIcon,
  CopyIcon,
  ExternalLinkIcon,
  SearchIcon,
} from "./ui/icons";
import { FullPageLoader } from "./ui/FullPageLoader";
import { wagmiConfig, RamsesV3PoolABI } from "@web3";
import { DashboardGrid } from "./components/Dashboard";
import { GetPriceReturn, PriceCache, Token } from "./types";
import { PriceCell } from "./components/PriceCell";
import { TablePagination } from "./components/TablePagination";

/* ----------------------------- Utilities ----------------------------- */

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

/* -------------------------- RecoveryDashboard ------------------------- */

const RecoveryDashboard: React.FC = (): JSX.Element => {
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Caches
  const [priceCache, setPriceCache] = useState<PriceCache>({});
  const [tokenBurnProgress, setTokenBurnProgress] = useState<
    Record<string, number>
  >({});
  const [averageBurnRate, setAverageBurnRate] = useState<number | null>(null);
  const [totalBurnPercent, setTotalBurnPercent] = useState<number | null>(null);

  // Flags
  const [isTokensLoaded, setIsTokensLoaded] = useState(false);
  const [isPoolsLoaded, setIsPoolsLoaded] = useState(false);
  const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);

  // Derived single loading flag
  const isLoading = !(
    isTokensLoaded &&
    isPoolsLoaded &&
    averageBurnRate !== null &&
    totalBurnPercent !== null &&
    isDashboardLoaded
  );

  /* -------------------------- Callbacks -------------------------- */

  const handleCopyAddress = useCallback((address: string, id: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleExternalLink = useCallback((address: string) => {
    window.open(`https://sonicscan.org/address/${address}`, "_blank");
  }, []);

  const getPriceOnChain = useCallback(
    async (poolAddress: Address): Promise<GetPriceReturn> => {
      const token0 = (await readContract(wagmiConfig, {
        address: poolAddress,
        abi: RamsesV3PoolABI,
        functionName: "token0",
      })) as Address;

      const token1 = (await readContract(wagmiConfig, {
        address: poolAddress,
        abi: RamsesV3PoolABI,
        functionName: "token1",
      })) as Address;

      const d0 = (await readContract(wagmiConfig, {
        address: token0,
        abi: erc20Abi,
        functionName: "decimals",
      })) as number;

      const d1 = (await readContract(wagmiConfig, {
        address: token1,
        abi: erc20Abi,
        functionName: "decimals",
      })) as number;

      const sym0 = (await readContract(wagmiConfig, {
        address: token0,
        abi: erc20Abi,
        functionName: "symbol",
      })) as string;

      const sym1 = (await readContract(wagmiConfig, {
        address: token1,
        abi: erc20Abi,
        functionName: "symbol",
      })) as string;

      const slot0 = (await readContract(wagmiConfig, {
        address: poolAddress,
        abi: RamsesV3PoolABI,
        functionName: "slot0",
      })) as [bigint, number, number, number, number, number, boolean];

      const sqrtPriceX96 = BigInt(slot0[0]);
      const Q96 = BigInt(2n ** 96n);

      const p_raw = Number(sqrtPriceX96 * sqrtPriceX96) / Number(Q96 * Q96);
      const decimalAdj = 10 ** (d0 - d1);

      const price_token1_per_token0 = p_raw * decimalAdj;
      const price_token0_per_token1 = 1 / price_token1_per_token0;

      return { price_token1_per_token0, price_token0_per_token1, sym0, sym1 };
    },
    []
  );

  const getBurnProgressOnChain = useCallback(
    async (token: Token): Promise<number> => {
      try {
        const currentSupply = (await readContract(wagmiConfig, {
          address: token.address,
          abi: erc20Abi,
          functionName: "totalSupply",
        })) as bigint;

        const amountBurnt = token.initialSupply - currentSupply;
        return Number((amountBurnt * 100000n) / token.initialSupply) / 1000;
      } catch {
        return 0;
      }
    },
    []
  );

  const computeAverageBurnRate = useCallback((map: Record<string, number>) => {
    const values = Object.values(map);
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
  }, []);

  const computeTotalBurnPercent = useCallback(async (tokens: Token[]) => {
    let totalInitial = 0n;
    let totalBurned = 0n;

    for (const token of tokens) {
      try {
        const currentSupply = (await readContract(wagmiConfig, {
          address: token.address,
          abi: erc20Abi,
          functionName: "totalSupply",
        })) as bigint;

        totalInitial += token.initialSupply;
        totalBurned += token.initialSupply - currentSupply;
      } catch { }
    }

    if (totalInitial === 0n) return 0;
    return Number((totalBurned * 10000n) / totalInitial) / 100;
  }, []);

  /* -------------------------- Fetch Flows -------------------------- */

  useEffect(() => {
    let mounted = true;

    const fetchAllTokenBurns = async () => {
      const progressMap: Record<string, number> = {};

      const promises = (tokenData as Token[]).map((t) =>
        getBurnProgressOnChain(t)
          .then((p) => ({ address: t.address, p }))
          .catch(() => ({ address: t.address, p: 0 }))
      );

      const results = await Promise.all(promises);
      results.forEach((r) => (progressMap[r.address] = r.p));

      if (!mounted) return;

      setTokenBurnProgress(progressMap);
      setIsTokensLoaded(true);

      const avg = computeAverageBurnRate(progressMap);
      setAverageBurnRate(avg);

      const total = await computeTotalBurnPercent(tokenData as Token[]);
      if (mounted) setTotalBurnPercent(total);
    };

    fetchAllTokenBurns();
    return () => {
      mounted = false;
    };
  }, [getBurnProgressOnChain, computeAverageBurnRate, computeTotalBurnPercent]);

  useEffect(() => {
    let mounted = true;

    const fetchAllPoolPrices = async () => {
      const cache: PriceCache = {};

      const results = await Promise.all(
        (poolData || []).map((pool) =>
          getPriceOnChain(pool.address)
            .then((p) => ({ address: pool.address, p }))
            .catch(() => ({ address: pool.address, p: null }))
        )
      );

      results.forEach((r) => {
        if (r.p) cache[r.address] = r.p;
      });

      if (!mounted) return;

      setPriceCache(cache);
      setIsPoolsLoaded(true);
    };

    fetchAllPoolPrices();
    return () => {
      mounted = false;
    };
  }, [getPriceOnChain]);

  useEffect(() => {
    if (
      isTokensLoaded &&
      isPoolsLoaded &&
      averageBurnRate !== null &&
      totalBurnPercent !== null
    ) {
      setIsDashboardLoaded(true);
    }
  }, [isTokensLoaded, isPoolsLoaded, averageBurnRate, totalBurnPercent]);

  /* -------------------------- Derived & Pagination -------------------------- */

  const filteredPools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return poolData;
    return poolData.filter(
      (pool) =>
        pool.pair.toLowerCase().includes(q) ||
        pool.address.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPools.length / itemsPerPage));
  }, [filteredPools.length, itemsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPools = filteredPools.slice(startIndex, endIndex);

  /* -------------------------- Handlers -------------------------- */

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const getBurnStatus = useCallback(
    (address: Address) => {
      const progress = tokenBurnProgress[address] ?? 0;
      return progress > 0 ? "Burned" : "No tokens burned";
    },
    [tokenBurnProgress]
  );

  return (
    <>
      <div className="space-y-10">
        {/* ----------------------- Dashboard Section ----------------------- */}
        <section>
          <h1 className="text-white font-semibold text-[clamp(30px,1vw+26px,38px)] leading-loose -mb-1 text-start">
            Recovery Dashboard
          </h1>

          <p className="text-[#9798A4] font-medium text-[clamp(18px,0.28vw+18px,20px)]">
            Monitor recovery pool prices and token burn progress
          </p>

          {!isLoading && (
            <DashboardGrid
              cards={dashboardData}
              averageBurnRate={averageBurnRate}
              totalBurnPercent={totalBurnPercent}
            />
          )}
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-24 min-w-full lg:min-w-[960px] xl:min-w-[1200px]">
            <FullPageLoader />
          </div>
        ) : (
          <>
            {/* ----------------------- Recovery Tokens ----------------------- */}
            <section>
              <h1 className="text-white leading-loose text-[clamp(20px,0.5vw+19px,24px)] font-semibold -mb-1 text-start">
                Recovery Tokens
              </h1>
              <p className="text-[#97979A] font-medium text-[clamp(14px,0.35vw+13px,16px)]">
                Monitor recovery token burn progress
              </p>

              <div className="bg-[#101012] border border-[#23252A] rounded-lg overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div
                      className="grid gap-4 px-6 py-3 bg-[#151618] border-b border-[#23252A] text-[#97979A] text-sm font-semibold"
                      style={{ gridTemplateColumns: "clamp(60px, 15vw, 250px) 1fr 2fr" }}
                    >
                      {["Token", "Token Address", "Recovery Progress"].map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                    </div>

                    {tokenData.map((token) => (
                      <div
                        key={token.name}
                        className="grid gap-4 px-6 h-16 border-b border-[#23252A] last:border-b-0 items-center"
                        style={{ gridTemplateColumns: "clamp(60px, 15vw, 250px) 1fr 2fr" }}
                      >
                        <a
                          className="text-white truncate font-semibold text-sm"
                          href={`https://sonicscan.org/address/${token.address}`}
                        >
                          {token.symbol}
                        </a>

                        <div className="flex items-center gap-2">
                          <span className="text-[#EAECEF] font-mono text-sm">
                            {truncateAddress(token.address)}
                          </span>

                          <button
                            onClick={() => handleCopyAddress(token.address, token.address)}
                            className="h-6 w-6 flex items-center justify-center"
                          >
                            {copiedId === token.address ? (<CheckmarkIcon />) : (<CopyIcon />)}
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-[#97979A] text-sm mb-2">
                              {getBurnStatus(token.address)}
                            </div>
                            <div className="w-full bg-[#23252A] rounded-full h-2">
                              <div
                                className="bg-[#7C3BED] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${tokenBurnProgress[token.address] ?? 0}%` }}
                              />
                            </div>
                          </div>

                          <span className="text-[#97979A] font-semibold text-sm min-w-[50px] text-right">
                            {(tokenBurnProgress[token.address] ?? 0).toFixed(2)} %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------- Recovery Pools ----------------------- */}
            <section className="pb-10">
              <h1 className="text-white leading-12 text-[clamp(32px,2.86vw,40px)] font-bold mb-2 text-start">
                Recovery Pools
              </h1>
              <p className="text-[#97979A] leading-8 text-[clamp(18px,0.28vw+18px,20px)] font-medium">
                View recovery pool prices and trading pairs
              </p>

              <div className="bg-[#151618] border-b border-[#23252A] rounded-lg overflow-hidden mt-4 p-6">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#97979A]" />
                  <input
                    type="text"
                    placeholder="Search pool by pair or address..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full max-w-lg bg-transparent border border-[#626366] rounded-lg pl-10 pr-4 py-2 text-[#97979A] placeholder-[#97979A] focus:outline-none text-sm md:text-base font-medium"
                  />
                </div>
              </div>

              <div className="bg-[#101012] border border-[#23252A] rounded-lg overflow-hidden mt-4 w-full">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div
                      className="grid gap-8 px-6 py-3 bg-[#151618] border-b border-[#23252A] text-[#9798A4] text-sm font-medium"
                      style={{ gridTemplateColumns: "clamp(60px, 23vw, 320px) clamp(150px, 43vw, 600px) 1fr" }}
                    >
                      {["Pair", "Pool Address", "Price"].map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                    </div>

                    {currentPools.length > 0 ? (
                      currentPools.map((pool) => (
                        <div
                          key={pool.name}
                          className="grid gap-8 px-6 py-4 border-b border-[#23252A] items-center"
                          style={{ gridTemplateColumns: "clamp(60px, 23vw, 320px) clamp(150px, 43vw, 600px) 1fr" }}
                        >
                          <a
                            className="text-white truncate font-semibold text-sm"
                            href={pool.url}
                          >
                            {pool.pair}
                          </a>

                          <div className="flex items-center gap-2">
                            <span className="text-[#EAECEF] font-mono text-sm">
                              {truncateAddress(pool.address)}
                            </span>

                            <button
                              onClick={() => handleCopyAddress(pool.address, pool.address)}
                              className="h-6 w-6 flex items-center justify-center"
                            >
                              {copiedId === pool.address ? (<CheckmarkIcon />) : (<CopyIcon />)}
                            </button>

                            <button
                              onClick={() => handleExternalLink(pool.address)}
                              className="h-6 w-6 flex items-center justify-center text-[#EAECEF]"
                            >
                              <ExternalLinkIcon />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <PriceCell price={priceCache[pool.address]} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <p className="text-gray-500 text-sm">
                          No pools found matching "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {filteredPools.length > 0 && (
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredPools.length}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export { RecoveryDashboard };
