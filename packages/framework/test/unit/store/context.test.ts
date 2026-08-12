// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { provideContext, useContext } from "../../../src/store/context/index";

type TestValue = {
  label: string;
  count: number;
};

describe("provideContext / useContext", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("creates a map store on the element and returns it", () => {
    const store = provideContext<TestValue>(container, {
      label: "a",
      count: 1,
    });
    expect(store.get()).toEqual({ label: "a", count: 1 });
  });

  it("returns the same store when called twice on the same element", () => {
    const first = provideContext<TestValue>(container, { label: "a", count: 1 });
    const second = provideContext<TestValue>(container, {
      label: "b",
      count: 2,
    });
    expect(second).toBe(first);
    // Second call's initial value is ignored; first store is preserved.
    expect(second.get()).toEqual({ label: "a", count: 1 });
  });

  it("uses a separate store per element", () => {
    const other = document.createElement("div");
    const a = provideContext<TestValue>(container, { label: "a", count: 1 });
    const b = provideContext<TestValue>(other, { label: "b", count: 2 });
    expect(b).not.toBe(a);
  });

  it("returns the closest ancestor's store matching the selector", () => {
    provideContext<TestValue>(container, { label: "root", count: 0 });
    const child = document.createElement("span");
    container.appendChild(child);
    const nested = document.createElement("span");
    child.appendChild(nested);

    const store = useContext<TestValue>(nested, "div");
    expect(store).toBeDefined();
    expect(store?.get()).toEqual({ label: "root", count: 0 });
  });

  it("returns undefined when no matching ancestor exists", () => {
    const orphan = document.createElement("span");
    const store = useContext<TestValue>(orphan, "div");
    expect(store).toBeUndefined();
  });
});
