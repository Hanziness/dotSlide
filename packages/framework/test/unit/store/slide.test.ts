// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  createSlideContext,
  useSlideContext,
} from "../../../src/store/context/slide";

describe("createSlideContext / useSlideContext", () => {
  let slide: HTMLElement;

  beforeEach(() => {
    slide = document.createElement("ds-slide");
  });

  it("creates a store with the provided value", () => {
    const store = createSlideContext(slide, { index: 2 });
    expect(store.get()).toEqual({ index: 2 });
  });

  it("useSlideContext from a child inside the slide returns the store", () => {
    const store = createSlideContext(slide, { index: 2 });
    const child = document.createElement("span");
    slide.appendChild(child);

    const result = useSlideContext(child);
    expect(result).toBe(store);
    expect(result?.get()).toEqual({ index: 2 });
  });

  it("useSlideContext from outside the slide returns undefined", () => {
    createSlideContext(slide, { index: 2 });
    const orphan = document.createElement("span");
    expect(useSlideContext(orphan)).toBeUndefined();
  });
});
