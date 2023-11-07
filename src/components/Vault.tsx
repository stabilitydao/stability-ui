import type React from "react";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { readContract } from "viem/actions";
import { vaultData, assets, assetsPrices } from "../state/StabilityStore";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  useWalletClient,
} from "wagmi";
import VaultAbi from "../abi/VaultAbi";
import StrategyAbi from "../abi/StrategyAbi";
import { platform } from "../constants";
import data from "../stability.tokenlist.json";
import type { Token, assetPrices } from "../types";
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
  const $assetsPrices = useStore(assetsPrices);
  const vault = useStore(vaultData);
  const strategy = useStore(assets);
  console.log(vault);

  console.log(strategy);
  console.log(props.vault);
  console.log(data.tokens);
  console.log($assetsPrices);

  const vaultt: `0x${string}` | undefined = props.vault;
  console.log(vaultt);

  const _publicClient = usePublicClient();

  useEffect(() => {
    async function getStrategy() {
      if (vaultt) {
        let s: `0x${string}` | undefined = (await readContract(_publicClient, {
          address: vaultt,
          abi: VaultAbi,
          functionName: "strategy",
        })) as `0x${string}` | undefined;
        console.log(s);

        if (typeof s === "string") {
          let ss: string[] = (await readContract(_publicClient, {
            address: s,
            abi: StrategyAbi,
            functionName: "assets",
          })) as string[];

          if (Array.isArray(ss)) {
            assets.set(ss);
            console.log("assets", ss);
          } else {
            console.error("ss is not an array");
          }
        }
      }
    }
    getStrategy();
  }, [vaultt]);

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

        <article
          className="Strategy"
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
            strategy.map((strategy, index) => {
              const strategyData: Token | undefined = data.tokens.find(
                token => token.address === strategy
              );

              if (strategyData && $assetsPrices) {
                return (
                  <article
                    key={index}
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
                            margin: "auto",
                            display: "felx",
                            alignItems: "center",
                          }}>
                          Vault Adress
                        </a>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-external-link"
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
                        <p style={{ color: "grey" }}>
                          Lorem ipsum dolor sit amet consectetur, adipisicing
                          elit. Delectus, molestiae officiis. Ducimus dolore
                          fuga quod facilis beatae ut nisi magni harum sit non
                          perferendis, reiciendis rerum illo id placeat saepe!
                        </p>
                      </section>
                    </div>
                    <div>
                      <p>
                        Lorem ipsum dolor sit amet consectetur, adipisicing
                        elit. Delectus, molestiae officiis. Ducimus dolore fuga
                        quod facilis beatae ut nisi magni harum sit non
                        perferendis, reiciendis rerum illo id placeat saepe!
                      </p>
                    </div>
                  </article>
                );
              }

              return null; // Otra opción si no se encuentra la estrategia
            })}
        </article>
      </>
    );
  } else {
    return <h1>Loading Vault..</h1>;
  }
}
