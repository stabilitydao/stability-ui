import { describe, it, expect, beforeEach, vi } from "vitest";

import { initFilters } from "../functions/initFilters";

import type { TVault, TTableFilters } from "@types";

describe("initFilters", () => {
  const mockVaults: TVault[] = [
    { id: "1", strategyInfo: { shortId: "Strategy1" } },
    { id: "2", strategyInfo: { shortId: "Strategy2" } },
  ];
  const initialFilters: TTableFilters[] = [
    { name: "Strategy", type: "multiple", variants: [] },
    { name: "My Vaults", type: "single", state: false },
    { name: "Active", type: "single", state: false },
  ];
  let setTableFilters: ReturnType<typeof vi.fn>;
  let networksHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setTableFilters = vi.fn();
    networksHandler = vi.fn();
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: "",
      },
      writable: true,
    });
  });

  it("should initialize filters based on vaults data", () => {
    initFilters(mockVaults, initialFilters, setTableFilters, networksHandler);

    expect(setTableFilters).toHaveBeenCalledWith([
      {
        name: "Strategy",
        type: "multiple",
        variants: [
          { name: "Strategy1", state: false },
          { name: "Strategy2", state: false },
        ],
      },
      { name: "My Vaults", type: "single", state: false },
      { name: "Active", type: "single", state: false },
    ]);
  });

  it("should set filters based on URL parameters", () => {
    window.location.search =
      "?tags=myvaults&strategy=Strategy1&vaults=my&status=active&chain=eth";

    initFilters(mockVaults, initialFilters, setTableFilters, networksHandler);

    expect(setTableFilters).toHaveBeenCalledWith([
      {
        name: "Strategy",
        type: "multiple",
        variants: [
          { name: "Strategy1", state: true },
          { name: "Strategy2", state: false },
        ],
      },
      { name: "My Vaults", type: "single", state: true },
      { name: "Active", type: "single", state: true },
    ]);

    expect(networksHandler).toHaveBeenCalledWith(["eth"]);
  });

  it("should not call networksHandler if chainParam is absent", () => {
    window.location.search = "?tags=myvaults&strategy=Strategy1";

    initFilters(mockVaults, initialFilters, setTableFilters, networksHandler);

    expect(networksHandler).not.toHaveBeenCalled();
  });
});
