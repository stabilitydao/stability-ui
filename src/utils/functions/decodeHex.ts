/**
 * Decodes a hexadecimal (hex) string into a UTF-8 string
 *
 * @example
 * ```
 * const hexString = "0x68656c6c6f"; // Represents "hello"
 * const decodedString = decodeHex(hexString); // Returns "hello"
 *
 * const invalidHexString = "123g"; // Contains non-hex character
 * const result = decodeHex(invalidHexString); // Returns ""
 *
 * const noPrefixHexString = "68656c6c6f"; // Represents "hello"
 * const decodedResult = decodeHex("0x" + noPrefixHexString); // Returns "hello"
 * ```
 *
 * @param {string} hex - The hex-encoded string to decode. The string should start with "0x" followed by hex digits
 *
 * @returns {string} The decoded UTF-8 string
 */

export const decodeHex = (hex: string): string => {
  if (typeof hex !== "string") {
    return "";
  }

  const hexWithoutPrefix = hex.slice(2);

  const bytes = [];
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    const hex = parseInt(hexWithoutPrefix.slice(i, i + 2), 16);

    if (hex) bytes.push(hex);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
};
