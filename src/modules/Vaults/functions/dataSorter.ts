/**
 * Sorts two values based on specified data type and sort order
 *
 * @example
 * ```
 * const result1 = dataSorter("10", "5", "number", "ascendentic"); // 5
 *
 * const result2 = dataSorter("apple", "banana", "string", "descendentic"); // positive value (banana comes before apple)
 * ```
 *
 * @param {string} a - First value to compare
 * @param {string} b - Second value to compare
 * @param {string} dataType - Type of data being sorted, accepts `"number"` or `"string"`
 * @param {string} sortOrder - Order in which to sort. Accepts `"ascendentic"` for ascending order or any other value for descending order
 *
 * @returns {number} Value indicating the sort order:
 *   - Negative number if `a` should be sorted before `b`
 *   - Positive number if `a` should be sorted after `b`
 *   - `0` if values are equal
 */

export const dataSorter = (
  a: string,
  b: string,
  dataType: string,
  sortOrder: string
): number => {
  if (dataType === "number") {
    return sortOrder === "ascendentic"
      ? Number(a) - Number(b)
      : Number(b) - Number(a);
  }
  if (dataType === "string") {
    return sortOrder === "ascendentic"
      ? a.localeCompare(b)
      : b.localeCompare(a);
  }
  return 0;
};
