export const determineAPR = (
  graphAPR: string | undefined,
  APR: string | number,
  fallbackAPR: string | number
) => {
  if (graphAPR && Number(APR) <= 0) {
    return Number(fallbackAPR).toFixed(2);
  }

  return Number(APR).toFixed(2);
};
