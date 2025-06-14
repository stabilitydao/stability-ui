import { useState, useEffect, useRef } from "react";

import axios from "axios";

import { formatUnits } from "viem";

import { useStore } from "@nanostores/react";

import { account } from "@store";

import { playAudio, formatNumber } from "@utils";

import { seeds } from "@stabilitydao/stability";

const SonicPointsButton = (): JSX.Element => {
  const $account = useStore(account);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [sonicBtn, setSonicBtn] = useState(false);

  const [user, setUser] = useState({
    totalPoints: "-",
    passivePoints: "-",
    activityPoints: "-",
    ringsPoints: "-",
    siloPoints: "-",
    stabilitySiloPoints: "-",
    allSiloPoints: "-",
    rank: "-",
  });

  const getUserData = async () => {
    try {
      const [sonicResponse, ringsResponse, siloResponse] = await Promise.all([
        axios.get(
          `https://www.data-openblocklabs.com/sonic/user-points-stats?wallet_address=${$account}`
        ),
        axios.get(`https://points-api.rings.money/points/${$account}`),
        axios.get(`${seeds[0]}/rewards/silo-points/${$account}`),
      ]);

      const sonicData = sonicResponse?.data;
      const ringsData = ringsResponse?.data;
      const siloData = siloResponse?.data;

      const totalPoints = String(
        formatNumber(sonicData.sonic_points, "abbreviate")
      ).slice(1);

      const passivePoints = String(
        formatNumber(sonicData.passive_liquidity_points, "abbreviate")
      ).slice(1);

      const activityPoints = String(
        formatNumber(sonicData.active_liquidity_points, "abbreviate")
      ).slice(1);

      const ringsPoints = String(
        formatNumber(
          Number(formatUnits(ringsData.total, 36)).toFixed(),
          "abbreviate"
        )
      ).slice(1);

      const siloPoints = String(
        formatNumber(siloData?.siloPoints ?? 0, "abbreviate")
      ).slice(1);

      const stabilitySiloPoints = String(
        formatNumber(siloData?.stabilitySiloPoints ?? 0, "abbreviate")
      ).slice(1);

      let _allSiloPoints: number = 0;

      if (siloData?.siloPoints) {
        _allSiloPoints += siloData?.siloPoints;
      }

      if (siloData?.stabilitySiloPoints) {
        _allSiloPoints += siloData?.stabilitySiloPoints;
      }

      const allSiloPoints = String(
        formatNumber(_allSiloPoints, "abbreviate")
      ).slice(1);

      const rank = sonicData.rank;

      setUser({
        totalPoints,
        passivePoints,
        activityPoints,
        ringsPoints,
        siloPoints,
        stabilitySiloPoints,
        allSiloPoints,
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
    <div className="relative border-l border-[#23252A] min-h-full">
      <button
        ref={buttonRef}
        className="flex items-center justify-center gap-2 min-h-full px-4"
        onClick={() => setSonicBtn((prev) => !prev)}
      >
        <img
          className="w-5 h-5 min-[1430px]:w-[26px] min-[1430px]:h-[26px] rounded-full"
          src="/icons/sonic_gem_icon.svg"
          alt="Sonic gem icon"
        />

        <span className="text-[14px] hidden md:block">
          Sonic points: {user.totalPoints}
        </span>

        <img
          className={`transition delay-[50ms] w-3 h-3 hidden md:block ${
            sonicBtn ? "rotate-[180deg]" : "rotate-[0deg]"
          }`}
          src="/icons/arrow-down.svg"
          alt="arrowDown"
        />
      </button>
      {sonicBtn && (
        <div
          ref={menuRef}
          className="bg-[#1C1D1F] border border-[#383B42] absolute left-[-70px] md:left-0 top-[60px] w-[200px] md:w-full rounded-lg z-[100] py-4"
        >
          <div className="flex flex-col gap-1 mb-4 px-4">
            <div className="flex flex-col items-center gap-1 py-1 px-2 bg-[#1C1E31] border border-[#5E6AD2] rounded-lg">
              <span className="text-[14px] leading-4">{user.totalPoints}</span>
              <span className="text-[#97979A] text-[12px] leading-[14px]">
                Sonic Points
              </span>
            </div>

            <div
              className="flex flex-col items-center gap-1 py-1 px-2 bg-[#40331a] border border-[#FFA500] rounded-lg cursor-pointer"
              onClick={() => playAudio("pp", 0.3)}
            >
              <span className="text-[14px] leading-4">
                {user.passivePoints}
              </span>
              <span className="text-[#97979A] text-[12px] leading-[14px]">
                Passive Points
              </span>
            </div>
            <div
              className="flex flex-col items-center gap-1 py-1 px-2 bg-[#233729] border border-[#48C05C] rounded-lg cursor-pointer"
              onClick={() => playAudio("ap", 0.3)}
            >
              <span className="text-[14px] leading-4">
                {user.activityPoints}
              </span>
              <span className="text-[#97979A] text-[12px] leading-[14px]">
                Activity Points
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 py-1 px-2 bg-[#27292F] border border-[#383B42] rounded-lg">
              <span className="text-[14px] leading-4">{user.rank}</span>
              <span className="text-[#97979A] text-[12px] leading-[14px]">
                Rank
              </span>
            </div>
          </div>

          <div className="flex gap-2 px-4">
            <img src="/rings.png" alt="Rings" className="w-4 h-4" />
            <div className="flex flex-col gap-1">
              <span className="text-[#97979A] text-[12px] leading-[14px]">
                Rings Points
              </span>
              <p className="text-[14px] leading-4">{user.ringsPoints}</p>
            </div>
          </div>

          <div className="h-[1px] bg-[#383B42] rounded-full my-2"></div>

          <div className="flex flex-col gap-2 px-4">
            <div className="flex gap-2">
              <img
                src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                alt="Silo"
                className="w-4 h-4 rounded-full"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[#97979A] text-[12px] leading-[14px]">
                  Silo Points
                </span>
                <p className="text-[14px] leading-4">{user.allSiloPoints}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <img src="/logo.svg" alt="Stability" className="w-4 h-4" />
              <div className="flex flex-col gap-1">
                <span className="text-[#97979A] text-[12px] leading-[14px]">
                  Stability App
                </span>
                <p className="text-[14px] leading-4">
                  {user.stabilitySiloPoints}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <img
                src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                alt="Silo"
                className="w-4 h-4 rounded-full"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[#97979A] text-[12px] leading-[14px]">
                  Silo App
                </span>
                <p className="text-[14px] leading-4">{user.siloPoints}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export { SonicPointsButton };
