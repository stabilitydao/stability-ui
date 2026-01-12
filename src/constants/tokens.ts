import type { TAddress } from "@types";

const USDC: TAddress[] = [
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "0xaec9e50e3397f9ddc635c6c429c8c7eca418a143",
  "0xc518a88c67ceca8b3f24c4562cb71deeb2af86b7",
  "0x29219dd400f2bf60e5a23d13be72b486d4038894",
  "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
];

const scUSD: TAddress[] = ["0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae"];

const USDT: TAddress[] = [
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
];
const DAI: TAddress[] = [
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
  "0x75d0cbf342060b14c2fc756fd6e717dfeb5b1b70",
];
const WMATIC: TAddress[] = ["0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"];
const WETH: TAddress[] = [
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  "0x4200000000000000000000000000000000000006",
  "0x309c92261178fa0cf748a855e90ae73fdb79ebc7",
];
const WBTC: TAddress[] = ["0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"];
const PROFIT: TAddress[] = ["0x48469a0481254d5945e7e56c1eb9861429c02f44"];
const SDIV: TAddress[] = ["0x9844a1c30462b55cd383a2c06f90bb4171f9d4bb"];
const PM: TAddress[] = ["0xAA3e3709C79a133e56C17a7ded87802adF23083B"];
const TREASURY: TAddress[] = ["0xC82676D6025bbA6Df3585d2450EF6D0eE9b8607E"];
const MULTISIG: TAddress[] = ["0x36780E69D38c8b175761c6C5F8eD42E61ee490E9"];
const CRV: TAddress[] = [
  "0xc4ce1d6f5d98d65ee25cf85e9f2e9dcfee6cb5d6",
  "0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93",
];

const cbETH: TAddress[] = ["0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22"];

const MORE: TAddress[] = ["0x25ea98ac87a38142561ea70143fd44c4772a16b6"];
const USTB: TAddress[] = ["0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd"];

const STABILITY_TOKENS = {
  146: {
    stbl: {
      address: "0x78a76316F66224CBaCA6e70acB24D5ee5b2Bd2c7",
      symbol: "STBL",
      decimals: 18,
    },
    xstbl: {
      address: "0x902215dd96a291b256a3aef6c4dee62d2a9b80cb",
      symbl: "xSTBL",
      decimals: 18,
    },
  },
  9745: {
    stbl: {
      address: "0xfdf91362B7E9330F232e500c0236a02B0DE3e492",
      symbol: "STBL",
      decimals: 18,
    },
    xstbl: {
      address: "0xF40D0724599282CaF9dfb66feB630e936bC0CFBE",
      symbl: "xSTBL",
      decimals: 18,
    },
  },
};

export {
  USDC,
  USDT,
  DAI,
  WMATIC,
  WETH,
  WBTC,
  PROFIT,
  SDIV,
  PM,
  TREASURY,
  MULTISIG,
  CRV,
  cbETH,
  MORE,
  USTB,
  scUSD,
  STABILITY_TOKENS,
};
