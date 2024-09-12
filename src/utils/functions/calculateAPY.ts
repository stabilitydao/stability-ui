export const calculateAPY = (apr: number | string): number => {
  apr = apr ? Number(apr) / 100 : 0;

  const compoundingFrequency = 365;
  const apy =
    Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;

  return apy * 100;
};
