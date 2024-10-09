/**
 * Checks if all properties of an object are considered empty.
 *
 * Empty values include:
 * - Empty strings `""`
 * - `null`
 * - `undefined`
 * - Empty arrays `[]`
 * - Empty objects `{}`
 *
 * @example
 * ```ts
 * const obj = {
 *   name: "",
 *   age: null,
 *   items: [],
 *   details: {},
 * };
 *
 * const isObjEmpty = isEmptyObject(obj); // true
 * ```
 *
 * @param {Object} object - The object to be checked for empty values
 *
 * @returns {boolean} `true` if all properties of the object are empty, otherwise `false`
 */

export const isEmptyObject = (object: Object): boolean => {
  return Object.values(object).every((value) => {
    return (
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    );
  });
};
