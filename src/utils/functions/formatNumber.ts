/**
 * Formats a number or string based on the specified format type
 *
 * @example
 * ```
 * const abbreviated = formatNumber(1234567, "abbreviate"); // "$1.23M"
 * const formatted = formatNumber(1234567.891, "format"); // "1 234 567.89"
 * const smallFormatted = formatNumber(0.1234, "smallNumbers"); // "0.12"
 * ```
 *
 * @param {string | number} value - Number or numeric string to be formatted
 * @param {string} type - The type of formatting to be applied. Options include:
 *   - "abbreviate": Formats number using abbreviations like K, M, B, etc. with two decimal places
 *   - "abbreviateInteger": Formats number using abbreviations with no decimal places
 *   - "chartAbbreviate": Formats number with variable decimal places based on size, using abbreviations for large values
 *   - "formatWithoutDecimalPart": Formats number with space-separated thousands and no decimal part
 *   - "format": Formats number with space-separated thousands and two decimal places
 *   - "formatWithLongDecimalPart": Formats number with space-separated thousands and four decimal places
 *   - "smallNumbers": Formats small numbers with space-separated thousands and up to two decimal places
 *
 * @returns {string | number} Formatted number as a string. For "smallNumbers" type, it can return a number if the value is greater than 0.1
 */

export const formatNumber = (value: string | number, type: string): string => {
  let changedValue = "";

  const suffixes = ["", "K", "M", "B", "T"];
  let suffixNum = 0;

  switch (type) {
    case "abbreviate":
      value = Number(value);

      while (value >= 1000) {
        value /= 1000;
        suffixNum++;
      }

      const fixeds = !!suffixNum ? 2 : 0;
      let roundedValue = value.toFixed(fixeds);

      if (suffixNum > 0) {
        roundedValue += suffixes[suffixNum];
      }
      changedValue = "$" + roundedValue;
      break;
    case "abbreviateNotUsd":
      value = Number(value);

      while (value >= 1000) {
        value /= 1000;
        suffixNum++;
      }

      const fixedsNotUsd = !!suffixNum ? 2 : 0;
      let roundedValueNotUsd = value.toFixed(fixedsNotUsd);

      if (suffixNum > 0) {
        roundedValueNotUsd += suffixes[suffixNum];
      }
      changedValue = roundedValueNotUsd;
      break;
    case "abbreviateInteger":
      value = Number(value);

      while (value >= 1000) {
        value /= 1000;
        suffixNum++;
      }

      let rounded = value.toFixed(0);

      if (suffixNum > 0) {
        rounded += suffixes[suffixNum];
      }
      changedValue = "$" + rounded;
      break;
    case "abbreviateIntegerNotUsd":
      value = Number(value);

      if (value > 1000000000000) {
        return "1T+";
      }

      while (value >= 1000) {
        value /= 1000;
        suffixNum++;
      }

      let rounded1 = value.toFixed(0);

      if (suffixNum > 0) {
        rounded1 += suffixes[suffixNum];
      }
      changedValue = rounded1;
      break;
    case "chartAbbreviate":
      value = Number(value);
      if (value <= 0) return "0";

      let newValue;

      if (value >= 1000) {
        while (value >= 1000) {
          value /= 1000;
          suffixNum++;
        }
        newValue = value.toFixed();
      } else {
        if (value < 10) {
          newValue = value.toFixed(2);
        } else if (value < 50) {
          newValue = value.toFixed(1);
        } else if (value > 100) {
          newValue = Math.floor(value / 10) * 10;
        } else {
          newValue = value.toFixed();
        }
      }

      if (suffixNum > 0) {
        newValue += suffixes[suffixNum];
      }

      changedValue = "$" + newValue;
      break;
    case "formatWithoutDecimalPart":
      value = String(value);

      changedValue = value.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

      break;
    case "format":
      value = String(value);

      const [integerPart, decimalPart] = value.split(".");

      const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        " "
      );

      const roundedDecimalPart = decimalPart
        ? decimalPart.slice(0, 2).padEnd(2, "0")
        : "";

      const formattedValue = roundedDecimalPart
        ? `${formattedInteger}.${roundedDecimalPart}`
        : formattedInteger;
      changedValue = formattedValue;

      break;
    case "formatWithLongDecimalPart":
      value = String(value);

      const [integerPartSecond, decimalPartSecond] = value.split(".");
      let formattedValueSecond;

      const roundedDecimalPartSecond = decimalPartSecond
        ? parseFloat(`0.${decimalPartSecond}`).toFixed(4).slice(2)
        : "";

      const formattedIntegerSecond = integerPartSecond.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        " "
      );

      formattedValueSecond = roundedDecimalPartSecond
        ? `${formattedIntegerSecond}.${roundedDecimalPartSecond}`
        : formattedIntegerSecond;

      changedValue = formattedValueSecond;

      break;
    case "smallNumbers":
      if (Number(value) > 0.1) {
        value = Number(value).toFixed(2);
      } else {
        value = Number(value).toFixed(5);
      }

      const [smallIntegerPart, smallDecimalPart] = value.split(".");

      const smallFormattedInteger = smallIntegerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        " "
      );

      const smallFormattedValue = smallDecimalPart
        ? `${smallFormattedInteger}.${smallDecimalPart}`
        : smallFormattedInteger;

      changedValue = smallFormattedValue;
      break;
    case "withSpaces":
      value = String(value);

      changedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      break;
    case "formatAPR":
      value = Number(value);

      if (value >= 1000000) {
        changedValue = (value / 1000000).toFixed(1) + "M";
      } else if (value >= 10000) {
        changedValue = (value / 1000).toFixed(1) + "K";
      } else {
        changedValue = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      }

      break;
    default:
      break;
  }
  return changedValue;
};
