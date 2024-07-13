export const getDate = (unix: number) => {
  const date = new Date(unix * 1000);

  const userLocale =
    typeof navigator !== "undefined"
      ? navigator.language || navigator?.userLanguage
      : "en-US";

  const dateFormatter = new Intl.DateTimeFormat(userLocale);

  return dateFormatter.format(date);
};
