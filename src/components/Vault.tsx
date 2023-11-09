/** @format */

import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { readContract } from "viem/actions";
import {
  vaultData,
  assets,
  assetsPrices,
  assetsBalances,
} from "../state/StabilityStore";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  useWalletClient,
} from "wagmi";
import VaultAbi from "../abi/VaultAbi";
import StrategyAbi from "../abi/StrategyAbi";
import tokensJson from "../stability.tokenlist.json";
import type { Token, assetPrices, Balances } from "../types";
import { formatUnits } from "viem";

type Props = {
  vault?: `0x${string}` | undefined;
};

export function addAssetsPrice(data: any) {
  const tokenAdress = data[0];
  const tokenPrice = data[1];
  const assetPrice: assetPrices = {};
  if (tokenAdress.length === tokenPrice.length) {
    for (let i = 0; i < tokenAdress.length; i++) {
      assetPrice[tokenAdress[i]] = {
        tokenPrice: tokenPrice[i],
      };
    }
    assetsPrices.set(assetPrice);
    console.log(assetsPrices);
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
}

export default function Vault(props: Props) {
  const vaultt: `0x${string}` | undefined = props.vault;
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const vault = useStore(vaultData);
  const strategy = useStore(assets);
  const _publicClient = usePublicClient();

  const [option, setOption] = useState<string[]>([]);
  const [defaultOptionSymbols, setDefaultOptionSymbols] = useState("");
  const [defaultOptionAssets, setDefaultOptionAssets] = useState("");
  const [tab, setTab] = useState("Deposit");
  const [balances, setBalances] = useState<Balances>({});

  useEffect(() => {
    async function getStrategy() {
      if (vaultt) {
        let s: `0x${string}` | undefined = (await readContract(_publicClient, {
          address: vaultt,
          abi: VaultAbi,
          functionName: "strategy",
        })) as `0x${string}` | undefined;

        if (typeof s === "string") {
          let ss: string[] = (await readContract(_publicClient, {
            address: s,
            abi: StrategyAbi,
            functionName: "assets",
          })) as string[];

          if (Array.isArray(ss)) {
            assets.set(ss);
            loadAssetsBalances(ss);
            defaultAssetsOption(ss);
            setOption(ss);
            console.log("assets", ss);
          } else {
            console.error("ss is not an array");
          }
        }
      }
    }
    getStrategy();
  }, [props]);

  useEffect(() => {}, []);

  //Default assets strategy on <select>
  function defaultAssetsOption(ss: string[]) {
    const defaultOptionAssets: string[] = [];

    for (let i = 0; i < ss.length; i++) {
      const token = tokensJson.tokens.find(token => ss[i] === token.address);
      if (token) {
        defaultOptionAssets[i] = token.symbol;
      } else {
        defaultOptionAssets[i] = "Token not found.";
      }
    }
    const defaultOptionSymbolsToString = defaultOptionAssets.join(" + ");
    setDefaultOptionSymbols(defaultOptionSymbolsToString);
    setDefaultOptionAssets(ss.join(", "));
  }

  function changeOption(e: string) {
    setOption(e.split(", "));
  }

  function loadAssetsBalances(e: string) {
    const assetAdress = e;
    const balance: Balances = {};

    if ($assetsBalances && e.length > 0) {
      for (let i = 0; i < e.length; i++) {
        balance[e[i]] = {
          assetBalance: $assetsBalances[e[i]].assetBalance,
        };
      }
    }
    setBalances(balance);
  }

  if (props.vault && vault[props.vault]) {
    return (
      <>
        <table style={{ display: "flex", justifyContent: "center" }}>
          <tbody style={{ display: "flex" }}>
            <tr
              style={{
                display: "grid",
                border: "1px",
                borderStyle: "solid",
                padding: "10px",
                borderColor: "grey",
              }}>
              <td>Vault: {props.vault}</td>
              <td>TVL: {vault[props.vault].vaultSharePrice.toString()}</td>
              <td>
                User Balance: {vault[props.vault].vaultUserBalance.toString()}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            width: "531px",
            justifyContent: "center",
            display: "grid",
            margin: "auto",
            gridGap: 0,
            marginBottom: "50px",
            borderStyle: "solid",
            borderWidth: "1px",
            height: "auto",
            marginTop: "20px",
          }}>
          <div
            style={{
              display: "flex",
            }}>
            <button
              style={{
                width: "100%",
                height: "65px",
                fontSize: "23px",
              }}
              onClick={() => setTab("Deposit")}>
              Deposit
            </button>

            <button
              style={{
                width: "100%",
                height: "65px",
                fontSize: "23px",
              }}
              onClick={() => setTab("Withdraw")}>
              Withdraw
            </button>
          </div>
          <form
            style={{
              width: "531px",
              margin: "auto",
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "18px",
            }}>
            <div
              style={{
                display: "grid",
                justifyContent: "center",
                width: "330px",
                margin: "auto",
                marginTop: "10px",
              }}>
              <label style={{ color: "grey", width: "120px" }}>
                Select token
              </label>
              <select
                onChange={e => changeOption(e.target.value)}
                style={{ height: "46px" }}>
                <option
                  value={defaultOptionAssets}
                  style={{ textAlign: "center" }}>
                  {defaultOptionSymbols}
                </option>
                {tokensJson.tokens &&
                  tokensJson.tokens.slice(0, -2).map(token => {
                    return (
                      <option
                        key={token.address}
                        value={token.address}
                        style={{ textAlign: "center" }}>
                        {token.symbol}
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                        />
                      </option>
                    );
                  })}
              </select>
            </div>
            {option.length > 1 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "330px",
                  margin: "auto",
                  marginTop: "10px",
                  alignItems: "bottom",
                }}>
                {strategy &&
                  strategy.map(asset => (
                    <div
                      key={asset}
                      style={{ display: "grid" }}>
                      <label style={{ textAlign: "center", color: "grey" }}>
                        Available
                      </label>
                      <input
                        list="amount"
                        id="amount"
                        name="amount"
                        placeholder={formatUnits(
                          $assetsBalances[asset].assetBalance,
                          18
                        )}
                        style={{
                          height: "40px",
                          width: "140px",
                        }}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "330px",
                  margin: "auto",
                  marginTop: "10px",
                  justifyContent: "center",
                }}>
                <div style={{ display: "grid" }}>
                  <label style={{ textAlign: "center", color: "grey" }}>
                    Available
                  </label>
                  {option.length === 1 && (
                    <input
                      list="amount"
                      id="amount"
                      name="amount"
                      placeholder={formatUnits(
                        $assetsBalances[option].assetBalance,
                        18
                      )}
                      style={{ height: "40px" }}
                    />
                  )}
                </div>
              </div>
            )}
            {tab === "Deposit" ? (
              <button
                style={{
                  height: "45px",
                  fontSize: "28px",
                  width: "330px",
                  margin: "auto",
                  marginTop: "20px",
                }}>
                Deposit
              </button>
            ) : (
              <button
                style={{
                  height: "45px",
                  fontSize: "28px",
                  width: "330px",
                  margin: "auto",
                  marginTop: "20px",
                }}>
                Withdraw
              </button>
            )}
          </form>

          <section
            style={{
              paddingLeft: "50px",
              paddingRight: "50px",
              paddingBottom: "20px",
              opacity: "50%",
              borderStyle: "solid",
              borderWidth: "1px",
            }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p
                style={{
                  padding: "0px",
                  margin: "0px",
                }}>
                DEPOSIT FEE
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-help-octagon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"></path>
                <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
                <path d="M12 16v.01"></path>
                <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}>
              <p
                style={{
                  padding: "0px",
                  margin: "0px",
                }}>
                WITHDRAWAL FEE
              </p>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-help-octagon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"></path>
                <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
                <path d="M12 16v.01"></path>
                <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
              </svg>
            </div>
            <p>
              The displayed APY accounts for performance fee that is deducted
              from the generated yield only
            </p>
          </section>
        </div>

        <article
          class="Strategy"
          style={{
            borderStyle: "solid",
            paddingLeft: "25px",
            paddingRight: "25px",
            marginTop: "50px",
            borderWidth: "1px",
            margin: "auto",
          }}>
          <h2
            style={{
              justifyContent: "start",
              display: "flex",
            }}>
            Strategy assets
          </h2>
          {strategy &&
            strategy.map(strategy => {
              const strategyData: Token | undefined = tokensJson.tokens.find(
                token => token.address === strategy
              );

              if (strategyData && $assetsPrices) {
                return (
                  <article
                    key={strategy}
                    style={{
                      padding: "15px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderColor: "grey",
                      marginBottom: "10px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "40px",
                      }}>
                      <h4>{strategyData.name}</h4>
                      <div
                        style={{
                          backgroundColor: "#4B0082",
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft: "auto",
                          width: "150px",
                          padding: "1px",
                        }}>
                        <a
                          href={`https://polygonscan.com/token/${strategy}`}
                          style={{
                            textDecoration: "none",
                            color: "white",
                            display: "felx",
                            marginRight: "5px",
                            alignItems: "center",
                          }}>
                          Contract
                        </a>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon icon-tabler icon-tabler-external-link"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round">
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"></path>
                          <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                          <path d="M11 13l9 -9"></path>
                          <path d="M15 4h5v5"></path>
                        </svg>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}>
                      <img
                        src={strategyData.logoURI}
                        style={{
                          borderRadius: "50%",
                          height: "70px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                      <div style={{ display: "inline-block" }}>
                        <h5 style={{ marginLeft: "18px" }}>
                          {strategyData.symbol}
                        </h5>
                        <p style={{ marginLeft: "18px" }}>
                          Price: $
                          {formatUnits($assetsPrices[strategy].tokenPrice, 18)}
                        </p>
                      </div>
                      <section
                        style={{ paddingLeft: "100px", paddingRight: "50px" }}>
                        <p style={{ color: "grey" }}></p>
                      </section>
                    </div>
                    <div>
                      <p></p>
                    </div>
                  </article>
                );
              }

              return null;
            })}
        </article>
      </>
    );
  } else {
    return <h1>Loading Vault..</h1>;
  }
}
