/**
 * Truncates a numeric value to a specified number of decimal places without rounding.
 *
 * @example
 * ```ts
 * exactToFixed("123.456789", 2); // "123.45"
 * exactToFixed(5.9999, 3);       // "5.999"
 * exactToFixed(100, 2);          // "100.00"
 * ```
 *
 * @param {number | string} value - The numeric value to truncate
 * @param {number} precision - Number of digits to keep after the decimal point
 *
 * @returns {string} The truncated number as a string with exact decimal places
 */
const exactToFixed = (value: number | string, precision: number): string => {
  const [intPart, decPart = ""] = String(value).split(".");
  const truncatedDec = decPart.slice(0, precision).padEnd(precision, "0");
  return `${intPart}.${truncatedDec}`;
};

export { exactToFixed };
