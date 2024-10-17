//todo: add types after library update

const findAllValidPeriods = (periods) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  let previousPeriod = null;
  let nextPeriod = null;
  let currentPeriod = null;

  for (const key in periods) {
    const period = periods[key];

    if (currentTimestamp >= period.start && currentTimestamp <= period.end) {
      currentPeriod = key;
    }

    if (!nextPeriod && period.start > currentTimestamp) {
      nextPeriod = key;
    }

    if (period.end < currentTimestamp) {
      previousPeriod = key;
    }
  }

  return { currentPeriod, previousPeriod, nextPeriod };
};

export { findAllValidPeriods };
