import { formatUnits } from "viem/utils";

/**
 * Formats a value of type `BigInt`, `number`, or `string` based on the specified type of formatting
 *
 * @example
 * ```
 * const formatted1 = formatFromBigInt(1234567890n, 18, "withDecimals"); // 1.23456
 * const formatted2 = formatFromBigInt("1234567890", 18, "withFloor"); // 1
 * const formatted3 = formatFromBigInt(1234567890n, 18); // 1.23456789
 * ```
 *
 * @param {number | string | bigint} value - Value to be formatted. Can be a `BigInt`, `number`, or numeric `string`.
 * @param {number} decimals - Number of decimal places to use for formatting
 * @param {string} [type=""] -Type of formatting to be applied. Options include:
 *   - "withDecimals": Formats the value with up to five decimal places, rounding appropriately
 *   - "withFloor": Formats the value and applies floor rounding to the whole number part
 *   - Default: Formats the value according to the given number of decimal places without additional rounding
 *
 * @returns {number} Formatted value as a number
 */

export const formatFromBigInt = (
  value: number | string | bigint,
  decimals: number,
  type: string = ""
): number => {
  let formatedValue;

  switch (type) {
    case "withDecimals":
      formatedValue =
        Math.floor(+formatUnits(BigInt(value), decimals) * 100000) / 100000;
      break;
    case "withFloor":
      formatedValue = Math.floor(+formatUnits(BigInt(value), decimals));
      break;
    default:
      formatedValue = +formatUnits(BigInt(value), decimals);
      break;
  }
  return formatedValue;
};
