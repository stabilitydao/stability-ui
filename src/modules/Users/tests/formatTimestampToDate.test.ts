import { describe, it, expect } from "vitest";

import { formatTimestampToDate } from "../functions";

describe("formatTimestampToDate", () => {
  it("should format timestamp correctly for 1st January", () => {
    const timestamp = 1672541199;
    expect(formatTimestampToDate(timestamp)).toBe("1st Jan");
  });

  it("should format timestamp correctly for 2nd January", () => {
    const timestamp = 1672666300;
    expect(formatTimestampToDate(timestamp)).toBe("2nd Jan");
  });

  it("should format timestamp correctly for 3rd January", () => {
    const timestamp = 1672766300;
    expect(formatTimestampToDate(timestamp)).toBe("3rd Jan");
  });

  it("should format timestamp correctly for 4th January", () => {
    const timestamp = 1672866300;
    expect(formatTimestampToDate(timestamp)).toBe("4th Jan");
  });

  it("should format timestamp correctly for 11th January", () => {
    const timestamp = 1673446300;
    expect(formatTimestampToDate(timestamp)).toBe("11th Jan");
  });

  it("should format timestamp correctly for 12th January", () => {
    const timestamp = 1673546300;
    expect(formatTimestampToDate(timestamp)).toBe("12th Jan");
  });

  it("should format timestamp correctly for 13th January", () => {
    const timestamp = 1673646300;
    expect(formatTimestampToDate(timestamp)).toBe("13th Jan");
  });

  it("should format timestamp correctly for 21st January", () => {
    const timestamp = 1674276300;
    expect(formatTimestampToDate(timestamp)).toBe("21st Jan");
  });

  it("should format timestamp correctly for 22nd January", () => {
    const timestamp = 1674376300;
    expect(formatTimestampToDate(timestamp)).toBe("22nd Jan");
  });

  it("should format timestamp correctly for 23rd January", () => {
    const timestamp = 1674476300;
    expect(formatTimestampToDate(timestamp)).toBe("23rd Jan");
  });
});
