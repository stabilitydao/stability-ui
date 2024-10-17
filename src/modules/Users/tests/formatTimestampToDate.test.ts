import { describe, it, expect } from "vitest";

import { formatTimestampToDate } from "../functions";

describe("formatTimestampToDate", () => {
  it("should format timestamp correctly", () => {
    const timestamp = 1672531199;
    expect(formatTimestampToDate(timestamp)).toBe("1.01");
  });

  it("should handle timestamps with single-digit months", () => {
    const timestamp = 1672537600;
    expect(formatTimestampToDate(timestamp)).toBe("1.01");
  });

  it("should handle timestamps with single-digit days", () => {
    const timestamp = 1672536400;
    expect(formatTimestampToDate(timestamp)).toBe("1.01");
  });

  it("should handle leap years correctly", () => {
    const leapYearTimestamp = 1582934400;
    expect(formatTimestampToDate(leapYearTimestamp)).toBe("29.02");
  });

  it("should handle edge cases", () => {
    const edgeCaseTimestamp = 1640908800;
    expect(formatTimestampToDate(edgeCaseTimestamp)).toBe("31.12");
  });
});
