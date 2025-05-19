import { useState, useEffect } from "react";

import { FullPageLoader } from "@ui";

const Metavaults = (): JSX.Element => {
  const initMetavaults = async () => {};

  useEffect(() => {
    initMetavaults();
  }, []);

  return (
    <div className="mx-auto flex flex-col gap-10">
      <div>
        <h2 className="font-bold text-[40px] leading-[48px] text-start mb-5">
          Metavaults
        </h2>
        <h3 className="text-[#97979a] font-medium text-[20px] leading-8">
          Metavaults are automated vaults that combine multiple DeFi <br />{" "}
          protocols and assets into a single strategy
        </h3>
      </div>
      <div className="pb-5">
        {false ? (
          <div className="relative h-[80px]">
            <div className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
              <FullPageLoader />
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-[25px]">
            <a
              href="/metavaults/metavault/0x123"
              className="rounded-lg bg-[#101012] border border-[#23252A] max-w-[352px]"
            >
              <div className="p-6 flex flex-col gap-10">
                <img
                  className="w-16 h-16 rounded-full"
                  src="/profit.png"
                  alt="logo"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[24px] font-semibold">
                      USD Metavault
                    </span>
                    <p className="text-[#97979A] text-[16px]">
                      Create and deploy new yield farms using stablecoins and
                      DeFi primitives for consistent returns
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Total deposited</span>
                      <span className="font-semibold">1,250,000 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Active strategies</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">
                        Protocols integrated
                      </span>
                      <span className="font-semibold">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
            <a
              href="#"
              className="rounded-lg bg-[#101012] border border-[#23252A] max-w-[352px]"
            >
              <div className="p-6 flex flex-col gap-10">
                <img
                  className="w-16 h-16 rounded-full"
                  src="/profit.png"
                  alt="logo"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[24px] font-semibold">
                      USD Metavault
                    </span>
                    <p className="text-[#97979A] text-[16px]">
                      Create and deploy new yield farms using stablecoins and
                      DeFi primitives for consistent returns
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Total deposited</span>
                      <span className="font-semibold">1,250,000 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Active strategies</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">
                        Protocols integrated
                      </span>
                      <span className="font-semibold">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
            <a
              href="#"
              className="rounded-lg bg-[#101012] border border-[#23252A] max-w-[352px]"
            >
              <div className="p-6 flex flex-col gap-10">
                <img
                  className="w-16 h-16 rounded-full"
                  src="/profit.png"
                  alt="logo"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[24px] font-semibold">
                      USD Metavault
                    </span>
                    <p className="text-[#97979A] text-[16px]">
                      Create and deploy new yield farms using stablecoins and
                      DeFi primitives for consistent returns
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Total deposited</span>
                      <span className="font-semibold">1,250,000 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">Active strategies</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between text-[16px]">
                      <span className="text-[#97979A]">
                        Protocols integrated
                      </span>
                      <span className="font-semibold">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export { Metavaults };
