const getShortAddress = (
  address: string,
  firstChars: number = 4,
  lastChars: number = 2
): string => {
  return `${address.slice(0, firstChars)}..${address.slice(-lastChars)}`;
};

export { getShortAddress };
