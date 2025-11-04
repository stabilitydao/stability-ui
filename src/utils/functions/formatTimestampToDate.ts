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
 * formatTimestampToDate(timestamp); // "1st Jan"
 * formatTimestampToDate(timestamp, true); // "1st Jan 2023"
 * formatTimestampToDate(timestamp, true, true); // "1st Jan 2023, 00:59:59"
 * ```
 *
 * @param {number} timestamp - Unix timestamp in seconds to be converted to a formatted date string
 * @param {boolean} [withYear=false] - Optional flag to include the year in the returned string
 * @param {boolean} [withExactTime=false] - Optional flag to include time in HH:mm:ss format
 * @returns {string} String representing the date in the format "day[suffix] month" or "day[suffix] month year" if `withYear` is true
 */

import { MONTHS } from "@constants";

const formatTimestampToDate = (
  timestamp: number,
  withYear: boolean = false,
  withExactTime: boolean = false
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

  if (withExactTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    formattedDate += `, ${hours}:${minutes}:${seconds}`;
  }

  return formattedDate;
};

export { formatTimestampToDate };
