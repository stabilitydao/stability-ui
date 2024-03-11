import { memo, useState, useEffect } from "react";

import { walletClient } from "@web3";

import { VaultState, VaultType } from "@components";

import { getTimeDifference, getDate } from "@utils";

import { VAULT_STATUSES } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const VaultInfo: React.FC<IProps> = memo(({ vault }) => {
  const [created, setCreated] = useState<any>();
  const [hardWorkOnDeposit, setHardWorkOnDeposit] = useState("");
  const [timeDifference, setTimeDifference] = useState<any>();

  useEffect(() => {
    if (vault) {
      const date = getDate(Number(vault?.created));

      setHardWorkOnDeposit(vault?.hardWorkOnDeposit ? "YES" : "NO");
      setCreated({ time: date, days: getTimeDifference(vault?.created)?.days });
      setTimeDifference(getTimeDifference(vault?.lastHardWork));
    }
  }, [vault]);

  // const addVaultToken = async () => {
  //   let symbol = vault?.symbol.split("");
  //   let newArr = [];
  //   let lastSymbol = "";
  //   console.log(symbol);
  //   for (let i = 0; i < symbol.length; i++) {
  //     if (!i) {
  //       newArr.push(symbol[0]);
  //     }
  //     if (lastSymbol === "-") {
  //       newArr.push(lastSymbol);
  //       newArr.push(symbol[i]);
  //     }

  //     lastSymbol = symbol[i];
  //   }
  //   symbol = newArr.join("");
  //   if (symbol) {
  //     const success = await walletClient.watchAsset({
  //       type: "ERC20",
  //       options: {
  //         address: vault?.address,
  //         decimals: 18,
  //         symbol: vault?.symbol,
  //       },
  //     });
  //   }
  // };

  return (
    <div className="rounded-md bg-button">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
        <h2 className="text-[24px] text-start ml-4">Vault Info</h2>
      </div>

      <div className="flex flex-col items-start gap-5 p-4">
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96] mb-2">
            VAULT TYPE
          </p>
          <p className="text-[16px] mt-1">
            <VaultType text="long" type={vault?.type} />
          </p>
        </div>
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            VAULT STATUS
          </p>
          <div className="text-[16px] mt-1 flex items-center gap-1">
            <VaultState status={vault?.status} />
            <span> {VAULT_STATUSES[vault?.status]}</span>
          </div>
        </div>
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            HARD WORK ON DEPOSIT
          </p>
          <p className="text-[16px] mt-1">{hardWorkOnDeposit}</p>
        </div>
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            CREATED
          </p>
          <p className="text-[16px] mt-1">
            {created?.time} / {created?.days} days ago
          </p>
        </div>
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            NFT TOKEN ID
          </p>
          <p className="text-[16px] mt-1"> {vault?.NFTtokenID}</p>
        </div>
        <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            GAS RESERVE
          </p>
          <p className="text-[16px] mt-1"> {vault?.gasReserve} MATIC</p>
        </div>
        <div className="flex flex-col">
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
    </div>
  );
});

export { VaultInfo };
