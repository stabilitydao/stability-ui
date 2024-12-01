import { tokenlist } from "@stabilitydao/stability";

const getTokenData = (address: string): any => {
  for (const token of tokenlist.tokens) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return {
        address: token.address.toLowerCase(),
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token?.tags,
      };
    }
  }
  return undefined;
};

const calculateAPR = (almEntity: number, fee: number) => {
  return almEntity - (almEntity / 100) * fee;
};

const getDaysFromLastHardWork = (lastHardWork: number) => {
  const currentTime = Date.now() / 1000;
  const targetTime = Number(lastHardWork);
  const differenceInSeconds = currentTime - targetTime;
  return Math.floor(differenceInSeconds / (60 * 60 * 24));
};

const isDifferenceWithinTwentyPercent = (
  num1: number,
  num2: number
): boolean => {
  const larger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);

  const difference = Math.abs(larger - smaller);
  const twentyPercentOfLarger = Math.abs(larger * 0.2);

  return difference <= twentyPercentOfLarger;
};

export {
  getTokenData,
  calculateAPR,
  getDaysFromLastHardWork,
  isDifferenceWithinTwentyPercent,
};
