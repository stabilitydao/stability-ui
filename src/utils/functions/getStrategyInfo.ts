import { PROTOCOLS, IL } from "@constants";

import { strategies } from "@stabilitydao/stability";

import type { IStrategyInfo } from "@types";

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

// temporary
const TPF_STABLECOINS_VAULTS = [
  "C-aU-U-TPF",
  "C-UB-aU-TPF",
  "C-MO-UB-TPF",
  "C-D-UB-TPF",
  "C-D-U-TPF",
  "C-MO-U-TPF",
];

export const getStrategyInfo = (
  vaultSymbol: string,
  strategyId: string
): IStrategyInfo => {
  let strategyInfo = Object.values(strategies).find(
    (strategy) => strategy.id === strategyId
  );

  const {
    quickSwap,
    gamma,
    compound,
    defiedge,
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
  } = PROTOCOLS;

  if (!strategyInfo) {
    return {
      id: "",
      shortId: "",
      protocols: [quickSwap, gamma],
      baseStrategies: [],
      color: "",
      bgColor: "",
      ammAdapter: "",
      il: { rate: 0, title: "None", desc: "None", color: "#000000" },
      sourceCode: "",
    };
  }

  if (vaultSymbol.match(/GQF(S|N|W)$/)) {
    const il = vaultSymbol.match(/GQFS$/)
      ? IL.GQFS
      : vaultSymbol.match(/GQFN$/)
        ? IL.GQFN
        : vaultSymbol.match(/GQFW$/)
          ? IL.GQFW
          : { rate: 0, title: "None", desc: "None", color: "#000000" };

    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, quickSwap],
      il,
    };
  } else if (vaultSymbol.match(/QSF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [quickSwap],
      il: IL.QSF,
    };
  } else if (vaultSymbol.match(/CCF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [curve, convex],
      il: IL.CCF,
    };
  } else if (vaultSymbol.match(/CF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [compound],
      il: IL.CF,
    };
  } else if (vaultSymbol.match(/DQMFN?[A-Z0-9]?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [defiedge, quickSwap, merkl],
      il: IL.DQMFN,
    };
  } else if (vaultSymbol.match(/IQMF[a-z0-9]{0,1}$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [ichi, quickSwap, merkl],
      il: IL.IQMF,
    };
  } else if (vaultSymbol.match(/GQMF(S|N|W)?$/)) {
    const il = vaultSymbol.match(/GQMFS$/)
      ? IL.GQFS
      : vaultSymbol.match(/GQMFN$/)
        ? IL.GQFN
        : vaultSymbol.match(/GQMFW$/)
          ? IL.GQFW
          : { rate: 0, title: "None", desc: "None", color: "#4aff71" };

    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, quickSwap, merkl],
      il,
    };
  } else if (vaultSymbol.match(/\bIRMF\b/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [ichi, retro, merkl],
      il: IL.IQMF,
    };
  } else if (vaultSymbol.match(/GRMF(S|N|W)?$/)) {
    const il = vaultSymbol.match(/GRMFS$/)
      ? IL.GQFS
      : vaultSymbol.match(/GRMFN$/)
        ? IL.GQFN
        : vaultSymbol.match(/GRMFW$/)
          ? IL.GQFW
          : { rate: 0, title: "None", desc: "None", color: "#000000" };
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, retro, merkl],
      il,
    };
  } else if (vaultSymbol.match(/QSMF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [quickSwap, merkl],
      il: IL.QSMF,
    };
  } else if (vaultSymbol.match(/Y$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [yearn],
      il: IL.Y,
    };
  } else if (vaultSymbol.match(/GUMF[A-Za-z]?$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [gamma, uniswapV3, merkl],
      il: IL.LOW,
    };
  } else if (vaultSymbol.match(/TPF$/)) {
    strategyInfo = {
      ...strategyInfo,
      protocols: [trident, pearlV2],
      il: TPF_STABLECOINS_VAULTS.includes(vaultSymbol) ? IL.TPF_STABLE : IL.TPF,
    };
  }

  return strategyInfo;
};
