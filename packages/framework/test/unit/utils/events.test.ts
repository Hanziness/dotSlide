import { describe, expect, it } from "vitest";
import {
  RESOURCE_READY,
  RESOURCE_REGISTER,
} from "../../../src/utils/events.js";

describe("resource event constants", () => {
  it("RESOURCE_REGISTER equals ds:resource-register", () => {
    expect(RESOURCE_REGISTER).toBe("ds:resource-register");
  });

  it("RESOURCE_READY equals ds:resource-ready", () => {
    expect(RESOURCE_READY).toBe("ds:resource-ready");
  });
});
