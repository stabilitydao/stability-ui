/**
 * Converts a Unix timestamp into a formatted date string with optional year
 *
 * This function takes a Unix timestamp (in seconds) and returns a string representing
 * the date in the format "day[suffix] month" (e.g., "1st Jan"). The suffix corresponds to
 * the ordinal form of the day (st, nd, rd, th). Optionally, the year can be included by passing `withYear` as `true`
 *
 * @example
 * ```typescript
 * const timestamp = 1672531199; // Example timestamp for January 1, 2023
 * const formattedDate = formatTimestampToDate(timestamp);
 * console.log(formattedDate); // Output: "1st Jan"
 *
 * const formattedDateWithYear = formatTimestampToDate(timestamp, true);
 * console.log(formattedDateWithYear); // Output: "1st Jan 2023"
 * ```
 *
 * @param {number} timestamp - Unix timestamp in seconds to be converted to a formatted date string
 * @param {boolean} [withYear=false] - Optional flag to include the year in the returned string
 * @returns {string} String representing the date in the format "day[suffix] month" or "day[suffix] month year" if `withYear` is true
 */

import { MONTHS } from "@constants";

const formatTimestampToDate = (
  timestamp: number,
  withYear: boolean = false
): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const suffixes = ["th", "st", "nd", "rd"];

  const suffix =
    day >= 11 && day <= 13 ? suffixes[0] : suffixes[day % 10] || suffixes[0];

  let formattedDate = `${day}${suffix} ${MONTHS[month]}`;

  if (withYear) {
    formattedDate += ` ${year}`;
  }

  return formattedDate;
};

export { formatTimestampToDate };
