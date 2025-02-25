const TABS: string[] = ["Deposit", "Withdraw"];

const TRANSACTION_SETTINGS = {
  slippage: ["1", "3", "5"],
  approves: ["limited", "unlimited"],
  gasLimits: ["1", "1.1"],
};

const ZAP_ROUTERS = {
  "1inch": {
    logo: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/1inch.svg",
    title: "1inch DeX",
  },
  swapper: { logo: "/logo.svg", title: "Swapper" },
};

export { TABS, TRANSACTION_SETTINGS, ZAP_ROUTERS };
