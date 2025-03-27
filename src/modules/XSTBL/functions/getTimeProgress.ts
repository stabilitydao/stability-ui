export const getTimeProgress = (start: number, end: number): number => {
  const totalDays = (end - start) / (1000 * 60 * 60 * 24);
  const passedDays = (Date.now() - start) / (1000 * 60 * 60 * 24);

  const progress = Math.min((passedDays / totalDays) * totalDays, totalDays);

  return Number(progress.toFixed(1));
};
