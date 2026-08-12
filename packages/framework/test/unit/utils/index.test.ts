import { describe, expect, it } from "vitest";
import { generateId, getDataTags } from "../../../src/utils/index.js";

describe("generateId", () => {
  it("returns a 6-character hex string", () => {
    expect(generateId()).toMatch(/^[0-9a-f]{6}$/);
  });

  it("returns different values on each call", () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(8);
  });
});

describe("getDataTags", () => {
  it("maps included keys to data-prefix-key attributes", () => {
    const attrs = getDataTags(
      { id: "slide-1", title: "Intro", skipped: true },
      "component",
      ["id", "title"],
    );
    expect(attrs).toEqual({
      "data-component-id": "slide-1",
      "data-component-title": "Intro",
    });
  });

  it("returns an empty object when no keys are included", () => {
    expect(getDataTags({ id: "slide-1" }, "component", [])).toEqual({});
  });
});
