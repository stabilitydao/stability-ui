export function calculateAPY(apr: number | string) {
  apr = Number(apr) / 100;
  const compoundingFrequency = 365;
  const apy =
    Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;
  console.log(apy * 100);
  return apy * 100;
}
