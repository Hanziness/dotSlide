import { describe, expect, it } from "vitest";
import { generateId } from "../../../src/utils/index.js";

describe("generateId", () => {
  it("returns a 6-character hex string", () => {
    expect(generateId()).toMatch(/^[0-9a-f]{6}$/);
  });

  it("returns different values on each call", () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(8);
  });
});
