import { PROTOCOLS } from "@constants";

import type { IFeature, IStrategyInfo } from "@types";

const farmSvg = `<svg fill="#46e29b" width="800px" height="800px" viewBox="0 0 96 96" id="Layer_1_1_" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect height="2" width="2" x="18" y="84"/><rect height="2" width="2" x="6" y="82"/><rect height="2" width="2" x="30" y="79"/><rect height="2" width="2" x="63" y="79"/><rect height="2" width="2" x="78" y="81"/><rect height="2" width="2" x="86" y="85"/><path d="M94,91l-18.739-1.972l-2.707,1.805c-0.035,0.023-0.07,0.044-0.107,0.062l-2,1l-0.895-1.789l1.944-0.972l1.616-1.077L69,86  h-6.586l-3.707,3.707C58.52,89.895,58.265,90,58,90h-2v-2h1.586l3.073-3.073L57,82h-7v-8.025C67.209,73.445,81,59.338,81,42h0  c-17.338,0-31.445,13.791-31.975,31h-1.051C47.445,55.791,33.338,42,16,42h0c0,17.338,13.791,31.445,31,31.975V82h-8l-3.499,2.799  l2.053,1.369c0.145,0.097,0.262,0.229,0.34,0.385L38.618,88H42v2h-4c-0.379,0-0.725-0.214-0.895-0.553l-0.881-1.763L33.697,86H27  l-5.091,2.182L24.6,90.2l-1.2,1.6l-3.69-2.768L2,91l-0.03,3H94V91z M77.293,44.293l1.414,1.414l-25,25l-1.414-1.414L77.293,44.293z   M44.309,70.723l-23-22l1.383-1.445l23,22L44.309,70.723z"/><path d="M33,11.899V19c0,0.315,0.148,0.611,0.4,0.8l7.6,5.7V48h2V25c0-0.315-0.148-0.611-0.4-0.8L35,18.5v-6.601  c2.282-0.463,4-2.48,4-4.899c0-2.761-2.239-5-5-5s-5,2.239-5,5C29,9.419,30.718,11.436,33,11.899z M34,6c0.552,0,1,0.448,1,1  c0,0.552-0.448,1-1,1s-1-0.448-1-1C33,6.448,33.448,6,34,6z"/><path d="M56,24.535l5.555-3.703C61.833,20.646,62,20.334,62,20v-8.101c2.282-0.463,4-2.48,4-4.899c0-2.761-2.239-5-5-5s-5,2.239-5,5  c0,2.419,1.718,4.436,4,4.899v7.566l-5.555,3.703C54.167,23.354,54,23.666,54,24v24h2V24.535z M61,6c0.552,0,1,0.448,1,1  c0,0.552-0.448,1-1,1s-1-0.448-1-1C60,6.448,60.448,6,61,6z"/><path d="M70,24.899V29h-8c-0.552,0-1,0.448-1,1v12h2V31h8c0.552,0,1-0.448,1-1v-5.101c2.282-0.463,4-2.48,4-4.899  c0-2.761-2.239-5-5-5s-5,2.239-5,5C66,22.419,67.718,24.436,70,24.899z M71,19c0.552,0,1,0.448,1,1c0,0.552-0.448,1-1,1  s-1-0.448-1-1C70,19.448,70.448,19,71,19z"/><path d="M24,23.899V30c0,0.552,0.448,1,1,1h8v10h2V30c0-0.552-0.448-1-1-1h-8v-5.101c2.282-0.463,4-2.48,4-4.899  c0-2.761-2.239-5-5-5s-5,2.239-5,5C20,21.419,21.718,23.436,24,23.899z M25,18c0.552,0,1,0.448,1,1c0,0.552-0.448,1-1,1  s-1-0.448-1-1C24,18.448,24.448,18,25,18z"/><path d="M47.5,20.899V51h2V20.899c2.282-0.463,4-2.48,4-4.899c0-2.761-2.239-5-5-5s-5,2.239-5,5  C43.5,18.419,45.218,20.436,47.5,20.899z M48.5,15c0.552,0,1,0.448,1,1c0,0.552-0.448,1-1,1s-1-0.448-1-1  C47.5,15.448,47.948,15,48.5,15z"/>
</svg>`;

