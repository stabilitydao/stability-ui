/**
 * Converts a Unix timestamp into a formatted date string
 *
 * This function takes a timestamp (in seconds) and returns a string representing the date
 * in the format of "day.month". If the month is a single digit, it will be prefixed with a zero
 *
 * @example
 * ```typescript
 * const timestamp = 1672531199; // Example timestamp for January 1, 2023
 * const formattedDate = formatTimestampToDate(timestamp);
 * console.log(formattedDate); // Output: "1.01"
 * ```
 *
 * @param {number} timestamp - Unix timestamp in seconds to be converted to a date string
 * @returns {string} String representing the date in the format "day.month"
 */

const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month < 10 ? `0${month}` : month}`;
};

export { formatTimestampToDate };
