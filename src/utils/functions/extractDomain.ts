/**
 * Extracts domain from a given URL, removing the protocol and "www" prefix if present
 *
 * @example
 * ```
 * const domain1 = extractDomain("https://thissite.com"); // "thissite.com"
 * const domain2 = extractDomain("http://www.example.com/"); // "example.com"
 * const domain3 = extractDomain("https://www.test.com/path/to/resource"); // "test.com"
 * const domain4 = extractDomain("https://example.com?query=param"); // "example.com"
 * ```
 *
 * @param {string} url - URL from which to extract domain. Must be a valid string.
 *
 * @returns {string} Extracted domain, without the protocol and "www" prefix. Returns an empty string if the input is not a valid string.
 */

const extractDomain = (url: string): string => {
  if (typeof url !== "string") return "";
  return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
};

export { extractDomain };
