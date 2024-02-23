export const getDate = (unix: number) => {
  const date = new Date(unix * 1000);

  const userLocale = navigator.language || navigator.userLanguage;

  const dateFormatter = new Intl.DateTimeFormat(userLocale);

  return dateFormatter.format(date);
};
