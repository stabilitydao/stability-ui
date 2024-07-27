// import { defineWalletSetup, MetaMask } from "@synthetixio/synpress";

// const SEED_PHRASE = import.meta.env.PUBLIC_SEED_PHRASE;

// const PASSWORD = import.meta.env.PUBLIC_METAMSK_PASSWORD;

// const polygon = {
//   symbol: "MATIC",
//   name: "Polygon Mainnet",
//   rpcUrl: "https://polygon-rpc.com/",
//   chainId: 137,
// };

// export default defineWalletSetup(
//   PASSWORD,
//   async (context: any, walletPage: any) => {
//     const metamask = new MetaMask(context, walletPage, PASSWORD);
//     await metamask.importWallet(SEED_PHRASE);
//     await metamask.addNetwork(polygon);
//     await metamask.switchNetwork(polygon.name);

//     await metamask.importWalletFromPrivateKey(
//       import.meta.env.PUBLIC_PRIVATE_KEY
//     );
//   }
// );

// to install for synpress
// "@rollup/plugin-commonjs": "^26.0.1",
// "@rollup/plugin-node-resolve": "^15.2.3",
// "@synthetixio/synpress": "4.0.0-alpha.7",
// "rollup": "^4.18.1",
