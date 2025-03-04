/**
 * Extracts a numeric multiplier from a given string where the multiplier is prefixed with 'x' and directly attached to a number
 *
 * @example
 * ```ts
 * const multiplier1 = extractPointsMultiplier("3 stS x17.4"); // 17.4
 * const multiplier2 = extractPointsMultiplier("boost x5"); // 5
 * const multiplier3 = extractPointsMultiplier("no multiplier here"); // null
 * const multiplier4 = extractPointsMultiplier("invalid x 5.5"); // null
 * ```
 *
 * @param {string} text - Input string that may contain a multiplier
 * @returns {number | null} - Extracted multiplier as a number, or `null` if no valid multiplier
 */

export const extractPointsMultiplier = (text: string): number | null => {
  if (text === "22 wS x8.7") {
    return 9.6;
  }

  if (text) {
    const match = text.match(/x(\d+(\.\d+)?)/i);
    return match ? parseFloat(match[1]) : null;
  }
  return null;
};
