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
  let dayStr
  if (day === 1 || day === 21 || day === 31) {
    dayStr = `${day}st`
  } else if (day === 2 || day === 22) {
    dayStr = `${day}nd`
  } else if (day === 3 || day === 23) {
    dayStr = `${day}rd`
  } else {
    dayStr = `${day}th`
  }

  const month = date.getMonth() + 1;
  let monthStr
  if (month === 1) {
    monthStr = 'Jan'
  } else if (month === 2) {
    monthStr = 'Feb'
  } else if (month === 3) {
    monthStr = 'Mar'
  } else if (month === 4) {
    monthStr = 'Apr'
  } else if (month === 5) {
    monthStr = 'May'
  } else if (month === 6) {
    monthStr = 'Jun'
  } else if (month === 7) {
    monthStr = 'Jul'
  } else if (month === 8) {
    monthStr = 'Aug'
  } else if (month === 9) {
    monthStr = 'Sept'
  } else if (month === 10) {
    monthStr = 'Oct'
  } else if (month === 11) {
    monthStr = 'Nov'
  } else if (month === 12) {
    monthStr = 'Dec'
  }
  return `${dayStr} ${monthStr}`;
};

export { formatTimestampToDate };
