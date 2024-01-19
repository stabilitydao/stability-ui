import { useState, useEffect, memo } from "react";

import { formatFromBigInt, getTimeDifference } from "@utils";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const UserBar: React.FC<IProps> = memo(({ vault }) => {
  const [timeDifference, setTimeDifference] = useState<any>();

  useEffect(() => {
    if (vault) {
      const TD = getTimeDifference(vault.lastHardWork);
      setTimeDifference(TD);
    }
  }, [vault]);

  return (
    <div className="flex justify-between flex-wrap items-center bg-button px-5 py-2 md:py-4 rounded-md md:h-[80px]">
      <div className="flex flex-col my-2 md:my-0">
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
          Your Balance
        </p>

        <div className="text-[20px] h-8 flex">
          <p className="mr-1">
            {formatFromBigInt(vault.balance, 18).toFixed(5)}
          </p>
          <p className="whitespace-nowrap md:hidden lg:block">
            / $
            {(
              formatFromBigInt(vault.shareprice, 18, "withDecimals") *
              Number(formatFromBigInt(vault.balance, 18, "withDecimals"))
            ).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="flex flex-col my-2 md:my-0">
        {timeDifference && (
          <div className="flex flex-col justify-between">
            <p className="uppercase text-[14px] leading-3 text-[#8D8E96] mb-[7px]">
              Last Hard Work
            </p>
            {timeDifference?.days ? (
              <>
                {timeDifference?.days < 1000 ? (
                  <div className="flex text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 rounded-lg border-[2px] border-[#AE642E] text-center">
                    {timeDifference.days}
                    {timeDifference.days > 1 ? " days" : " day"}{" "}
                    {timeDifference.hours}h ago
                  </div>
                ) : (
                  <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2  rounded-lg border-[2px] border-[#AE642E] text-center">
                    None
                  </div>
                )}
              </>
            ) : (
              <div
                className={`text-[14px] px-2 rounded-lg border-[2px] text-center  ${
                  timeDifference.hours > 4
                    ? "bg-[#485069] text-[#B4BFDF] border-[#6376AF]"
                    : "bg-[#486556] text-[#B0DDB8] border-[#488B57]"
                }`}
              >
                {timeDifference?.hours
                  ? `${timeDifference.hours}h ago`
                  : "<1h ago"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export { UserBar };
