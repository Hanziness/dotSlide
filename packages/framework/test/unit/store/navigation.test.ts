// @vitest-environment jsdom

import { NavigationType } from "@dotslide/protocol";
import { type MapStore, map } from "nanostores";
import { describe, expect, it } from "vitest";
import {
  createNavigationMethods,
  type NavigableContext,
} from "../../../src/store/context/navigation";

const makeStore = (index: number, length: number): MapStore<NavigableContext> =>
  map<NavigableContext>({
    navigationIndex: index,
    navigationSequence: Array.from({ length }, (_, i) => ({
      type: NavigationType.slide,
      slideIndex: i,
      stepIndex: 1,
      slideId: `slide-${i}`,
    })),
  });

describe("createNavigationMethods", () => {
  it("next() increments navigationIndex by 1", () => {
    const store = makeStore(1, 5);
    const methods = createNavigationMethods(store);
    methods.next();
    expect(store.get().navigationIndex).toBe(2);
  });

  it("next() clamps to sequence.length - 1", () => {
    const store = makeStore(4, 5);
    createNavigationMethods(store).next();
    expect(store.get().navigationIndex).toBe(4);
  });

  it("prev() decrements navigationIndex by 1", () => {
    const store = makeStore(3, 5);
    createNavigationMethods(store).prev();
    expect(store.get().navigationIndex).toBe(2);
  });

  it("prev() clamps to 0", () => {
    const store = makeStore(0, 5);
    createNavigationMethods(store).prev();
    expect(store.get().navigationIndex).toBe(0);
  });

  it("first() sets index to 0", () => {
    const store = makeStore(4, 5);
    createNavigationMethods(store).first();
    expect(store.get().navigationIndex).toBe(0);
  });

  it("last() sets index to sequence.length - 1", () => {
    const store = makeStore(0, 5);
    createNavigationMethods(store).last();
    expect(store.get().navigationIndex).toBe(4);
  });

  it("goTo(n) sets index to n", () => {
    const store = makeStore(0, 5);
    createNavigationMethods(store).goTo(3);
    expect(store.get().navigationIndex).toBe(3);
  });

  it("goTo(n) clamps n into range", () => {
    const store = makeStore(0, 5);
    const methods = createNavigationMethods(store);
    methods.goTo(-2);
    expect(store.get().navigationIndex).toBe(0);
    methods.goTo(99);
    expect(store.get().navigationIndex).toBe(4);
  });

  it("keeps index at 0 for an empty sequence", () => {
    const store = makeStore(0, 0);
    const methods = createNavigationMethods(store);
    methods.next();
    expect(store.get().navigationIndex).toBe(0);
    methods.prev();
    expect(store.get().navigationIndex).toBe(0);
    methods.first();
    expect(store.get().navigationIndex).toBe(0);
    methods.last();
    expect(store.get().navigationIndex).toBe(0);
    methods.goTo(7);
    expect(store.get().navigationIndex).toBe(0);
  });
});
