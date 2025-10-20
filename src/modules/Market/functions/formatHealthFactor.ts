export const formatHealthFactor = (hf: number): string => {
  hf = Number(hf);

  if (hf < 1) return "-1";

  if (hf > 100) return "∞";

  const level = Math.floor(hf);

  return `${level}+`;
};
