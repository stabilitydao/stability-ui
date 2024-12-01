/**
 * Formats a Unix timestamp into a human-readable date string based on the user's locale
 *
 * @example
 * ```
 * const formattedDate = getDate(1633024800); // Output may vary based on user's locale, e.g., "10/1/2021" for en-US
 * ```
 *
 * @param {number} unix - Unix timestamp (in seconds) to be converted to a date string
 *
 * @returns {string} Formatted date string according to the user's locale (e.g., "MM/DD/YYYY" for en-US)
 *
 * @remarks
 * - The function automatically detects the user's locale using the browser's `navigator.language` or defaults to "en-US"
 * - If the environment does not provide a `navigator`, "en-US" is used as the fallback locale
 */

export const getDate = (unix: number): string => {
  const date = new Date(unix * 1000);

  const userLocale =
    typeof navigator !== "undefined"
      ? navigator.language || navigator?.userLanguage
      : "en-US";

  const dateFormatter = new Intl.DateTimeFormat(userLocale);

  return dateFormatter.format(date);
};
