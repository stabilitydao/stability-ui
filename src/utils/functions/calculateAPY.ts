/**
 * Calculates the Annual Percentage Yield (APY) based on the provided Annual Percentage Rate (APR)
 *
 * @example
 * ```
 * // Calculate APY for an APR of 5%
 * const apy = calculateAPY(5); // Outputs: 5.127
 * ```
 *
 * @param {number | string} apr - Annual Percentage Rate (APR) as a number or string
 *   It should be provided as a percentage (e.g., "5" for 5%).
 *
 * @returns {number} Calculated Annual Percentage Yield (APY) as a percentage
 */

export const calculateAPY = (apr: number | string): number => {
  apr = apr ? Number(apr) / 100 : 0;

  const compoundingFrequency = 365;

  const apy =
    Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;

  return apy * 100;
};