const IL = {
  GQFS: {
    rate: 1,
    title: "Zero exp",
    desc: "The strategy of the underlying liquidity provider (Gamma Stable LP) can rebalance the position by expanding it, but this happens extremely rarely, only at times of high volatility of the assets in the pool.",
    color: "#7af996",
  },
  GQFN: {
    rate: 8,
    title: "High",
    desc: "The strategy of the underlying liquidity provider (Gamma Narrow LP) provides liquidity in the narrow range, often rebalancing the position (when the price deviates from the average by approximately +-3.7%). Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#F52A11",
  },
  GQFW: {
    rate: 5,
    title: "Medium",
    desc: "The strategy of the underlying liquidity provider (Gamma Wide LP) provides liquidity in the wide range, rebalancing the position infrequently (when the price deviates from the average by approximately +-10%). Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#F5DA5B",
  },
  QSF: {
    rate: 0,
    title: "None",
    desc: "Liquidity in the form of stablecoins is provided in a fixed range, there are no rebalances, so there are no impermanent losses.",
    color: "#4aff71",
  },
  CF: {
    rate: 0,
    title: "None",
    desc: "Providing assets to the landing protocol does not incur impermanent losses.",
    color: "#4aff71",
  },
  DQMFN: {
    rate: 8,
    title: "High",
    desc: "The strategy of the underlying liquidity provider DefiEdge provides liquidity in the narrow range, often rebalancing the position. Every rebalancing results in a loss. The higher the volatility of the pair, the more rebalancing and the greater the loss.",
    color: "#F52A11",
  },
  IQMF: {
    rate: 4,
    title: "Medium",
    desc: "The strategy of the underlying liquidity provider Ichi provides liquidity in the wide range, not often rebalancing the position.",
    color: "#F5DA5B",
  },
};

export const getStrategyInfo = (vaultSymbol: string): IStrategyInfo => {
  let strategyInfo: IStrategyInfo = {
    name: "",
    shortName: "",
    protocols: [],
    features: [],
    color: "",
    bgColor: "",
    baseStrategies: [],
    ammAdapter: "",
    sourceCode: "",
  };

  const { quickSwap, gamma, compound, defiedge, merkl, ichi } = PROTOCOLS;

  const farm: IFeature = {
    name: "Farming",
    svg: farmSvg,
  };

  if (vaultSymbol.match(/GQF(S|N|W)$/)) {
    const il = vaultSymbol.match(/GQFS$/)
      ? IL.GQFS
      : vaultSymbol.match(/GQFN$/)
      ? IL.GQFN
      : vaultSymbol.match(/GQFW$/)
      ? IL.GQFW
      : { rate: 0, title: "None", desc: "None", color: "#000000" };

    strategyInfo = {
      name: "Gamma QuickSwap Farm",
      shortName: "GQF",
      protocols: [gamma, quickSwap],
      features: [farm],
      color: "#de43ff",
      bgColor: "#140414",
      baseStrategies: ["Liquidity providing", "Farming"],
      ammAdapter: "Algebra",
      il: il,
      sourceCode:
        "https://github.com/stabilitydao/stability-contracts/blob/main/src/strategies/GammaQuickSwapFarmStrategy.sol",
    };
  } else if (vaultSymbol.match(/QSF$/)) {
    strategyInfo = {
      name: "QuickSwap Static Farm",
      shortName: "QSF",
      protocols: [quickSwap],
      features: [farm],
      color: "#558ac5",
      bgColor: "#121319",
      baseStrategies: ["Liquidity providing", "Farming"],
      ammAdapter: "Algebra",
      il: IL.QSF,
      sourceCode:
        "https://github.com/stabilitydao/stability-contracts/blob/main/src/strategies/QuickswapV3StaticFarmStrategy.sol",
    };
  } else if (vaultSymbol.match(/CF$/)) {
    strategyInfo = {
      name: "Compound Farm",
      shortName: "CF",
      protocols: [compound],
      features: [farm],
      color: "#00d395",
      bgColor: "#000000",
      baseStrategies: ["Farming"],
      ammAdapter: "",
      sourceCode: "",
      il: IL.CF,
    };
  } else if (vaultSymbol.match(/DQMFN[a-z0-9]{1}$/)) {
    strategyInfo = {
      name: "DefiEdge QuickSwap Merkl Farm",
      shortName: "DQMF",
      protocols: [defiedge, quickSwap, merkl],
      features: [farm],
      color: "#3477ff",
      bgColor: "#000000",
      baseStrategies: ["Farming"],
      ammAdapter: "",
      sourceCode: "",
      il: IL.DQMFN,
    };
  } else if (vaultSymbol.match(/IQMF[a-z0-9]{0,1}$/)) {
    strategyInfo = {
      name: "Ichi QuickSwap Merkl Farm",
      shortName: "IQMF",
      protocols: [ichi, quickSwap, merkl],
      features: [farm],
      color: "#965fff",
      bgColor: "#000000",
      baseStrategies: ["Farming"],
      ammAdapter: "",
      sourceCode: "",
      il: IL.IQMF,
    };
  } else if (vaultSymbol.match(/GQMF(S|N|W)$/)) {
    const il = vaultSymbol.match(/GQMFS$/)
      ? IL.GQFS
      : vaultSymbol.match(/GQMFN$/)
      ? IL.GQFN
      : vaultSymbol.match(/GQMFW$/)
      ? IL.GQFW
      : { rate: 0, title: "None", desc: "None", color: "#000000" };

    strategyInfo = {
      name: "Gamma QuickSwap Merkl Farm",
      shortName: "GQMF",
      protocols: [gamma, quickSwap, merkl],
      features: [farm],
      color: "#de43ff",
      bgColor: "#140414",
      baseStrategies: ["Liquidity providing", "Farming"],
      ammAdapter: "Algebra",
      il: il,
      sourceCode: "",
    };
  }

  return strategyInfo;
};
