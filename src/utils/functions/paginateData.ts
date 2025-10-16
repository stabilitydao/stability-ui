const paginateData = <T>(
  data: T[],
  currentPage: number,
  perPage: number
): T[] => {
  const lastIndex = currentPage * perPage;
  const firstIndex = lastIndex - perPage;
  return data.slice(firstIndex, lastIndex);
};

export { paginateData };
