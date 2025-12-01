"use client";

import { useState, useEffect } from "react";
import { erc20Abi, Address } from "viem";
import { readContract } from "@wagmi/core";
import { dashboardData, poolData, tokenData } from "./constants/data";
import {
  BackwardIcon,
  CheckmarkIcon,
  CopyIcon,
  ExternalLinkIcon,
  ForwardIcon,
  SearchIcon,
} from "./ui/icons";
import { wagmiConfig, RamsesV3PoolABI } from "@web3";

const RecoveryDashboard = (): JSX.Element => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [tokenBurnProgress, setTokenBurnProgress] = useState<Record<string, number>>({});
  const [averageBurnRate, setAverageBurnRate] = useState<number | null>(null);
  const [totalBurnPercent, setTotalBurnPercent] = useState<number | null>(null);

  // Filter pools based on search query
  const filteredPools = poolData.filter((pool) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      pool.pair.toLowerCase().includes(query) ||
      pool.address.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPools = filteredPools.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExternalLink = (address: string) => {
    window.open(`https://sonicscan.org/address/${address}`, "_blank");
  };

  const getPrice = async (poolAddress: Address) => {
    const token0 = await readContract(wagmiConfig, {
      address: poolAddress,
      abi: RamsesV3PoolABI,
      functionName: "token0",
    });

    const token1 = await readContract(wagmiConfig, {
      address: poolAddress,
      abi: RamsesV3PoolABI,
      functionName: "token1",
    });

    const d0 = await readContract(wagmiConfig, {
      address: token0,
      abi: erc20Abi,
      functionName: "decimals",
    });

    const d1 = await readContract(wagmiConfig, {
      address: token1,
      abi: erc20Abi,
      functionName: "decimals",
    });

    const sym0 = await readContract(wagmiConfig, {
      address: token0,
      abi: erc20Abi,
      functionName: "symbol",
    });

    const sym1 = await readContract(wagmiConfig, {
      address: token1,
      abi: erc20Abi,
      functionName: "symbol",
    });

    const slot0 = await readContract(wagmiConfig, {
      address: poolAddress,
      abi: RamsesV3PoolABI,
      functionName: "slot0",
    });

    const sqrtPriceX96 = BigInt(slot0[0]);
    const Q96 = BigInt(2n ** 96n);

    const p_raw = Number(sqrtPriceX96 * sqrtPriceX96) / Number(Q96 * Q96);
    // price_token1_per_token0 = p_raw * 10^(d0 - d1)
    const decimalAdj = 10 ** (d0 - d1);
    // price of token0 in token1
    const price_token1_per_token0 = p_raw * decimalAdj; // 1 token0 = x(token1)

    // Also the inverted price
    // price of token1 in token0
    const price_token0_per_token1 = 1 / price_token1_per_token0; // 1 token1 = x(token0)

    return { price_token1_per_token0, price_token0_per_token1, sym0, sym1 };
  };

  type GetPriceReturn = Awaited<ReturnType<typeof getPrice>>;

  type PriceCellProps = {
    poolAddress: Address;
    getPrice: (poolAddress: Address) => Promise<GetPriceReturn>;
  };

  const PriceCell = ({ poolAddress, getPrice }: PriceCellProps) => {
    const [price, setPrice] = useState<GetPriceReturn | null>(null);

    useEffect(() => {
      let alive = true;

      getPrice(poolAddress).then((p) => {
        if (alive) setPrice(p);
      });

      return () => { alive = false };
    }, [poolAddress, getPrice]);

    if (!price) {
      return <div className="text-[#97979A] text-sm">Loading...</div>;
    }

    return (
      <div className="text-[#EAECEF] font-medium text-sm whitespace-nowrap flex flex-col">
        <span>
          1 {price.sym0} = {price.price_token1_per_token0.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })} {price.sym1}
        </span>

        <span>
          1 {price.sym1} = {price.price_token0_per_token1.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })} {price.sym0}
        </span>
      </div>
    );
  };

  type Token = {
    name: string;
    symbol: string;
    address: Address;
    initialSupply: bigint;
    decimals: number;
  };

  const getBurnProgress = async (token: Token): Promise<number> => {
    // Read current total supply from the contract
    const currentSupply = await readContract(wagmiConfig, {
      address: token.address,
      abi: erc20Abi,
      functionName: "totalSupply",
    });

    // Calculate amount burnt
    const amountBurnt = token.initialSupply - currentSupply;

    // Calculate burn progress as percentage
    const burn_progress = Number((amountBurnt * 100000n) / token.initialSupply) / 1000;

    return burn_progress;
  };

  const getBurnStatus = (address: Address) => {
    const progress = tokenBurnProgress[address] ?? 0;
    return progress > 0 ? "Burned" : "No tokens burned";
  };

  const getAverageBurnRate = async (): Promise<number> => {
    let totalBurnRate = 0;

    for (const token of tokenData) {
      const progress = await getBurnProgress(token);
      totalBurnRate += progress;
    }

    const averageBurnRate = totalBurnRate / tokenData.length;
    return averageBurnRate;
  };

  const getTotalBurnPercent = async (): Promise<number> => {
    let totalInitial = 0n;
    let totalBurned = 0n;

    for (const token of tokenData) {
      const currentSupply = await readContract(wagmiConfig, {
        address: token.address,
        abi: erc20Abi,
        functionName: "totalSupply",
      });

      const burned = token.initialSupply - currentSupply;

      totalInitial += token.initialSupply;
      totalBurned += burned;
    }

    // Calculate combined burn percentage
    const percent = Number((totalBurned * 10000n) / totalInitial) / 100;
    return percent;
  };

  useEffect(() => {
    let alive = true;

    const fetchBurnProgress = async () => {
      const progressMap: Record<string, number> = {};

      for (const token of tokenData) {
        try {
          const progress = await getBurnProgress(token);
          progressMap[token.address] = progress;
        } catch (err) {
          console.error(`Failed to fetch burn progress for ${token.symbol}`, err);
          progressMap[token.address] = 0;
        }
      }

      if (alive) setTokenBurnProgress(progressMap);
    };

    const fetchAverageBurnRate = async () => {
      const avg = await getAverageBurnRate();
      if (alive) setAverageBurnRate(avg);
    };

    const fetchTotalBurnPercent = async () => {
      const p = await getTotalBurnPercent();
      if (alive) setTotalBurnPercent(p);
    };

    fetchBurnProgress();
    fetchAverageBurnRate();
    fetchTotalBurnPercent();

    return () => { alive = false; };
  }, []);

  return (
    <>
      <div className="space-y-8">
        {/* Dashboard Cards Section */}
        <section>
          <h1 className="text-white font-semibold leading-12 text-[clamp(32px,2.86vw,40px)] mb-2 text-start">
            Recovery Dashboard
          </h1>
          <p className="text-[#9798A4] font-medium leading-8 text-[clamp(18px,0.28vw+18px,20px)]">
            Monitor recovery pool prices and token burn progress
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {dashboardData.map((card, index) => (
              <div
                key={index}
                className="bg-[#101012] backdrop-blur-md border border-[#23252A] rounded-lg p-6 hover:bg-[#23252A] flex flex-col gap-2"
              >
                <h3 className="text-[#9798A4] text-base">{card.title}</h3>

                <p className="text-white text-[32px] font-bold">
                  {index === 1
                    ? averageBurnRate !== null
                      ? averageBurnRate.toFixed(2) + "%"
                      : "Loading..."
                    : card.value
                  }
                </p>

                {card.subtitle && (
                  <p className="text-[#9798A4] text-base">{card.subtitle}</p>
                )}

                {index === 1 ? (
                  <p className="text-green-500 text-sm">
                    {totalBurnPercent !== null
                      ? totalBurnPercent.toFixed(2) + "% burned across all tokens"
                      : "Loading..."}
                  </p>
                ) : card.change && (
                  <p
                    className={`text-sm ${card.changeType === "positive"
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    {card.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recovery Tokens Section */}
        <section>
          <h1 className="text-white leading-12 text-[clamp(32px,2.86vw,40px)] font-bold mb-2 text-start">
            Recovery Tokens
          </h1>
          <p className="text-[#97979A] leading-8 text-[clamp(18px,0.28vw+18px,20px)] font-medium">
            Monitor recovery token burn progress
          </p>

          <div className="bg-[#101012] border border-[#23252A] rounded-lg overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div
                  className="grid gap-4 px-6 py-3 bg-[#151618] border-b border-[#23252A] text-[#97979A] text-sm font-semibold"
                  style={{
                    gridTemplateColumns: "clamp(60px, 15vw, 250px) 1fr 2fr",
                  }}
                >
                  {["Token", "Token Address", "Recovery Progress"].map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>

                {/* Table Body */}
                {tokenData.map((token) => (
                  <div
                    key={token.name}
                    className="grid gap-4 px-6 h-16 border-b border-[#23252A] last:border-b-0 lg:bg-transparent transition-colors items-center"
                    style={{
                      gridTemplateColumns: "clamp(60px, 15vw, 250px) 1fr 2fr",
                    }}
                  >
                    {/* Token Symbol */}
                    <a
                      className="text-white truncate font-semibold text-sm overflow-hidden whitespace-nowrap"
                      title={token.name}
                      href={`https://sonicscan.org/address/${token.address}`}
                    >
                      {token.symbol}
                    </a>

                    {/* Token Address */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#EAECEF] font-mono text-sm">
                        {truncateAddress(token.address)}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyAddress(token.address, token.address)
                        }
                        className="flex items-center justify-center cursor-pointer h-6 w-6 p-0"
                      >
                        {copiedId === token.address ? <CheckmarkIcon /> : <CopyIcon />}
                      </button>
                    </div>

                    {/* Burn Progress */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-[#97979A] text-sm mb-2">
                          {getBurnStatus(token.address)}
                        </div>
                        <div className="w-full bg-[#23252A] rounded-full h-2">
                          <div
                            className="bg-[#7C3BED] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${tokenBurnProgress[token.address] ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-[#97979A] font-semibold text-sm min-w-[50px] text-right">
                        {tokenBurnProgress[token.address]?.toFixed(2) ?? 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recovery Pools Section with Pagination */}
        <section className="pb-10">
          <h1 className="text-white leading-12 text-[clamp(32px,2.86vw,40px)] font-bold mb-2 text-start">
            Recovery Pools
          </h1>
          <p className="text-[#97979A] leading-8 text-[clamp(18px,0.28vw+18px,20px)] font-medium">
            View recovery pool prices and trading pairs
          </p>

          <div className="bg-[#151618] border-b border-[#23252A] rounded-lg overflow-hidden mt-8 p-6">
            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#97979A]" />
              <input
                type="text"
                placeholder="Search pool by pair or address..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full max-w-lg bg-transparent border border-[#626366] rounded-lg pl-10 pr-4 py-2 text-[#97979A] placeholder-[#97979A] focus:outline-none text-sm md:text-base placeholder:text-xs md:placeholder:text-sm font-medium"
              />
            </div>
          </div>

          <div className="bg-[#101012] border border-[#23252A] rounded-lg overflow-hidden mt-4 w-full">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div
                  className="grid gap-8 px-6 py-3 bg-[#151618] border-b border-[#23252A] text-[#9798A4] text-left text-sm font-medium"
                  style={{
                    gridTemplateColumns:
                      "clamp(60px, 23vw, 320px) clamp(150px, 43vw, 600px) 1fr",
                  }}
                >
                  {/* TODO: Vault, Pair, Pool Address, Price */}
                  {["Pair", "Pool Address", "Price"].map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>

                {/* Table Body */}
                {currentPools.length > 0 ? (
                  currentPools.map((pool) => (
                    <div
                      key={pool.name}
                      className="grid gap-8 px-6 py-4 border-b border-[#23252A] last:border-b-0 lg:bg-transparent text-start"
                      style={{
                        gridTemplateColumns:
                          "clamp(60px, 23vw, 320px) clamp(150px, 43vw, 600px) 1fr",
                      }}
                    >
                      {/* Pair */}
                      <a
                        className="text-white truncate font-semibold text-sm overflow-hidden whitespace-nowrap pr-4"
                        title={pool.name}
                        href={pool.url}
                      >
                        {pool.pair}
                      </a>

                      {/* Pool Address */}
                      <div className="flex items-center gap-2">
                        <span className="text-[#EAECEF] font-mono text-sm">
                          {truncateAddress(pool.address)}
                        </span>

                        <button
                          onClick={() =>
                            handleCopyAddress(pool.address, pool.address)
                          }
                          className="flex items-center justify-center cursor-pointer h-6 w-6 p-0"
                        >
                          {copiedId === pool.address ? (
                            <CheckmarkIcon />
                          ) : (
                            <CopyIcon />
                          )}
                        </button>

                        <button
                          onClick={() => handleExternalLink(pool.address)}
                          className="flex items-center justify-center cursor-pointer h-6 w-6 p-0 text-[#EAECEF]"
                          title="View on explorer"
                        >
                          <ExternalLinkIcon />
                        </button>
                      </div>

                      {/* Price */}
                      <PriceCell poolAddress={pool.address} getPrice={getPrice} />
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      {`No pools found matching "${searchQuery}"`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {filteredPools.length > 0 && (
              <div className="flex items-center justify-between text-sm md:px-6 bg-[#151618] border-t border-[#23252A]">
                {/* Left side - Items per page */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 py-3">
                    <span className="text-[#97979A]">Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="text-white bg-[#151618] cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                  <span className="text-[#97979A] border-r md:border-l border-[#23252a] px-4 py-3">
                    {startIndex + 1}-{Math.min(endIndex, filteredPools.length)} of{" "}
                    {filteredPools.length} items
                  </span>
                </div>

                {/* Right side - Navigation */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
                    >
                      &lt; Previous
                    </button>
                    <span className="text-[#97979A]">
                      {currentPage} of {totalPages} pages
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed px-3"
                    >
                      Next &gt;
                    </button>
                  </div>
                  <div className="flex items-center gap-4 md:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="border-r border-l border-[#23252a] py-3 px-4 text-white disabled:text-[#97979A] disabled:cursor-not-allowed cursor-pointer"
                    >
                      <BackwardIcon className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="py-3 pr-4 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ForwardIcon className="w-4 h-4 rotate-270" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export { RecoveryDashboard };
