export const formatNumber = (
  value: string | number,
  type: string
): string | number => {
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
    case "chartAbbreviate":
      value = Number(value);
      if (value <= 0) return 0;

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
        ? parseFloat(`0.${decimalPart}`).toFixed(2).slice(2)
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
      if (Number(value) > 0.1) value = Number(value).toFixed(2);
      value = String(value);
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
    default:
      break;
  }
  return changedValue;
};
