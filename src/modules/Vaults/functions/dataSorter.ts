export const dataSorter = (
  a: string,
  b: string,
  dataType: string,
  sortOrder: string
): number => {
  if (dataType === "number") {
    return sortOrder === "ascendentic"
      ? Number(a) - Number(b)
      : Number(b) - Number(a);
  }
  if (dataType === "string") {
    return sortOrder === "ascendentic"
      ? a.localeCompare(b)
      : b.localeCompare(a);
  }
  return 0;
};
