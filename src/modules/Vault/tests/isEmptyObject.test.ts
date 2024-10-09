import { describe, it, expect } from "vitest";
import { isEmptyObject } from "../functions";

describe("isEmptyObject", () => {
  it("should return true for an object with all empty fields", () => {
    const obj = {
      name: "",
      age: null,
      items: [],
      details: {},
    };

    expect(isEmptyObject(obj)).toBe(true);
  });

  it("should return false if at least one field is not empty", () => {
    const obj = {
      name: "John",
      age: null,
      items: [],
      details: {},
    };

    expect(isEmptyObject(obj)).toBe(false);
  });

  it("should return true for an empty object", () => {
    const obj = {};

    expect(isEmptyObject(obj)).toBe(true);
  });

  it("should return false for an object with a non-empty array", () => {
    const obj = {
      name: "",
      age: null,
      items: [1],
      details: {},
    };

    expect(isEmptyObject(obj)).toBe(false);
  });

  it("should return false for an object with a nested non-empty object", () => {
    const obj = {
      name: "",
      age: null,
      items: [],
      details: { prop: "value" },
    };

    expect(isEmptyObject(obj)).toBe(false);
  });

  it("should return true for an object with fields set to undefined", () => {
    const obj = {
      name: undefined,
      age: undefined,
    };

    expect(isEmptyObject(obj)).toBe(true);
  });

  it("should return false if the object contains a number", () => {
    const obj = {
      name: "",
      age: 25,
    };

    expect(isEmptyObject(obj)).toBe(false);
  });
});
