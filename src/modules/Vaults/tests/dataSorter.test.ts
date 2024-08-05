import { describe, it, expect } from "vitest";

import { dataSorter } from "../functions/dataSorter";

describe("dataSorter ", () => {
  it("should sort numbers in ascending order", () => {
    expect(dataSorter("1", "2", "number", "ascendentic")).toBeLessThan(0);
    expect(dataSorter("2", "1", "number", "ascendentic")).toBeGreaterThan(0);
    expect(dataSorter("1", "1", "number", "ascendentic")).toBe(0);
  });

  it("should sort numbers in descending order", () => {
    expect(dataSorter("1", "2", "number", "descendentic")).toBeGreaterThan(0);
    expect(dataSorter("2", "1", "number", "descendentic")).toBeLessThan(0);
    expect(dataSorter("1", "1", "number", "descendentic")).toBe(0);
  });

  it("should sort strings in ascending order", () => {
    expect(dataSorter("apple", "banana", "string", "ascendentic")).toBeLessThan(
      0
    );
    expect(
      dataSorter("banana", "apple", "string", "ascendentic")
    ).toBeGreaterThan(0);
    expect(dataSorter("apple", "apple", "string", "ascendentic")).toBe(0);
  });

  it("should sort strings in descending order", () => {
    expect(
      dataSorter("apple", "banana", "string", "descendentic")
    ).toBeGreaterThan(0);
    expect(
      dataSorter("banana", "apple", "string", "descendentic")
    ).toBeLessThan(0);
    expect(dataSorter("apple", "apple", "string", "descendentic")).toBe(0);
  });

  it("should return 0 for unknown data types", () => {
    expect(dataSorter("any", "thing", "unknown", "ascendentic")).toBe(0);
    expect(dataSorter("any", "thing", "unknown", "descendentic")).toBe(0);
  });
});
