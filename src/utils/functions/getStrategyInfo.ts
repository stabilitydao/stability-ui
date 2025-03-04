import { PROTOCOLS } from "@constants";

import {
  strategies,
  getIL,
  type StrategyShortId,
} from "@stabilitydao/stability";

import type { IStrategyInfo, TAddress, IL } from "@types";

/**
 * Retrieves detailed information about a strategy based on the vault symbol
 *
 * @example
 *
 * ```
 * const strategyInfo = getStrategyInfo("GQMF","Gamma QuickSwap Merkl Farm");
 * ```
 *
 * @param {string} vaultSymbol - Vault symbol used to identify the strategy (e.g., "GQMF", "QSF")
 *
 * @returns {Object} Information about strategy
 * @returns {string} id - Full name of strategy (e.g., "Gamma QuickSwap Farm")
 * @returns {string} shortId - Short name or identifier for strategy (e.g., "GQF")
 * @returns {Array} protocols - List of protocols involved in the strategy (e.g., ["Gamma", "QuickSwap"])
 * @returns {Array}  baseStrategies
 * @returns {string} color - Primary color associated with the strategy
 * @returns {string} bgColor - Background color for the strategy
 * @returns {string} ammAdapter - AMM adapter used by the strategy (e.g., "Algebra")
 * @returns {Object} il - Impermanent loss details, including rate, title, description, and color
 * @returns {string} sourceCode - URL to the source code for the strategy's smart contracts
 */

export const getStrategyInfo = (
  vaultSymbol: string,
  strategyId: string,
  strategyShortId: StrategyShortId,
  strategySpecific: string,
  assets: TAddress[]
): IStrategyInfo => {
  let strategyInfo = Object.values(strategies).find(
    (strategy) => strategy.id === strategyId
  );

  const {
    quickswap,
    gamma,
    compound,
    defiEdge,
    merkl,
    ichi,
    retro,
    curve,
    convex,
    // stargate,
    // lido,
    // aave,
    yearn,
    uniswapV3,
    pearlV2,
    trident,
    beethovenx,
    equalizer,
    swapx,
    shadow,
    silo,
  } = PROTOCOLS;

  if (!strategyInfo) {
    return {
      id: "",
      shortId: "",
      protocols: [quickswap, gamma],
      baseStrategies: [],
      color: "",
      bgColor: "",
      ammAdapter: "",
      il: { rate: 0, title: "None", desc: "None", color: "#000000" },
      sourceCode: "",
    };
  }

  const il = getIL(strategyShortId, strategySpecific, assets);

  if (il) {
    strategyInfo = {
      ...strategyInfo,
      il: il as IL,
    };
  }

  if (vaultSymbol.match(/GQF(S|N|W)$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, quickswap],
    };
  } else if (vaultSymbol.match(/QSF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [quickswap],
    };
  } else if (vaultSymbol.match(/CCF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [curve, convex],
    };
  } else if (vaultSymbol.match(/CF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [compound],
    };
  } else if (vaultSymbol.match(/DQMFN?[A-Z0-9]?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [defiEdge, quickswap, merkl],
    };
  } else if (vaultSymbol.match(/IQMF[a-z0-9]{0,1}$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [ichi, quickswap, merkl],
    };
  } else if (vaultSymbol.match(/GQMF(S|N|W)?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, quickswap, merkl],
    };
  } else if (vaultSymbol.match(/\bIRMF\b/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [ichi, retro, merkl],
    };
  } else if (vaultSymbol.match(/GRMF(S|N|W)?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, retro, merkl],
    };
  } else if (vaultSymbol.match(/QSMF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [quickswap, merkl],
    };
  } else if (vaultSymbol.match(/Y$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [yearn],
    };
  } else if (vaultSymbol.match(/GUMF[A-Za-z]?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, uniswapV3, merkl],
    };
  } else if (vaultSymbol.match(/TPF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [trident, pearlV2],
    };
  } else if (vaultSymbol.match(/BSF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [beethovenx],
    };
  } else if (vaultSymbol.match(/BWF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [beethovenx],
    };
  } else if (vaultSymbol.match(/EF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [equalizer],
    };
  } else if (vaultSymbol.match(/ISF(\-\w)?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [ichi, swapx],
    };
  } else if (vaultSymbol.match(/C-SACRAscUSD-ASF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [shadow],
    };
  } else if (vaultSymbol.match(/ASF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [shadow],
    };
  } else if (vaultSymbol.match(/SF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [swapx],
    };
  } else if (vaultSymbol.match(/SiF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [silo],
    };
  } else if (vaultSymbol.match(/(SiL|SL|SAL)$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [silo],
    };
  }
  return strategyInfo;
};
