/**
 * Converts a Unix timestamp into a formatted date string
 *
 * This function takes a timestamp (in seconds) and returns a string representing the date
 * in the format of "day[suffix] month". The suffix indicates the ordinal of the day (st, nd, rd, th)
 *
 * @example
 * ```typescript
 * const timestamp = 1672531199; // Example timestamp for January 1, 2023
 * const formattedDate = formatTimestampToDate(timestamp);
 * console.log(formattedDate); // Output: "1st Jan"
 * ```
 *
 * @param {number} timestamp - Unix timestamp in seconds to be converted to a date string
 * @returns {string} String representing the date in the format "day[suffix] month"
 */

import { MONTHS } from "@constants";

const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth();

  const suffixes = ["th", "st", "nd", "rd"];

  const suffix =
    day >= 11 && day <= 13 ? suffixes[0] : suffixes[day % 10] || suffixes[0];

  return `${day}${suffix} ${MONTHS[month]}`;
};

export { formatTimestampToDate };
