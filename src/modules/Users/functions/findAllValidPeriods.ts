import type { YieldContest } from "@stabilitydao/stability";

import type { TContests } from "@types";

type TPeriodKeys = {
  currentPeriod: keyof YieldContest | null;
  previousPeriod: keyof YieldContest | null;
  nextPeriod: keyof YieldContest | null;
};

/**
 * Finds the current, previous, and next contest periods based on the given timestamps
 *
 * This function takes an object containing contest periods and determines which period is
 * currently active, which one was the last, and which one is upcoming, based on the current
 * timestamp. It returns the keys of these periods
 *
 * @example
 * ```typescript
 * const contests = {
 *   contest1: { start: 1672531199, end: 1672617599 },
 *   contest2: { start: 1672617600, end: 1672703999 },
 *   contest3: { start: 1672704000, end: 1672790399 },
 * };
 * const periods = findAllValidPeriods(contests);
 * console.log(periods); // Output: { currentPeriod: 'contest2', previousPeriod: 'contest1', nextPeriod: 'contest3' }
 * ```
 *
 * @param {TContests} periods - Object where each key is a contest identifier and each value
 * contains the `start` and `end` timestamps of the contest
 * @returns {TPeriodKeys} Object containing the keys of the current, previous, and next periods
 */

const findAllValidPeriods = (periods: TContests): TPeriodKeys => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  let previousPeriod = null;
  let nextPeriod = null;
  let currentPeriod = null;

  for (const key in periods) {
    const period = periods[key];

    if (currentTimestamp >= period.start && currentTimestamp <= period.end) {
      currentPeriod = key as keyof YieldContest;
    }

    if (!nextPeriod && period.start > currentTimestamp) {
      nextPeriod = key as keyof YieldContest;
    }

    if (period.end < currentTimestamp) {
      previousPeriod = key as keyof YieldContest;
    }
  }

  return { currentPeriod, previousPeriod, nextPeriod };
};

export { findAllValidPeriods };
