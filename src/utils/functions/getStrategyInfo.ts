import {
  strategies,
  getIL,
  getStrategyProtocols,
  type StrategyShortId,
} from "@stabilitydao/stability";

import type { IStrategyInfo, TAddress, IL } from "@types";

/**
 * Retrieves detailed information about a strategy based on the vault symbol
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
  strategyId: string,
  strategyShortId: StrategyShortId,
  strategySpecific: string,
  assets: TAddress[]
): IStrategyInfo => {
  let strategyInfo = Object.values(strategies).find(
    (strategy) => strategy.id === strategyId
  );

  if (!strategyInfo) {
    return {
      id: "",
      shortId: "",
      protocols: [],
      baseStrategies: [],
      color: "",
      bgColor: "",
      ammAdapter: "",
      il: { rate: 0, title: "None", desc: "None", color: "#000000" },
      sourceCode: "",
    };
  }

  const il = getIL(strategyShortId, strategySpecific, assets);
  let protocols = getStrategyProtocols(strategyShortId);

  if (il) {
    strategyInfo = {
      ...strategyInfo,
      il: il as IL,
    };
  }

  if (protocols.length) {
    protocols = protocols.map((protocol) => ({
      name: protocol.name,
      logoSrc: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img}`,
    }));

    strategyInfo = {
      ...strategyInfo,
      protocols,
    };
  }

  return strategyInfo;
};
