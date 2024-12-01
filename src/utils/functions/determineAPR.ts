/**
 * Determines and formats the APR (Annual Percentage Rate) based on provided values and conditions
 *
 * @example
 * ```
 * const apr1 = determineAPR("5.67", 0, 4.5); // Returns "4.50" because APR is <= 0
 * const apr2 = determineAPR(undefined, 3.456, 4.5); // Returns "3.46" because APR is > 0
 * const apr3 = determineAPR("7.89", -1, 6.5); // Returns "6.50" because APR <= 0
 * ```
 *
 * @param {string | undefined} graphAPR - APR value from a graph or external source
 * @param {string | number} APR - Main APR value to use if it is valid (greater than 0)
 * @param {string | number} fallbackAPR - Fallback APR value to use if `graphAPR` is defined and `APR` is not valid (<= 0)
 *
 * @returns {string} Formatted APR value as a string with two decimal places
 */

export const determineAPR = (
  graphAPR: string | undefined,
  APR: string | number,
  fallbackAPR: string | number
): string => {
  if (graphAPR && Number(APR) <= 0) {
    return Number(fallbackAPR).toFixed(2);
  }

  return Number(APR).toFixed(2);
};
