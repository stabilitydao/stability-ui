type ReturnData = {
  years?: number;
  days: number;
  hours: number;
};

/**
 * Function to calculate the difference between the current time and a given unix timestamp.
 * Optionally includes years in the result if `withYears` is set to true.
 *
 * @example
 *
 * ```ts
 * const unixTimestamp = 1694515200;
 *
 * // Without years
 * const timeDifference = getTimeDifference(unixTimestamp);
 * // { days: number, hours: number }
 *
 * // With years
 * const timeDifferenceWithYears = getTimeDifference(unixTimestamp, true);
 * // { years: number, days: number, hours: number }
 * ```
 *
 * @param {number | string | bigint} unix - Unix timestamp (in seconds) to compare with the current time
 * @param {boolean} [withYears=false] - Whether to include the number of full years in the result
 *
 * @returns {Object} Time difference between the current time and the provided timestamp
 * @returns {number} days - The number of days in the difference
 * @returns {number} hours - The number of hours in the difference (remaining after subtracting full days)
 * @returns {number} [years] - The number of full years in the difference (only if `withYears` is true)
 */

export const getTimeDifference = (
  unix: number | string | bigint,
  withYears: boolean = false
): ReturnData => {
  unix = Number(unix);
  const currentTime = Date.now() / 1000;
  const targetTime = unix;

  const differenceInSeconds = currentTime - targetTime;

  let days = Math.floor(differenceInSeconds / (60 * 60 * 24));
  const hours = Math.floor((differenceInSeconds % (60 * 60 * 24)) / (60 * 60));

  if (withYears) {
    const years = Math.floor(days / 365);
    days = days % 365;
    return { years, days, hours };
  }

  return { days, hours };
};
