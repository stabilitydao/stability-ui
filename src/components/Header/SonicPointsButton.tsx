import { useState, useEffect, useRef } from "react";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { account } from "@store";

import { playAudio, formatNumber } from "@utils";

const SonicPointsButton = (): JSX.Element => {
  const $account = useStore(account);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [sonicBtn, setSonicBtn] = useState(false);

  const [user, setUser] = useState({
    totalPoints: "-",
    passivePoints: "-",
    activityPoints: "-",
    rank: "-",
  });

  const getUserData = async () => {
    try {
      const data = await axios.get(
        `https://www.data-openblocklabs.com/sonic/user-points-stats?wallet_address=${$account}`
      );

      const totalPoints = String(
        formatNumber(data.data.sonic_points, "abbreviate")
      ).slice(1);

      const passivePoints = String(
        formatNumber(data.data.passive_liquidity_points, "abbreviate")
      ).slice(1);

      const activityPoints = String(
        formatNumber(data.data.active_liquidity_points, "abbreviate")
      ).slice(1);

      const rank = data.data.rank;

      setUser({
        totalPoints,
        passivePoints,
        activityPoints,
        rank,
      });
    } catch (error) {
      console.error("Get user data error:", error);
    }
  };

  useEffect(() => {
    if ($account) {
      getUserData();
    }
  }, [$account]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setSonicBtn(false);
      }
    };

    if (sonicBtn) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sonicBtn]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="bg-accent-900 h-8 md:h-10 sm:py-1 px-1 xl:px-3 rounded-xl sm:gap-3 flex items-center justify-center xl:justify-start w-10 xl:w-[180px]"
        onClick={() => setSonicBtn((prev) => !prev)}
      >
        <img
          className="w-5 h-5 xl:w-[26px] xl:h-[26px] rounded-full"
          src="/sonic-gem.svg"
          alt="Sonic gem icon"
        />
        <div className="xl:flex flex-col items-start hidden">
          <div className="flex items-center gap-1">
            <span className="text-neutral-500 text-[12px]">Sonic Points</span>
            <img
              className={`transition delay-[50ms] w-2 h-2 ${
                sonicBtn ? "rotate-[180deg]" : "rotate-[0deg]"
              }`}
              src="/icons/arrow-down.svg"
              alt="arrowDown"
            />
          </div>
          <span className="text-[14px] leading-4">{user.totalPoints}</span>
        </div>
      </button>
      {sonicBtn && (
        <div
          ref={menuRef}
          className="bg-accent-900 absolute left-[-70px] md:left-0 top-[50px] w-[180px] rounded-xl py-1 px-3 z-[100]"
        >
          <div className="flex items-center gap-[15px] xl:hidden">
            <img
              className="w-[26px] h-[26px] rounded-full"
              src="/sonic-gem.svg"
              alt="Sonic gem icon"
            />
            <div>
              <span className="text-neutral-500 text-[12px]">Sonic Points</span>
              <p className="text-[14px] leading-4">{user.totalPoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <div
              className="inline-flex items-center gap-x-0.5 rounded-full border cursor-pointer border-[#BD6EAC] text-white bg-[#BD6EAC]/[0.16] px-2 py-0.5 text-xs active:scale-[.99] active:translate-y-[1px] transition-all ease-slow"
              onClick={() => playAudio("pp", 0.3)}
            >
              <span className="font-medium">PP</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[12px]">
                Passive Points
              </span>
              <p className="text-[14px] leading-4">{user.passivePoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <div
              className="inline-flex items-center gap-x-0.5 rounded-full border cursor-pointer border-[#6EBD70] text-white bg-[#6EBD70]/[0.16] px-2 py-0.5 text-xs active:scale-[.99] active:translate-y-[1px] transition-all ease-slow"
              onClick={() => playAudio("ap", 0.3)}
            >
              <span className="font-medium">AP</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[12px]">
                Activity Points
              </span>
              <p className="text-[14px] leading-4">{user.activityPoints}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[14px]">Rank:</span>
            <span className="text-warning-400">{user.rank}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export { SonicPointsButton };
