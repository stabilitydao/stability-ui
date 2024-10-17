//todo: add types after library update

const findCurrentAndPreviousPeriod = (periods) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  let previousPeriod = null;

  for (const key in periods) {
    const period = periods[key];
    if (currentTimestamp >= period.start && currentTimestamp <= period.end) {
      return { currentPeriod: key, previousPeriod };
    }
    previousPeriod = key;
  }

  return { currentPeriod: null, previousPeriod };
};

export { findCurrentAndPreviousPeriod };
