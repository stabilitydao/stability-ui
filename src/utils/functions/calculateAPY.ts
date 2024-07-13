export const calculateAPY = (apr: number | string) => {
  if (!apr) {
    apr = 0;
  } else {
    apr = Number(apr) / 100;
  }

  const compoundingFrequency = 365;
  const apy =
    Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;

  return apy * 100;
};
