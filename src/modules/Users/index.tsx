import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useStore } from "@nanostores/react";

import { readContract, writeContract } from "@wagmi/core";
import { formatUnits } from "viem";

import { ContestsOverview } from "./components";

import { FullPageLoader, HeadingText, TableColumnSort } from "@ui";

import {
  getShortAddress,
  sortTable,
  formatTimestampToDate,
  formatNumber,
} from "@utils";

import { findAllValidPeriods } from "./functions";

import { account, apiData, assetsPrices } from "@store";

import { contests } from "@stabilitydao/stability";

import {
  wagmiConfig,
  ERC20ABI,
  sGEM1,
  IMerkleDistributor,
  merkleDistributor,
} from "@web3";

import { USERS_TABLE } from "@constants";

import { TABLE_TYPES } from "./constants";

import type { TTableColumn, TLeaderboard, TAddress } from "@types";

import type { ApiMainReply, YieldContest } from "@stabilitydao/stability";

import type { UserRewards } from "@stabilitydao/stability/out/api.types";

const Users = (): JSX.Element => {
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  const $assetsPrices = useStore(assetsPrices);
  const $account = useStore(account);

  // const activeContestInfo = contests?.[currentPeriod];
  // const pastContestInfo = contests?.[previousPeriod];

  const [userBalance, setUserBalance] = useState({ points: "-", gems: "-" });
  const [userData, setUserData] = useState<any>([]); // todo: change type to user rewards
  const [gemsEarned, setGemsEarned] = useState("0");
  const [rewardsTotalSupply, setRewardsTotalSupply] = useState({
    points: "0",
    gems: "900k",
  });
  const [gemPrice, setGemPrice] = useState("-");

  const [contestsToClaim, setContestsToClaim] = useState([]);

  const { currentPeriod, previousPeriod, nextPeriod } =
    findAllValidPeriods(contests);

  const periodsData = [
    {
      id: previousPeriod || "",
      ...contests[previousPeriod as keyof YieldContest],
    },
    {
      id: currentPeriod || "",
      ...contests[currentPeriod as keyof YieldContest],
    },
    { id: nextPeriod || "", ...contests[nextPeriod as keyof YieldContest] },
  ];

  const [activeContest, setActiveContest] = useState(TABLE_TYPES[1]);

  const [tableStates, setTableStates] = useState(USERS_TABLE);
  const [tableData, setTableData] = useState<TLeaderboard[]>([]);

  const initTableData = async () => {
    if (!!allContests.ACTIVE?.length) {
      //@ts-ignore
      let contestData = allContests[activeContest].sort(
        (a: TLeaderboard, b: TLeaderboard) => b.earned - a.earned
      );

      contestData = contestData.map((data: TLeaderboard, index: number) => ({
        ...data,
        rank: index + 1,
      }));
      setTableData(contestData);
    }
  };

  const getSGEMPrice = async () => {
    const sonicPrices = $assetsPrices["146"];

    if (sonicPrices) {
      const _sGEM1Price =
        Number(
          sonicPrices[sGEM1?.toLowerCase() as keyof typeof sonicPrices]?.price
        ).toFixed(3) ?? "0.010";

      setGemPrice(_sGEM1Price);
    }
  };

  const getRewardsTotalSupply = async () => {
    if ($apiData?.leaderboards?.absolute.length) {
      const pointsTotalSupply = $apiData?.leaderboards?.absolute.reduce(
        (acc, cur) => (acc += cur?.points ?? 0),
        0
      );

      const _gems = String(formatNumber(900000, "abbreviate")).slice(1);

      const _points = String(
        formatNumber(Number(pointsTotalSupply), "abbreviate")
      ).slice(1);

      setRewardsTotalSupply({ points: _points, gems: _gems });
    }
  };

  const getUserData = async () => {
    try {
      const response = await axios.get(
        `https://api.stability.farm/rewards/user/${$account}`
      );

      const gemsEarnedData = response.data.gemsEarned;

      if (gemsEarnedData.length) {
        setUserData(gemsEarnedData);
      }
    } catch (err) {
      console.error("Error occurred at getUserData:", err);
    }
  };

  const getUserBalance = async () => {
    const user = $apiData?.leaderboards?.absolute.find(
      ({ address }) => address === $account?.toLowerCase()
    );

    let userPoints = "0";
    let user_sGEM1 = "0";

    if (user?.points) {
      userPoints = String(
        formatNumber(Number(user?.points), "abbreviate")
      ).slice(1);
    }

    try {
      const sGEM1Balance = await readContract(wagmiConfig, {
        address: sGEM1 as TAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      user_sGEM1 = formatUnits(sGEM1Balance, 18);

      user_sGEM1 = String(formatNumber(Number(user_sGEM1), "abbreviate")).slice(
        1
      );
    } catch (err) {
      console.error("Error occurred at getUserBalance:", err);
    }

    setUserBalance({ points: userPoints, gems: user_sGEM1 });
  };

  const getUserEarnedGems = async () => {
    if (!userData.length) return;
    try {
      const allGems = userData.reduce(
        (acc: number, cur: UserRewards["gemsEarned"][number]) =>
          (acc += cur.gems),
        0
      );

      const abbreviateGems = String(
        formatNumber(Number(allGems), "abbreviate")
      ).slice(1);

      setGemsEarned(abbreviateGems);
    } catch (err) {
      console.error("Error occurred at getUserEarnedGems:", err);
    }
  };

  const getUserClaimedRewards = async () => {
    if (!userData.length) return;
    try {
      const contestIds = userData.map(
        ({ contestId }: { contestId: string }) => contestId
      );

      const claimedData = (await readContract(wagmiConfig, {
        address: merkleDistributor as TAddress,
        abi: IMerkleDistributor,
        functionName: "claimed",
        args: [$account as TAddress, contestIds],
      })) as boolean[];

      const claimContests = claimedData.reduce((acc, isClaimed, index) => {
        if (!isClaimed) acc.push(contestIds[index] as string);
        return acc;
      }, []);

      if (claimContests.length) {
        setContestsToClaim(claimContests);
      }
    } catch (err) {
      console.error("Error occurred at getUserClaimedRewards:", err);
    }
  };

  const claim = async () => {
    if (!$account) {
      alert("Please connect your wallet!");
    }

    try {
      const gemsAmounts: string[] = [];
      const proofs: string[][] = [];

      contestsToClaim.forEach((contest) => {
        const contestData = userData.find(
          ({ contestId }: { contestId: string }) => contest === contestId
        );

        gemsAmounts.push(contestData?.gemsRaw as string);
        proofs.push(contestData?.proofs as string[]);
      });

      const claim = await writeContract(wagmiConfig, {
        address: merkleDistributor as TAddress,
        abi: IMerkleDistributor,
        functionName: "claim",
        args: [contestsToClaim, gemsAmounts, proofs, $account as TAddress],
      });
      console.log(claim);
    } catch (err) {
      console.error("Error occurred at claim:", err);
    }
  };

  const allContests = useMemo(() => {
    const absoluteLeaderboard = $apiData?.leaderboards.absolute.map((user) =>
      user?.points ? user : { ...user, points: 0 }
    );

    const absoluteLeaderboardMap = absoluteLeaderboard
      ? Object.fromEntries(
          absoluteLeaderboard?.map((user) => [user.address, user.points])
        )
      : {};

    const fillPoints = (leaderboard?: { address: string; points?: number }[]) =>
      leaderboard?.map((user) => ({
        ...user,
        points: absoluteLeaderboardMap[user?.address] ?? 0,
      }));

    const pastLeaderboard = fillPoints(
      $apiData?.leaderboards?.[previousPeriod as keyof YieldContest]
    );
    const activeLeaderboard = fillPoints(
      $apiData?.leaderboards?.[currentPeriod as keyof YieldContest]
    );

    return {
      PAST: pastLeaderboard,
      ACTIVE: activeLeaderboard,
      ABSOLUTE: absoluteLeaderboard,
    };
  }, [$apiData?.leaderboards]);

  useEffect(() => {
    initTableData();
  }, [activeContest, allContests]);

  useEffect(() => {
    getSGEMPrice();
  }, [$assetsPrices]);

  useEffect(() => {
    getRewardsTotalSupply();
  }, [$apiData]);

  useEffect(() => {
    if ($account) {
      getUserData();
    } else if (contestsToClaim.length) {
      setContestsToClaim([]);
    }
  }, [$account]);

  useEffect(() => {
    if (userData.length) {
      getUserBalance();
      getUserEarnedGems();
      getUserClaimedRewards();
    }
  }, [userData]);
  return (
    <div className="flex flex-col xl:min-w-[1200px] max-w-[1200px] w-full gap-[20px]">
      <HeadingText text="Users" scale={1} styles="mb-0" />
      <div className="flex flex-col items-center gap-5 mb-4">
        <HeadingText text="Rewards" scale={2} styles="mb-0" />
        <p className="flex items-center justify-center text-center">
          Earning in our vaults you get additional rewards!
        </p>{" "}
        <div className="flex items-center justify-center gap-10 font-manrope flex-wrap mb-5">
          <div className="sGem1RewardBg w-[320px] sm:w-[550px] h-[270px] sm:h-[220px] rounded-[10px]">
            <div className="py-[15px] pr-[45px] pl-[30px] h-full w-full flex justify-between items-center">
              <div className="flex flex-col items-start justify-between h-full md:w-2/3">
                <div className="font-light flex flex-col items-start">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[25px] flex items-center gap-2">
                      <img
                        src="sGEM1.png"
                        alt="sGEM1"
                        title="sGEM1"
                        className="w-[33px] h-[33px] block sm:hidden"
                      />
                      sGEM1
                    </span>
                    <a
                      className="block sm:hidden"
                      target="_blank"
                      href="https://www.shadow.so/trade?inputCurrency=0x29219dd400f2Bf60E5a23d13Be72B486D4038894&outputCurrency=0x9A08cD5691E009cC72E2A4d8e7F2e6EE14E96d6d"
                    >
                      <img
                        src="mobile_shadow.png"
                        alt="Shadow"
                        title="Shadow"
                      />
                    </a>
                  </div>
                  <p className="text-[12px]">
                    <span className="opacity-70">
                      Sonic Gems are app airdrop points that we give away
                      entirely to our users.
                    </span>

                    <a
                      href="https://stabilitydao.gitbook.io/stability/stability-dao/gems"
                      target="_blank"
                      className="underline font-bold ml-1"
                    >
                      Read Docs
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-[28px]">
                    <span className="font-extralight">Balance:</span>
                    <span className="font-bold"> {userBalance.gems}</span>
                  </p>
                  <p className="flex items-center gap-[3px] text-[13px] mt-[-5px]">
                    <span className="text-[#5C5C5E]">Total Earned:</span>
                    <span className="font-light">{gemsEarned}</span>
                    <span className="text-[#B52727]">sGEM1</span>
                  </p>
                </div>
                <p className="text-[#B0B0B0] text-[15px] sm:flex items-center gap-1 hidden">
                  Swap on{" "}
                  <a
                    target="_blank"
                    href="https://www.shadow.so/trade?inputCurrency=0x29219dd400f2Bf60E5a23d13Be72B486D4038894&outputCurrency=0x9A08cD5691E009cC72E2A4d8e7F2e6EE14E96d6d"
                  >
                    <img src="shadow.png" alt="Shadow" title="Shadow" />
                  </a>
                </p>
                <div className="w-full flex items-center justify-between sm:hidden">
                  <div className="flex flex-col text-[12px]">
                    <p className="text-[#EAD9B2]">
                      Price:
                      <span className="font-bold mx-[2px]">${gemPrice}</span>
                      USD
                    </p>

                    <p className="font-light opacity-50">
                      Total Supply:{" "}
                      <span className="font-bold">
                        {rewardsTotalSupply.gems}
                      </span>
                    </p>
                  </div>
                  {!!contestsToClaim.length && (
                    <button
                      className="bg-transparent border border-[#FEF08A] h-7 rounded-md w-[80px] font-light text-[13px]"
                      onClick={claim}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:items-end justify-between sm:w-1/3 h-full whitespace-nowrap">
                <img
                  src="sGEM1.png"
                  alt="sGEM1 reward"
                  className="w-[88px] h-[88px] sm:block hidden"
                />
                {!!contestsToClaim.length && (
                  <button
                    className="bg-transparent border border-[#FEF08A] h-7 sm:w-[88px] rounded-md w-8 font-light text-[13px] sm:block hidden"
                    onClick={claim}
                  >
                    Claim
                  </button>
                )}
                <div className="hidden sm:flex flex-col items-end text-[12px]">
                  <p className="text-[#EAD9B2]">
                    Price:
                    <span className="font-bold mx-[2px]">${gemPrice}</span>
                    USD
                  </p>

                  <p className="font-light opacity-50">
                    Total Supply:{" "}
                    <span className="font-bold">{rewardsTotalSupply.gems}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pSTBLRewardBg w-[320px] sm:w-[550px] h-[270px] sm:h-[220px] rounded-[10px]">
            <div className="py-[15px] pr-[45px] pl-[30px] h-full w-full flex justify-between items-center">
              <div className="flex flex-col items-start h-full sm:w-2/3">
                <div className="font-light flex flex-col items-start">
                  <span className="text-[25px] flex items-center gap-2">
                    <img
                      src="pSTBL.png"
                      alt="pSTBL"
                      title="pSTBL"
                      className="w-[33px] h-[33px] block sm:hidden"
                    />{" "}
                    pSTBL
                  </span>
                  <p className="text-[13px] opacity-70">
                    Stability Points will be exchanged for $STBL at TGE 2025.
                  </p>
                </div>

                <p className="text-[28px] mt-6 sm:mt-[6px]">
                  <span className="font-extralight">Balance:</span>
                  <span className="font-bold"> {userBalance.points}</span>
                </p>
                <p className="font-light text-[#B0AEFF] text-[12px] mt-[-8px] block sm:hidden">
                  Total Supply:{" "}
                  <span className="font-bold">{rewardsTotalSupply.points}</span>
                </p>
              </div>
              <div className="sm:flex hidden flex-col items-end justify-between text-[12px]  sm:w-1/3 h-full">
                <img
                  className="w-[93px] h-[93px] sm:block hidden"
                  src="pSTBL.png"
                  alt="pSTBL reward"
                />
                <p className="font-light text-[#B0AEFF]">
                  Total Supply:{" "}
                  <span className="font-bold">{rewardsTotalSupply.points}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeadingText text="Contests" scale={2} styles="mb-0" />
      <ContestsOverview periodsData={periodsData} />

      <div className="flex flex-col items-center mb-4 mt-2">
        <a
          className="bg-accent-900 max-w-[250px] min-w-[100px] text-[14px] font-semibold h-8 md:h-10 sm:py-1 md:px-3 rounded-xl sm:gap-1 flex items-center justify-center w-8 md:w-full"
          href="/contests"
        >
          All Contests
        </a>
      </div>

      <HeadingText text="Leaderboard" scale={2} styles="mb-0" />

      <div className="flex flex-wrap justify-center items-center font-semibold relative text-[14px]">
        {TABLE_TYPES.map((type: string) => {
          const isActive = activeContest === type;
          // @ts-ignore
          const hasContestData = !!allContests[type]?.length;

          let dateRange = type;

          switch (type) {
            case "PAST":
              if (previousPeriod) {
                dateRange = `${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].start)} - ${formatTimestampToDate(contests[previousPeriod as keyof YieldContest].end)}`;
              }

              break;
            case "ACTIVE":
              dateRange = `${formatTimestampToDate(contests[currentPeriod as keyof YieldContest].start)} - ${formatTimestampToDate(contests[currentPeriod as keyof YieldContest].end)}`;
              break;

            default:
              break;
          }
          return (
            <p
              key={type}
              className={`w-[150px] md:w-1/3 whitespace-nowrap z-20 text-center p-4 border-b-[1.5px] border-transparent ${hasContestData ? "cursor-pointer" : "cursor-default hover:border-transparent opacity-50"} ${isActive ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => hasContestData && setActiveContest(type)}
            >
              {dateRange}
            </p>
          );
        })}
      </div>
      {tableData.length ? (
        <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
          <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
            <thead className="bg-accent-950 text-neutral-600 h-[36px]">
              <tr className="text-[12px] uppercase">
                {tableStates.map((value: TTableColumn, index: number) => (
                  <TableColumnSort
                    key={value.name + index}
                    index={index}
                    value={value.name}
                    sort={sortTable}
                    table={tableStates}
                    setTable={setTableStates}
                    tableData={tableData}
                    setTableData={setTableData}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {!!tableData.length &&
                tableData.map((user: TLeaderboard) => (
                  <tr
                    key={user.address}
                    className="h-[48px] hover:bg-accent-950"
                  >
                    <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                      {user.rank}
                    </td>
                    <td
                      className={`px-4 py-3 text-center ${$account?.toLowerCase() === user.address ? "underline" : ""}`}
                      style={{ fontFamily: "monospace" }}
                    >
                      {getShortAddress(user.address, 6, 4)}
                    </td>
                    <td className="text-center px-4 py-3">
                      {user.earned <= 0.01
                        ? user.earned.toFixed(4)
                        : user.earned.toFixed(2)}
                    </td>
                    <td className="text-center px-4 py-3">
                      {user.deposit
                        ? (Math.round(user.deposit * 100) / 100).toFixed(2)
                        : ""}
                    </td>
                    <td className="text-center px-4 py-3">
                      {user.points ? user.points : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <FullPageLoader />
      )}
    </div>
  );
};

export { Users };
