export const formatNumber = (value: string | number, type: string) => {
  let changedValue;

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
    default:
      break;
  }
  return changedValue;
};
