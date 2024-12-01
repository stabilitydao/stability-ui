type ReturnData = {
  days: number;
  hours: number;
};

/**
 * Function to calculate the difference between the current time and a given unix timestamp
 *
 * @example
 *
 * ```
 * const unixTimestamp = 1694515200;
 * const timeDifference = getTimeDifference(unixTimestamp);
 * ```
 *
 * @param {number | string | bigint} unix - Unix timestamp (in seconds) to compare with the current time
 *
 * @returns {Object} Time difference between the current time and the provided timestamp
 * @returns {number} days - The number of days in the difference
 * @returns {number} hours - The number of hours in the difference (remaining after subtracting full days)
 */

export const getTimeDifference = (
  unix: number | string | bigint
): ReturnData => {
  unix = Number(unix);
  const currentTime = new Date().getTime() / 1000;
  const targetTime = unix;

  const differenceInSeconds = currentTime - targetTime;

  const days = Math.floor(differenceInSeconds / (60 * 60 * 24));
  const hours = Math.floor((differenceInSeconds % (60 * 60 * 24)) / (60 * 60));
  //const minutes = Math.floor((differenceInSeconds % (60 * 60)) / 60);
  //const seconds = differenceInSeconds % 60;

  return { days: days, hours: hours };
};
