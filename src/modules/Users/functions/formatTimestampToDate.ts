const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month < 10 ? `0${month}` : month}`;
};

export { formatTimestampToDate };
