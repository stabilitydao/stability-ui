import { describe, it, expect, vi } from "vitest";

import { findAllValidPeriods } from "../functions";

import type { TContests } from "@types";

describe("findAllValidPeriods", () => {
  it("should return correct current, previous, and next periods", () => {
    const currentTime = 1672531199;
    vi.setSystemTime(currentTime * 1000);

    const periods: TContests = {
      period1: { start: 1672530000, end: 1672533600 },
      period2: { start: 1672537200, end: 1672540800 },
      period3: { start: 1672544400, end: 1672548000 },
    };

    const result = findAllValidPeriods(periods);

    expect(result.currentPeriod).toBe("period1");
    expect(result.previousPeriod).toBe(null);
    expect(result.nextPeriod).toBe("period2");
  });

  it("should return only previous period when current is null", () => {
    const currentTime = 1672531199;
    vi.setSystemTime(currentTime * 1000);

    const periods: TContests = {
      period1: { start: 1672527600, end: 1672530000 },
      period2: { start: 1672537200, end: 1672540800 },
      period3: { start: 1672544400, end: 1672548000 },
    };

    const result = findAllValidPeriods(periods);

    expect(result.currentPeriod).toBe(null);
    expect(result.previousPeriod).toBe("period1");
    expect(result.nextPeriod).toBe("period2");
  });

  it("should return nulls when all periods are in the future", () => {
    const periods: TContests = {
      period1: { start: 1672537200, end: 1672540800 },
      period2: { start: 1672544400, end: 1672548000 },
    };

    const result = findAllValidPeriods(periods);

    expect(result.currentPeriod).toBe(null);
    expect(result.previousPeriod).toBe(null);
    expect(result.nextPeriod).toBe("period1");
  });
});
