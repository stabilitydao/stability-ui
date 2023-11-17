import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { PlatformABI, FactoryABI } from "@web3";
import { platformData, publicClient, lastTx } from "@store";

import { BuildForm } from "../BuildForm";

import { platform } from "../../constants";
import type { InitParams, AllowedBBTokenVaults } from "../../types";
import { getTokenData } from "../../utils";

type BuildVariant = {
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  canBuild: boolean;
  initParams: InitParams;
};

function CreateVaultComponent() {
  const _publicClient = useStore(publicClient);
  const p = useStore(platformData);
  const [buildVariants, setBuildVariants] = useState<BuildVariant[]>([]);
  const [buildIndex, setBuildIndex] = useState<number | undefined>();
  const [allowedBBTokenVaults, setAllowedBBTokenVaults] = useState<
    AllowedBBTokenVaults | undefined
  >();
  const [minInitialBoostPerDay, setMinInitialBoostPerDay] = useState<
    bigint | undefined
  >();
  const [minInitialBoostDuration, setMinInitialBoostDuration] = useState<
    bigint | undefined
  >();
  const [defaultBoostTokens, setDefaultBoostTokens] = useState<string[]>([]);

  useEffect(() => {
    async function read() {
      if (_publicClient && p) {
        const variants: BuildVariant[] = [];
        const wtb = await _publicClient.readContract({
          address: p.factory,
          functionName: "whatToBuild",
          abi: FactoryABI,
        });
        if (Array.isArray(wtb)) {
          for (let i = 0; i < wtb[1].length; i++) {
            const initParams: InitParams = {
              initVaultAddresses: [],
              initVaultNums: [],
              initStrategyAddresses: [],
              initStrategyNums: [],
              initStrategyTicks: [],
            };
            let paramsLen = wtb[3][i][1] - wtb[3][i][0];
            for (let k = 0; k < paramsLen; ++k) {
              initParams.initVaultAddresses[k] =
                wtb[4][Number(wtb[3][i][0]) + k];
            }
            paramsLen = wtb[3][i][3] - wtb[3][i][2];
            for (let k = 0; k < paramsLen; ++k) {
              initParams.initVaultNums[k] = wtb[5][Number(wtb[3][i][2]) + k];
            }
            paramsLen = wtb[3][i][5] - wtb[3][i][4];
            for (let k = 0; k < paramsLen; ++k) {
              initParams.initStrategyAddresses[k] =
                wtb[6][Number(wtb[3][i][4]) + k];
            }
            paramsLen = wtb[3][i][7] - wtb[3][i][6];
            for (let k = 0; k < paramsLen; ++k) {
              initParams.initStrategyNums[k] = BigInt(
                wtb[7][Number(wtb[3][i][6]) + k]
              );
            }
            paramsLen = wtb[3][i][9] - wtb[3][i][8];
            for (let k = 0; k < paramsLen; ++k) {
              initParams.initStrategyTicks[k] =
                wtb[8][Number(wtb[3][i][8]) + k];
            }

            variants.push({
              vaultType: wtb[1][i],
              strategyId: wtb[2][i],
              strategyDesc: wtb[0][i],
              canBuild: true,
              initParams,
            });
          }
          setBuildVariants(variants);
        }

        let r = await _publicClient.readContract({
          address: platform,
          functionName: "allowedBBTokenVaults",
          abi: PlatformABI,
        });

        if (r && Array.isArray(r)) {
          const allowedBBTokenVaults_: AllowedBBTokenVaults = {};
          for (let k = 0; k < r[0].length; ++k) {
            allowedBBTokenVaults_[r[0][k]] = Number(r[1][k]);
          }
          setAllowedBBTokenVaults(allowedBBTokenVaults_);
        }

        const minInitialBoostPerDayValue = await _publicClient.readContract({
          address: platform,
          functionName: "minInitialBoostPerDay",
          abi: PlatformABI,
        });
        if (typeof minInitialBoostPerDayValue === "bigint") {
          setMinInitialBoostPerDay(minInitialBoostPerDayValue);
        }

        const minInitialBoostDurationValue = await _publicClient.readContract({
          address: platform,
          functionName: "minInitialBoostDuration",
          abi: PlatformABI,
        });
        if (typeof minInitialBoostDurationValue === "bigint") {
          setMinInitialBoostDuration(minInitialBoostDurationValue);
        }
        const defaultBoostTokensValue = await _publicClient.readContract({
          address: platform,
          functionName: "defaultBoostRewardTokens",
          abi: PlatformABI,
        });
        if (Array.isArray(defaultBoostTokensValue)) {
          setDefaultBoostTokens(defaultBoostTokensValue);
        }
      }
    }
    read();
  }, [_publicClient, p?.factory, lastTx.get()]);

  const compoundingVaultsForBuilding = buildVariants.filter(
    (v) => v.vaultType === "Compounding"
  ).length;

  return (
    <div>
      <h2>Create compounding vault</h2>
      {compoundingVaultsForBuilding ? (
        <table>
          <thead>
            <tr>
              <td></td>
              <td>Strategy logic</td>
              <td>Strategy description</td>
            </tr>
          </thead>
          <tbody>
            {buildVariants.map((v, i) => {
              if (v.vaultType !== "Compounding") {
                return;
              }

              return (
                <tr key={v.strategyDesc + v.vaultType + v.strategyId}>
                  <td>
                    {v.canBuild ? (
                      <button
                        className="btn create-btn"
                        onClick={() => {
                          setBuildIndex(i);
                        }}
                      >
                        Assemble
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>{v.strategyId}</td>
                  <td>{v.strategyDesc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="msg">
          All compounding vaults have already been created. <br />
          New vaults can be created after developing new strategies.
        </div>
      )}

      <br />
      <br />
      <h2>Create rewarding vault</h2>
      <div className="rewarding-data">
        {allowedBBTokenVaults !== undefined && (
          <div>
            For allowed buy-back tokens, the following number of rewarding
            vaults can be created:
            <div>
              {Object.keys(allowedBBTokenVaults).map((t) => {
                const token = getTokenData(t);

                return (
                  <div key={t} className="allowed-bb-row">
                    <span>
                      {token ? (
                        <img
                          src={token.logoURI}
                          alt={token.name}
                          className="token-logo"
                        />
                      ) : (
                        ""
                      )}
                      {token?.symbol || t}
                    </span>
                    <span>{allowedBBTokenVaults[t]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {minInitialBoostPerDay !== undefined && (
          <div>
            Minimal initial boost value per day: $
            {formatUnits(minInitialBoostPerDay, 18)}
          </div>
        )}
        <div>Buy-back rewards vesting duration: 7 days</div>
        <div>Boost rewards vesting duration: 30 days</div>
        <br />
      </div>
      <table>
        <thead>
          <tr>
            <td></td>
            <td>Vault type</td>
            <td>Buy-back token</td>
            <td>Strategy logic</td>
            <td>Strategy description</td>
          </tr>
        </thead>
        <tbody>
          {buildVariants.map((v, i) => {
            if (v.vaultType !== "Rewarding") {
              return;
            }

            return (
              <tr key={v.strategyDesc + v.vaultType + v.strategyId}>
                <td>
                  {v.canBuild ? (
                    <button
                      className="btn create-btn"
                      onClick={() => {
                        setBuildIndex(i);
                      }}
                    >
                      Assemble
                    </button>
                  ) : (
                    ""
                  )}
                </td>
                <td>{v.vaultType}</td>
                <td>
                  {
                    getTokenData(
                      buildVariants[i].initParams.initVaultAddresses[0]
                    )?.symbol
                  }
                </td>
                <td>{v.strategyId}</td>
                <td>{v.strategyDesc}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <br />
      <br />
      <h2>Create rewarding managed vault</h2>
      <div style={{ textAlign: "center" }}>Coming soon</div>

      {p && buildIndex !== undefined && (
        <div
          className="overlay"
          onClick={() => {
            setBuildIndex(undefined);
          }}
        >
          <div
            className="modal"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="modal-title">Assembling</div>
            <BuildForm
              vaultType={buildVariants[buildIndex].vaultType}
              strategyId={buildVariants[buildIndex].strategyId}
              strategyDesc={buildVariants[buildIndex].strategyDesc}
              initParams={buildVariants[buildIndex].initParams}
              buildingPrice={
                p.buildingPrices[buildVariants[buildIndex].vaultType]
              }
              defaultBoostTokens={defaultBoostTokens}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export { CreateVaultComponent };
