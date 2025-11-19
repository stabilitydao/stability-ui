export const formatHealthFactor = (hf: number): string => {
  hf = Number(hf);

  if (hf < 1) return "<1";

  if (hf >= 1000) return "∞";

  return hf.toFixed(3);
};
