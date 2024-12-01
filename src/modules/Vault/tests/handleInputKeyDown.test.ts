import { describe, it, expect, vi } from "vitest";
import { handleInputKeyDown } from "../functions";

describe("handleInputKeyDown", () => {
  it("should allow digits to be entered", () => {
    const preventDefault = vi.fn();
    const event = {
      key: "1",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLInputElement>;

    handleInputKeyDown(event, "");

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("should prevent multiple leading zeroes", () => {
    const preventDefault = vi.fn();
    const event = {
      key: "0",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLInputElement>;

    handleInputKeyDown(event, "0");

    expect(preventDefault).toHaveBeenCalled();
  });

  it("should allow a single decimal point", () => {
    const preventDefault = vi.fn();
    const event = {
      key: ".",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLInputElement>;

    handleInputKeyDown(event, "123");

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("should prevent multiple decimal points", () => {
    const preventDefault = vi.fn();
    const event = {
      key: ".",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLInputElement>;

    handleInputKeyDown(event, "123.");

    expect(preventDefault).toHaveBeenCalled();
  });

  it("should allow backspace and arrow keys", () => {
    const preventDefault = vi.fn();

    ["Backspace", "ArrowLeft", "ArrowRight"].forEach((key) => {
      const event = {
        key,
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      handleInputKeyDown(event, "123");

      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  it("should prevent invalid characters", () => {
    const preventDefault = vi.fn();
    const event = {
      key: "a",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLInputElement>;

    handleInputKeyDown(event, "123");

    expect(preventDefault).toHaveBeenCalled();
  });
});
